import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Document, DocumentMeta, ReaderStore } from '../types/index.js';

const DEFAULT_WPM = 300;
const DEFAULT_FONT_SIZE = 48;
const DEFAULT_BOX_WIDTH = 500;

export const createReaderStore = () =>
  create<ReaderStore>()(
    persist(
      (set, get) => ({
        // Initial state
        isPlaying: false,
        currentWordIndex: 0,
        wpm: DEFAULT_WPM,
        currentDocument: null,
        currentChapterIndex: 0,
        words: [],
        fontSize: DEFAULT_FONT_SIZE,
        boxWidth: DEFAULT_BOX_WIDTH,
        theme: 'dark',
        showMenu: false,
        splitView: false,
        library: [],

        // Playback actions
        play: () => set({ isPlaying: true }),
        pause: () => set({ isPlaying: false }),
        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
        reset: () => set({ currentWordIndex: 0, isPlaying: false }),
        goToWord: (index: number) => {
          const { words } = get();
          if (index >= 0 && index < words.length) {
            set({ currentWordIndex: index });
          }
        },
        nextWord: () => {
          const { currentWordIndex, words } = get();
          if (currentWordIndex < words.length - 1) {
            set({ currentWordIndex: currentWordIndex + 1 });
          }
        },
        previousWord: () => {
          const { currentWordIndex } = get();
          if (currentWordIndex > 0) {
            set({ currentWordIndex: currentWordIndex - 1 });
          }
        },

        // Document actions
        loadDocument: (doc: Document) => {
          // Find first substantial chapter (skip cover, title pages, etc.)
          let chapterIndex = 0;
          for (let i = 0; i < doc.chapters.length; i++) {
            const wordCount = tokenize(doc.chapters[i].content).length;
            if (wordCount > 100) {
              chapterIndex = i;
              break;
            }
          }
          const chapter = doc.chapters[chapterIndex];
          const words = chapter ? tokenize(chapter.content) : [];
          set({
            currentDocument: doc,
            currentChapterIndex: chapterIndex,
            words,
            currentWordIndex: 0,
            isPlaying: false,
          });
        },
        setChapter: (index: number) => {
          const { currentDocument } = get();
          if (!currentDocument || index < 0 || index >= currentDocument.chapters.length) {
            return;
          }
          const chapter = currentDocument.chapters[index];
          const words = tokenize(chapter.content);
          set({
            currentChapterIndex: index,
            words,
            currentWordIndex: 0,
            isPlaying: false,
          });
        },
        clearDocument: () =>
          set({
            currentDocument: null,
            currentChapterIndex: 0,
            words: [],
            currentWordIndex: 0,
            isPlaying: false,
          }),

        // Settings actions
        setWpm: (wpm: number) => set({ wpm: Math.max(50, Math.min(1500, wpm)) }),
        setFontSize: (fontSize: number) => set({ fontSize: Math.max(16, Math.min(96, fontSize)) }),
        setBoxWidth: (boxWidth: number) => set({ boxWidth: Math.max(200, Math.min(1000, boxWidth)) }),
        setTheme: (theme: 'light' | 'dark') => set({ theme }),

        // UI actions
        toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),
        toggleSplitView: () => set((state) => ({ splitView: !state.splitView })),
        setShowMenu: (show: boolean) => set({ showMenu: show }),

        // Library actions
        addToLibrary: (meta: DocumentMeta) =>
          set((state) => {
            // Check if already exists
            if (state.library.some((item) => item.id === meta.id)) {
              return state;
            }
            return { library: [...state.library, meta] };
          }),
        removeFromLibrary: (id: string) =>
          set((state) => ({
            library: state.library.filter((item) => item.id !== id),
          })),
        updateLibraryItem: (id: string, updates: Partial<DocumentMeta>) =>
          set((state) => ({
            library: state.library.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          })),
      }),
      {
        name: 'streamreader-storage',
        storage: createJSONStorage(() => {
          // Use localStorage in browser, or a fallback for SSR
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        partialize: (state) => ({
          // Only persist these fields
          wpm: state.wpm,
          fontSize: state.fontSize,
          boxWidth: state.boxWidth,
          theme: state.theme,
          library: state.library,
        }),
      }
    )
  );

// Helper function to tokenize text into words
function tokenize(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

// Create a default store instance
export const useReaderStore = createReaderStore();
