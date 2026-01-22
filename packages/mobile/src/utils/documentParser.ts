import * as FileSystem from 'expo-file-system/legacy';
import ePub from 'epubjs';
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
   * Parse an EPUB file - simplified and optimized for React Native
   */
  async parseEpub(uri: string, filename: string): Promise<ParsedDocument> {
    try {
      console.log('[Mobile EPUB] Starting parse...');
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[Mobile EPUB] File read, size:', base64.length);
      
      // Convert base64 to ArrayBuffer - simplified
      const Buffer = require('buffer').Buffer;
      const buffer = Buffer.from(base64, 'base64');
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      console.log('[Mobile EPUB] Buffer created, initializing parser...');
      
      // Parse with epubjs - minimal approach
      const book = ePub(arrayBuffer);
      
      // Don't wait for full ready, just get what we can quickly
      let title = filename.replace(/\.epub$/i, '') || 'Untitled';
      let author: string | undefined;
      
      try {
        // Try to get metadata with short timeout
        await Promise.race([
          book.ready.then(async () => {
            const metadata = await book.loaded.metadata;
            title = metadata.title || title;
            author = metadata.creator;
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
        ]);
      } catch (err) {
        console.log('[Mobile EPUB] Metadata timeout, using filename');
      }

      console.log('[Mobile EPUB] Extracting text...');
      
      // Extract text in a simpler way
      const chapters = await this.extractEpubTextSimple(book, title);

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
      // Get spine - this is usually fast
      await Promise.race([
        book.loaded.spine,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
      ]);

      const spine = book.spine;
      const spineItems: any[] = [];

      // Try to get spine items
      if (spine && typeof spine.each === 'function') {
        spine.each((item: any) => spineItems.push(item));
      } else if (spine && spine.items) {
        spineItems.push(...spine.items);
      }

      console.log(`[Mobile EPUB] Processing ${spineItems.length} spine items`);

      // Limit to first 50 items for performance
      const itemsToProcess = spineItems.slice(0, 50);

      // Process each item with timeout
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        
        try {
          const section = book.spine.get(item.href || item.idref);
          if (!section) continue;

          // Load with timeout
          const contents = await Promise.race([
            section.load(book.load.bind(book)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
          ]);

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
          }

          // Unload to free memory
          if (section.unload) {
            section.unload();
          }

          // Log progress
          if (i % 5 === 0) {
            console.log(`[Mobile EPUB] Processed ${i + 1}/${itemsToProcess.length} items`);
          }
        } catch (err) {
          console.log(`[Mobile EPUB] Skipping item ${i}:`, err);
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
