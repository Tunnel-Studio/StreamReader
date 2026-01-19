import ePub, { Book } from 'epubjs';
import type { Chapter } from '../types/index.js';
import type { DocumentParser, ParsedDocument } from './types.js';

/**
 * Parser for EPUB files
 */
export class EpubParser implements DocumentParser {
  supports(file: File | string): boolean {
    const name = typeof file === 'string' ? file : file.name;
    return name.toLowerCase().endsWith('.epub');
  }

  async parse(file: File | ArrayBuffer, filename?: string): Promise<ParsedDocument> {
    let arrayBuffer: ArrayBuffer;

    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
      filename = filename || file.name;
    } else {
      arrayBuffer = file;
    }

    const book = ePub(arrayBuffer);
    await book.ready;

    // Get metadata
    const metadata = await book.loaded.metadata;
    const title = metadata.title || filename?.replace(/\.epub$/i, '') || 'Untitled';
    const author = metadata.creator;

    // Get cover URL if available
    let coverUrl: string | undefined;
    try {
      const url = await book.coverUrl();
      coverUrl = url || undefined;
    } catch {
      // No cover available
    }

    // Extract chapters using the spine
    const chapters = await this.extractChapters(book);

    // If no chapters were extracted, try alternative method
    if (chapters.length === 0) {
      const fallbackChapters = await this.extractChaptersFallback(book);
      if (fallbackChapters.length > 0) {
        return {
          title,
          author,
          chapters: fallbackChapters,
          coverUrl,
        };
      }

      // Last resort - single chapter with error message
      chapters.push({
        id: 'chapter-1',
        title: 'Full Text',
        content: 'Unable to extract text content from this EPUB. The file may be DRM protected or use an unsupported format.',
        index: 0,
      });
    }

    return {
      title,
      author,
      chapters,
      coverUrl,
    };
  }

  private async extractChapters(book: Book): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    try {
      // Wait for spine to be loaded
      await book.loaded.spine;
      console.log('[EPUB] Spine loaded');

      // Get navigation for chapter titles
      const navigation = await book.loaded.navigation;
      const tocMap = this.buildTocMap(navigation.toc || []);
      console.log('[EPUB] TOC entries:', tocMap.size);

      // Get spine items
      const spine = book.spine;
      console.log('[EPUB] Spine object:', spine);

      // epub.js spine can be iterated with .each() or accessed via .items
      const spineItems: Array<{ href: string; index: number; idref: string }> = [];

      if (spine && typeof spine.each === 'function') {
        spine.each((item: { href: string; index: number; idref: string }) => {
          spineItems.push(item);
        });
      }

      console.log('[EPUB] Spine items found:', spineItems.length);

      // If no spine items via .each(), try .items directly
      if (spineItems.length === 0 && spine) {
        const items = (spine as unknown as { items?: Array<{ href: string; index: number; idref: string }> }).items;
        if (Array.isArray(items)) {
          spineItems.push(...items);
          console.log('[EPUB] Spine items via .items:', spineItems.length);
        }
      }

      // Process each spine item
      for (const item of spineItems) {
        try {
          console.log('[EPUB] Processing spine item:', item.href || item.idref);
          const section = book.section(item.href || item.idref);
          if (!section) {
            console.log('[EPUB] No section found for:', item.href || item.idref);
            continue;
          }

          // Load the section content
          const contents = await section.load(book.load.bind(book));
          console.log('[EPUB] Section contents type:', typeof contents, contents?.constructor?.name);

          // Extract text from the loaded content
          let textContent = '';

          if (contents instanceof Document) {
            textContent = this.extractTextFromDocument(contents);
          } else if (typeof contents === 'string') {
            textContent = this.extractTextFromHtml(contents);
          } else if (contents && typeof contents === 'object') {
            // Try to get document from contents
            const doc = (contents as { document?: Document }).document;
            if (doc) {
              textContent = this.extractTextFromDocument(doc);
            } else {
              // Try treating the object as an element
              const el = contents as Element;
              if (el.textContent) {
                textContent = this.cleanText(el.textContent);
              }
            }
          }

          console.log('[EPUB] Extracted text length:', textContent.length);

          if (textContent.trim()) {
            const chapterTitle = this.findChapterTitle(item.href, tocMap, chapters.length);

            chapters.push({
              id: `chapter-${chapters.length}`,
              title: chapterTitle,
              content: textContent,
              index: chapters.length,
            });
          }
        } catch (err) {
          console.warn(`[EPUB] Failed to load section:`, err);
        }
      }
    } catch (err) {
      console.warn('[EPUB] Error extracting chapters:', err);
    }

    console.log('[EPUB] Total chapters extracted:', chapters.length);
    return chapters;
  }

  private async extractChaptersFallback(book: Book): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    try {
      // Try using manifest directly
      await book.loaded.manifest;
      const manifest = book.packaging?.manifest;

      if (manifest && typeof manifest === 'object') {
        const items = Object.values(manifest) as Array<{ href: string; type?: string; 'media-type'?: string }>;
        const htmlItems = items.filter((item) => {
          const type = item.type || item['media-type'] || '';
          return type.includes('html') || type.includes('xhtml');
        });

        for (const item of htmlItems) {
          try {
            const content = await book.load(item.href);
            if (typeof content === 'string') {
              const textContent = this.extractTextFromHtml(content);
              if (textContent.trim().length > 50) { // Skip very short sections
                chapters.push({
                  id: `chapter-${chapters.length}`,
                  title: `Section ${chapters.length + 1}`,
                  content: textContent,
                  index: chapters.length,
                });
              }
            }
          } catch {
            // Skip failed resources
          }
        }
      }
    } catch (err) {
      console.warn('Fallback extraction failed:', err);
    }

    return chapters;
  }

  private buildTocMap(tocItems: Array<{ href?: string; label?: string; subitems?: unknown[] }>): Map<string, string> {
    const tocMap = new Map<string, string>();

    const flatten = (items: typeof tocItems): void => {
      for (const item of items) {
        if (item.href && item.label) {
          // Store both with and without fragment
          tocMap.set(item.href, item.label);
          const baseHref = item.href.split('#')[0];
          if (!tocMap.has(baseHref)) {
            tocMap.set(baseHref, item.label);
          }
        }
        if (item.subitems && Array.isArray(item.subitems)) {
          flatten(item.subitems as typeof tocItems);
        }
      }
    };

    flatten(tocItems);
    return tocMap;
  }

  private findChapterTitle(href: string, tocMap: Map<string, string>, index: number): string {
    // Try exact match
    if (tocMap.has(href)) {
      return tocMap.get(href)!;
    }

    // Try without fragment
    const baseHref = href.split('#')[0];
    if (tocMap.has(baseHref)) {
      return tocMap.get(baseHref)!;
    }

    // Try just the filename
    const filename = href.split('/').pop()?.split('#')[0];
    if (filename) {
      for (const [key, value] of tocMap) {
        if (key.endsWith(filename) || key.endsWith('/' + filename)) {
          return value;
        }
      }
    }

    return `Chapter ${index + 1}`;
  }

  private extractTextFromDocument(doc: Document): string {
    const body = doc.body || doc.documentElement;
    if (!body) return '';

    // Clone to avoid modifying original
    const clone = body.cloneNode(true) as HTMLElement;

    // Remove unwanted elements
    const removeSelectors = 'script, style, nav, aside, [role="navigation"]';
    clone.querySelectorAll(removeSelectors).forEach((el) => el.remove());

    // Get text content
    let text = clone.textContent || clone.innerText || '';

    return this.cleanText(text);
  }

  private extractTextFromHtml(html: string): string {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return this.extractTextFromDocument(doc);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/\n +/g, '\n')
      .replace(/ +\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
