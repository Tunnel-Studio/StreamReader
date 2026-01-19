import type { Chapter } from '../types/index.js';
import type { DocumentParser, ParsedDocument } from './types.js';

/**
 * Parser for plain text files (.txt)
 */
export class TextParser implements DocumentParser {
  supports(file: File | string): boolean {
    const name = typeof file === 'string' ? file : file.name;
    return name.toLowerCase().endsWith('.txt');
  }

  async parse(file: File | ArrayBuffer, filename?: string): Promise<ParsedDocument> {
    let text: string;

    if (file instanceof File) {
      text = await file.text();
      filename = filename || file.name;
    } else {
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(file);
    }

    // Extract title from filename
    const title = filename ? filename.replace(/\.txt$/i, '') : 'Untitled';

    // Split into chapters if there are clear chapter markers
    const chapters = this.extractChapters(text);

    return {
      title,
      chapters,
    };
  }

  private extractChapters(text: string): Chapter[] {
    // Look for common chapter patterns
    const chapterPattern = /^(?:chapter|part|section)\s+(?:\d+|[ivxlcdm]+)[\s:.-]*/gim;
    const parts = text.split(chapterPattern);

    if (parts.length <= 1) {
      // No chapters found, treat entire text as one chapter
      return [
        {
          id: 'chapter-1',
          title: 'Full Text',
          content: text.trim(),
          index: 0,
        },
      ];
    }

    // Find all chapter titles
    const matches = text.match(chapterPattern) || [];

    const chapters: Chapter[] = [];

    // First part before any chapter marker
    if (parts[0].trim()) {
      chapters.push({
        id: 'chapter-0',
        title: 'Preface',
        content: parts[0].trim(),
        index: 0,
      });
    }

    // Remaining chapters
    for (let i = 1; i < parts.length; i++) {
      const chapterTitle = matches[i - 1]?.trim() || `Chapter ${i}`;
      chapters.push({
        id: `chapter-${i}`,
        title: chapterTitle,
        content: parts[i].trim(),
        index: chapters.length,
      });
    }

    return chapters;
  }
}
