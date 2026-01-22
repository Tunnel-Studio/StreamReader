import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type { Chapter } from '@streamreader/core';

export interface ParsedDocument {
  title: string;
  author?: string;
  chapters: Chapter[];
  coverUrl?: string;
}

/**
 * Mobile-specific document parser
 * Uses legacy FileSystem API and React Native compatible libraries
 */
export class MobileDocumentParser {
  /**
   * Parse a text file
   */
  async parseText(uri: string, filename: string): Promise<ParsedDocument> {
    const content = await FileSystem.readAsStringAsync(uri);
    
    return {
      title: filename.replace(/\.txt$/i, ''),
      chapters: [
        {
          id: 'chapter-1',
          title: 'Full Text',
          content,
          index: 0,
        },
      ],
    };
  }

  /**
   * Parse an EPUB file using JSZip (much faster than epubjs in React Native)
   */
  async parseEpub(uri: string, filename: string): Promise<ParsedDocument> {
    try {
      console.log('[Mobile EPUB] Starting JSZip parse...');
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[Mobile EPUB] File read, size:', base64.length);
      
      // Load ZIP file
      const zip = await JSZip.loadAsync(base64, { base64: true });
      console.log('[Mobile EPUB] ZIP loaded');

      // Create XML parser
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });

      // Find and parse container.xml to get the content.opf path
      const containerXml = await zip.file('META-INF/container.xml')?.async('string');
      if (!containerXml) {
        throw new Error('Invalid EPUB: Missing container.xml');
      }

      const containerData = parser.parse(containerXml);
      const rootfile = containerData.container.rootfiles.rootfile;
      const rootfilePath = Array.isArray(rootfile) ? rootfile[0]['full-path'] : rootfile['full-path'];
      console.log('[Mobile EPUB] Content OPF path:', rootfilePath);

      // Parse content.opf
      const opfContent = await zip.file(rootfilePath)?.async('string');
      if (!opfContent) {
        throw new Error('Invalid EPUB: Missing content.opf');
      }

      const opfData = parser.parse(opfContent);
      const metadata = opfData.package.metadata;
      
      // Extract metadata
      const dcTitle = metadata['dc:title'];
      const dcCreator = metadata['dc:creator'];
      
      const title = (typeof dcTitle === 'string' ? dcTitle : dcTitle?.['#text'] || dcTitle) || 
                    filename.replace(/\.epub$/i, '') || 'Untitled';
      
      // Handle author - can be string, object with #text, or array of either
      let author: string | undefined;
      if (typeof dcCreator === 'string') {
        author = dcCreator;
      } else if (Array.isArray(dcCreator)) {
        // Join multiple authors
        author = dcCreator
          .map((c: any) => typeof c === 'string' ? c : c?.['#text'] || '')
          .filter(Boolean)
          .join(', ');
      } else if (dcCreator?.['#text']) {
        author = dcCreator['#text'];
      }
      
      console.log('[Mobile EPUB] Title:', title, 'Author:', author);

      // Get spine (reading order)
      let spine = opfData.package.spine.itemref;
      if (!Array.isArray(spine)) {
        spine = [spine];
      }
      
      let manifest = opfData.package.manifest.item;
      if (!Array.isArray(manifest)) {
        manifest = [manifest];
      }
      
      // Build manifest map
      const manifestMap: Record<string, any> = {};
      manifest.forEach((item: any) => {
        manifestMap[item.id] = item;
      });

      console.log('[Mobile EPUB] Spine items:', spine.length);

      // Extract content directory (where the OPF file is located)
      const contentDir = rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1);

      const chapters: Chapter[] = [];

      // Process each spine item
      for (let i = 0; i < spine.length; i++) {
        const spineItem = spine[i];
        const idref = spineItem.idref;
        const manifestItem = manifestMap[idref];

        if (!manifestItem || !manifestItem.href) {
          console.log(`[Mobile EPUB] Skipping item ${i}: no manifest entry`);
          continue;
        }

        const href = contentDir + manifestItem.href;
        console.log(`[Mobile EPUB] Processing ${i + 1}/${spine.length}: ${href}`);

        try {
          const htmlContent = await zip.file(href)?.async('string');
          if (!htmlContent) {
            console.log(`[Mobile EPUB] No content for ${href}`);
            continue;
          }

          // Extract text from HTML
          const text = this.extractTextFromHTML(htmlContent);
          
          if (text && text.trim().length > 50) {
            chapters.push({
              id: `chapter-${chapters.length + 1}`,
              title: `Chapter ${chapters.length + 1}`,
              content: text,
              index: chapters.length,
            });
            console.log(`[Mobile EPUB] Chapter ${chapters.length} extracted (${text.length} chars)`);
          }
        } catch (err) {
          console.log(`[Mobile EPUB] Error processing ${href}:`, err);
        }
      }

      if (chapters.length === 0) {
        chapters.push({
          id: 'chapter-1',
          title: 'Full Text',
          content: 'Unable to extract text from this EPUB.',
          index: 0,
        });
      }

      console.log(`[Mobile EPUB] Complete! ${chapters.length} chapters extracted`);

      return {
        title,
        author,
        chapters,
      };
    } catch (error) {
      console.error('[Mobile EPUB] Error:', error);
      throw new Error(`Failed to parse EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simplified EPUB text extraction
   */
  private async extractEpubTextSimple(book: any, fallbackTitle: string): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    try {
      console.log('[Mobile EPUB] Loading spine...');
      await book.loaded.spine;

      const spine = book.spine;
      const spineItems: any[] = [];

      // Get spine items
      if (spine && typeof spine.each === 'function') {
        spine.each((item: any) => spineItems.push(item));
      } else if (spine && spine.items) {
        spineItems.push(...spine.items);
      }

      console.log(`[Mobile EPUB] Processing ${spineItems.length} spine items`);

      // Process each item WITHOUT timeout
      for (let i = 0; i < spineItems.length; i++) {
        const item = spineItems[i];
        
        try {
          console.log(`[Mobile EPUB] Loading item ${i + 1}/${spineItems.length}...`);
          
          const section = book.spine.get(item.href || item.idref);
          if (!section) {
            console.log(`[Mobile EPUB] No section for item ${i}`);
            continue;
          }

          // Load section WITHOUT timeout - just let it complete
          const contents = await section.load(book.load.bind(book));

          // Extract text
          let text = '';
          if (contents && contents.innerHTML) {
            text = this.extractTextFromHTML(contents.innerHTML);
          } else if (contents && contents.body && contents.body.innerHTML) {
            text = this.extractTextFromHTML(contents.body.innerHTML);
          } else if (typeof contents === 'string') {
            text = this.extractTextFromHTML(contents);
          }

          if (text && text.trim().length > 50) {
            chapters.push({
              id: `chapter-${chapters.length + 1}`,
              title: `Chapter ${chapters.length + 1}`,
              content: text,
              index: chapters.length,
            });
            console.log(`[Mobile EPUB] Chapter ${chapters.length} extracted (${text.length} chars)`);
          }

          // Unload to free memory
          if (section.unload) {
            section.unload();
          }
        } catch (err) {
          console.log(`[Mobile EPUB] Error loading item ${i}:`, err);
        }
      }

      if (chapters.length === 0) {
        chapters.push({
          id: 'chapter-1',
          title: 'Full Text',
          content: 'Unable to extract text from this EPUB. The file may be protected or in an unsupported format.',
          index: 0,
        });
      }

      return chapters;
    } catch (error) {
      console.error('[Mobile EPUB] Extraction error:', error);
      return [{
        id: 'chapter-1',
        title: 'Error',
        content: 'Failed to extract EPUB content. The file may be corrupted or protected.',
        index: 0,
      }];
    }
  }

  private buildTocMap(toc: any[]): Map<string, string> {
    const map = new Map<string, string>();

    const processTocItem = (item: any) => {
      if (item.href && item.label) {
        const href = item.href.split('#')[0];
        map.set(href, item.label);
      }
      if (item.subitems) {
        item.subitems.forEach(processTocItem);
      }
    };

    toc.forEach(processTocItem);
    return map;
  }

  private extractTextFromElement(element: Element): string {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textParts: string[] = [];
    let node;

    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text) {
        textParts.push(text);
      }
    }

    return textParts.join(' ');
  }

  /**
   * Extract text from HTML string (simple regex-based approach for React Native)
   */
  private extractTextFromHTML(html: string): string {
    // Remove script and style tags with content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove all HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * Parse a PDF file
   * Note: Full PDF text extraction requires native modules which have deployment target issues
   * For now, we return a message indicating limited support
   */
  async parsePdf(uri: string, filename: string): Promise<ParsedDocument> {
    return {
      title: filename.replace(/\.pdf$/i, ''),
      chapters: [
        {
          id: 'chapter-1',
          title: 'PDF Support',
          content: 'PDF text extraction is currently not available on mobile. Please convert your PDF to EPUB or TXT format for the best reading experience. You can use online converters like Calibre or CloudConvert.',
          index: 0,
        },
      ],
    };
  }

  /**
   * Parse any supported document
   */
  async parse(uri: string, filename: string): Promise<ParsedDocument> {
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.txt')) {
      return this.parseText(uri, filename);
    } else if (lowerName.endsWith('.epub')) {
      return this.parseEpub(uri, filename);
    } else if (lowerName.endsWith('.pdf')) {
      return this.parsePdf(uri, filename);
    } else {
      throw new Error('Unsupported file format');
    }
  }
}

export const documentParser = new MobileDocumentParser();
