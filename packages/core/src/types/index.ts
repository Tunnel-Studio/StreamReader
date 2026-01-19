// Document types
export interface Document {
  id: string;
  title: string;
  author?: string;
  chapters: Chapter[];
  metadata: DocumentMeta;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  index: number;
}

export interface DocumentMeta {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  fileType: 'epub' | 'pdf' | 'txt';
  totalWords: number;
  addedAt: number;
  lastReadAt?: number;
  lastPosition?: ReadingPosition;
}

export interface ReadingPosition {
  chapterIndex: number;
  wordIndex: number;
  progress: number; // 0-1
}

// RSVP types
export interface RSVPWord {
  text: string;
  orpIndex: number; // Optimal Recognition Point index
  delay: number; // Delay in ms before showing next word
}

export interface RSVPSettings {
  wpm: number;
  fontSize: number;
  boxWidth: number;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentWordIndex: number;
  words: string[];
}

// Reader store state
export interface ReaderState {
  // Playback
  isPlaying: boolean;
  currentWordIndex: number;
  wpm: number;

  // Document
  currentDocument: Document | null;
  currentChapterIndex: number;
  words: string[];

  // Settings
  fontSize: number;
  boxWidth: number;
  theme: 'light' | 'dark';

  // UI state
  showMenu: boolean;
  splitView: boolean;

  // Library
  library: DocumentMeta[];
}

export interface ReaderActions {
  // Playback
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  goToWord: (index: number) => void;
  nextWord: () => void;
  previousWord: () => void;

  // Document
  loadDocument: (doc: Document) => void;
  setChapter: (index: number) => void;
  clearDocument: () => void;

  // Settings
  setWpm: (wpm: number) => void;
  setFontSize: (size: number) => void;
  setBoxWidth: (width: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // UI
  toggleMenu: () => void;
  toggleSplitView: () => void;
  setShowMenu: (show: boolean) => void;

  // Library
  addToLibrary: (meta: DocumentMeta) => void;
  removeFromLibrary: (id: string) => void;
  updateLibraryItem: (id: string, updates: Partial<DocumentMeta>) => void;
}

export type ReaderStore = ReaderState & ReaderActions;
