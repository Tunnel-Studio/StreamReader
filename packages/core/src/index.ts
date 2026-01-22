// RSVP Engine
export { RSVPEngine, calculateORP, calculateDelay, splitWordByORP } from './rsvp/index';
export type { RSVPCallback, RSVPEngineOptions } from './rsvp/index';

// Store
export { useReaderStore, createReaderStore } from './store/index';

// Parsers
export { UnifiedDocumentParser, documentParser, TextParser, EpubParser, PdfParser } from './parsers/index';
export type { DocumentParser, ParsedDocument } from './parsers/index';

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
