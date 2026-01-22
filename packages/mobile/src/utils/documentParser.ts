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
   * Parse an EPUB file - optimized for React Native
   */
  async parseEpub(uri: string, filename: string): Promise<ParsedDocument> {
    try {
      console.log('Starting EPUB parse...');
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('File read as base64, converting to buffer...');
      
      // Convert base64 to ArrayBuffer
      const Buffer = require('buffer').Buffer;
      const buffer = Buffer.from(base64, 'base64');
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      console.log('Initializing EPUB parser...');
      
      // Parse with epubjs - use simpler method
      const book = ePub(arrayBuffer);
      
      // Get metadata quickly without waiting for full ready
      const title = filename.replace(/\.epub$/i, '') || 'Untitled';
      let author: string | undefined;
      
      try {
        await Promise.race([
          book.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        const metadata = await book.loaded.metadata;
        author = metadata.creator;
      } catch (err) {
        console.log('Metadata load timeout, using filename as title');
      }

      console.log('Extracting chapters...');
      
      // Extract chapters with timeout
      const chapters = await Promise.race([
        this.extractEpubChapters(book),
        new Promise<Chapter[]>((resolve) => 
          setTimeout(() => resolve([{
            id: 'chapter-1',
            title: 'Full Text',
            content: 'EPUB is loading... This may take a moment for large files.',
            index: 0,
          }]), 10000)
        )
      ]);

      console.log(`EPUB parsing complete, ${chapters.length} chapters extracted`);

      return {
        title,
        author,
        chapters,
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error(`Failed to parse EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract chapters from EPUB
   */
  private async extractEpubChapters(book: any): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    try {
      await book.loaded.spine;
      const navigation = await book.loaded.navigation;
      const tocMap = this.buildTocMap(navigation.toc || []);

      const spine = book.spine;
      const spineItems: Array<{ href: string; index: number; idref: string }> = [];

      if (spine && typeof spine.each === 'function') {
        spine.each((item: { href: string; index: number; idref: string }) => {
          spineItems.push(item);
        });
      }

      // Process each spine item
      for (let i = 0; i < spineItems.length; i++) {
        const item = spineItems[i];
        
        try {
          const section = book.spine.get(item.href);
          if (!section) continue;

          const doc = await section.load(book.load.bind(book));
          
          // Extract text using a simpler approach
          let textContent = '';
          if (doc && doc.body) {
            textContent = this.extractTextFromHTML(doc.body.innerHTML || '');
          }
          
          if (textContent.trim().length > 0) {
            const chapterTitle = tocMap.get(item.href) || `Chapter ${chapters.length + 1}`;
            
            chapters.push({
              id: `chapter-${chapters.length + 1}`,
              title: chapterTitle,
              content: textContent,
              index: chapters.length,
            });
          }

          section.unload();
        } catch (error) {
          console.error(`Error processing spine item ${i}:`, error);
        }
      }

      if (chapters.length === 0) {
        chapters.push({
          id: 'chapter-1',
          title: 'Full Text',
          content: 'Unable to extract text content from this EPUB.',
          index: 0,
        });
      }

      return chapters;
    } catch (error) {
      console.error('Error extracting EPUB chapters:', error);
      return [
        {
          id: 'chapter-1',
          title: 'Full Text',
          content: 'Error extracting EPUB content.',
          index: 0,
        },
      ];
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
