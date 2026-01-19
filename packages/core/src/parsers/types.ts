import type { Chapter } from '../types/index.js';

export interface ParsedDocument {
  title: string;
  author?: string;
  chapters: Chapter[];
  coverUrl?: string;
}

export interface DocumentParser {
  parse(file: File | ArrayBuffer, filename?: string): Promise<ParsedDocument>;
  supports(file: File | string): boolean;
}
