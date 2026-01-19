import { useEffect, useRef, useCallback, useState } from 'react';
import { RSVPEngine, splitWordByORP } from '@streamreader/core';
import type { RSVPWord } from '@streamreader/core';

export interface UseRSVPOptions {
  wpm?: number;
  onComplete?: () => void;
}

export interface UseRSVPReturn {
  currentWord: string;
  wordParts: { before: string; orp: string; after: string };
  currentIndex: number;
  totalWords: number;
  isPlaying: boolean;
  progress: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  goToIndex: (index: number) => void;
  nextWord: () => void;
  previousWord: () => void;
  setWPM: (wpm: number) => void;
  loadText: (text: string) => void;
  loadWords: (words: string[]) => void;
}

/**
 * React hook for managing RSVP playback.
 */
export function useRSVP(options: UseRSVPOptions = {}): UseRSVPReturn {
  const { wpm: initialWpm = 300, onComplete } = options;

  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const engineRef = useRef<RSVPEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    const engine = new RSVPEngine({
      wpm: initialWpm,
      onWord: (word: RSVPWord, index: number) => {
        setCurrentWord(word.text);
        setCurrentIndex(index);
      },
      onComplete: () => {
        setIsPlaying(false);
        onComplete?.();
      },
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Update WPM when it changes
  useEffect(() => {
    engineRef.current?.setWPM(initialWpm);
  }, [initialWpm]);

  const play = useCallback(() => {
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    engineRef.current?.toggle();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setCurrentWord('');
    setCurrentIndex(0);
  }, []);

  const goToIndex = useCallback((index: number) => {
    engineRef.current?.goToIndex(index);
  }, []);

  const nextWord = useCallback(() => {
    engineRef.current?.nextWord();
  }, []);

  const previousWord = useCallback(() => {
    engineRef.current?.previousWord();
  }, []);

  const setWPM = useCallback((wpm: number) => {
    engineRef.current?.setWPM(wpm);
  }, []);

  const loadText = useCallback((text: string) => {
    engineRef.current?.loadText(text);
    const state = engineRef.current?.getState();
    setTotalWords(state?.totalWords || 0);
    setCurrentIndex(0);
    setCurrentWord('');
  }, []);

  const loadWords = useCallback((words: string[]) => {
    engineRef.current?.loadWords(words);
    setTotalWords(words.length);
    setCurrentIndex(0);
    setCurrentWord('');
  }, []);

  const wordParts = splitWordByORP(currentWord);
  const progress = totalWords > 0 ? currentIndex / totalWords : 0;

  return {
    currentWord,
    wordParts,
    currentIndex,
    totalWords,
    isPlaying,
    progress,
    play,
    pause,
    toggle,
    stop,
    goToIndex,
    nextWord,
    previousWord,
    setWPM,
    loadText,
    loadWords,
  };
}
