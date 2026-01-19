import type { Document, DocumentMeta } from '../types/index.js';
import type { DocumentParser } from './types.js';
import { TextParser } from './textParser.js';
import { EpubParser } from './epubParser.js';
import { PdfParser } from './pdfParser.js';

/**
 * Unified document parser that delegates to the appropriate parser
 * based on file type.
 */
export class UnifiedDocumentParser {
  private parsers: DocumentParser[];

  constructor() {
    this.parsers = [new TextParser(), new EpubParser(), new PdfParser()];
  }

  /**
   * Check if a file type is supported
   */
  supports(file: File | string): boolean {
    return this.parsers.some((parser) => parser.supports(file));
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.txt', '.epub', '.pdf'];
  }

  /**
   * Get MIME types for file input accept attribute
   */
  getAcceptTypes(): string {
    return '.txt,.epub,.pdf,text/plain,application/epub+zip,application/pdf';
  }

  /**
   * Parse a file and return a Document
   */
  async parse(file: File): Promise<Document> {
    const parser = this.parsers.find((p) => p.supports(file));

    if (!parser) {
      throw new Error(`Unsupported file type: ${file.name}`);
    }

    const parsed = await parser.parse(file, file.name);
    const id = this.generateId();

    // Calculate total words
    const totalWords = parsed.chapters.reduce((total, chapter) => {
      return total + chapter.content.split(/\s+/).filter((w) => w.length > 0).length;
    }, 0);

    return {
      id,
      title: parsed.title,
      author: parsed.author,
      chapters: parsed.chapters,
      metadata: {
        id,
        title: parsed.title,
        author: parsed.author,
        coverUrl: parsed.coverUrl,
        fileType: this.getFileType(file.name),
        totalWords,
        addedAt: Date.now(),
      },
    };
  }

  /**
   * Create document metadata without full parsing
   * Useful for library preview
   */
  async getMetadata(file: File): Promise<DocumentMeta> {
    const doc = await this.parse(file);
    return doc.metadata;
  }

  private generateId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFileType(filename: string): 'epub' | 'pdf' | 'txt' {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'epub':
        return 'epub';
      case 'pdf':
        return 'pdf';
      default:
        return 'txt';
    }
  }
}

// Export a singleton instance
export const documentParser = new UnifiedDocumentParser();
