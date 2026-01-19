// RSVP Engine
export { RSVPEngine, calculateORP, calculateDelay, splitWordByORP } from './rsvp/index.js';
export type { RSVPCallback, RSVPEngineOptions } from './rsvp/index.js';

// Store
export { useReaderStore, createReaderStore } from './store/index.js';

// Parsers
export { UnifiedDocumentParser, documentParser, TextParser, EpubParser, PdfParser } from './parsers/index.js';
export type { DocumentParser, ParsedDocument } from './parsers/index.js';

// Types
export type {
  Document,
  Chapter,
  DocumentMeta,
  ReadingPosition,
  RSVPWord,
  RSVPSettings,
  PlaybackState,
  ReaderState,
  ReaderActions,
  ReaderStore,
} from './types/index.js';
