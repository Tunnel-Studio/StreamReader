import * as pdfjsLib from 'pdfjs-dist';
import type { Chapter } from '../types/index.js';
import type { DocumentParser, ParsedDocument } from './types.js';

// Set up the worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Parser for PDF files
 */
export class PdfParser implements DocumentParser {
  supports(file: File | string): boolean {
    const name = typeof file === 'string' ? file : file.name;
    return name.toLowerCase().endsWith('.pdf');
  }

  async parse(file: File | ArrayBuffer, filename?: string): Promise<ParsedDocument> {
    let arrayBuffer: ArrayBuffer;

    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
      filename = filename || file.name;
    } else {
      arrayBuffer = file;
    }

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    // Try to get metadata
    let title = filename?.replace(/\.pdf$/i, '') || 'Untitled';
    let author: string | undefined;

    try {
      const metadata = await pdf.getMetadata();
      if (metadata.info) {
        const info = metadata.info as Record<string, string>;
        title = info.Title || title;
        author = info.Author;
      }
    } catch {
      // Metadata not available
    }

    // Extract text from all pages
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Combine text items
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');

      pageTexts.push(pageText);
    }

    // Group pages into chapters
    // For now, we'll create chapters based on page ranges
    const chapters = this.createChapters(pageTexts);

    return {
      title,
      author,
      chapters,
    };
  }

  private createChapters(pageTexts: string[]): Chapter[] {
    const totalPages = pageTexts.length;

    // For small documents, treat as single chapter
    if (totalPages <= 5) {
      return [
        {
          id: 'chapter-1',
          title: 'Full Document',
          content: pageTexts.join('\n\n'),
          index: 0,
        },
      ];
    }

    // For larger documents, split into sections
    const chapters: Chapter[] = [];
    const pagesPerChapter = Math.ceil(totalPages / Math.min(10, Math.ceil(totalPages / 5)));

    for (let i = 0; i < totalPages; i += pagesPerChapter) {
      const endPage = Math.min(i + pagesPerChapter, totalPages);
      const chapterPages = pageTexts.slice(i, endPage);
      const chapterContent = chapterPages.join('\n\n');

      chapters.push({
        id: `chapter-${chapters.length + 1}`,
        title: `Pages ${i + 1}-${endPage}`,
        content: chapterContent,
        index: chapters.length,
      });
    }

    return chapters;
  }
}
