// Mobile entry point for core
// We re-export everything EXCEPT the parsers that depend on Node/Browser APIs
// that break React Native (like pdfjs-dist, epubjs using browser XMLParser)

// RSVP Engine (Pure JS logic, safe)
export { RSVPEngine, calculateORP, calculateDelay, splitWordByORP } from './rsvp/index';
export type { RSVPCallback, RSVPEngineOptions } from './rsvp/index';

// Store (Zustand is platform agnostic)
export { useReaderStore } from './store/index';

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
} from './types/index';
