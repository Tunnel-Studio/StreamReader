import { calculateDelay, calculateORP, splitWordByORP } from './orp.js';
import type { RSVPWord } from '../types/index.js';

export type RSVPCallback = (word: RSVPWord, index: number) => void;

export interface RSVPEngineOptions {
  wpm: number;
  onWord?: RSVPCallback;
  onComplete?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
}

/**
 * RSVP (Rapid Serial Visual Presentation) Engine
 *
 * Controls the timed display of words for speed reading.
 * Handles playback, pausing, word navigation, and timing adjustments.
 */
export class RSVPEngine {
  private words: string[] = [];
  private currentIndex = 0;
  private wpm: number;
  private isPlaying = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private onWord?: RSVPCallback;
  private onComplete?: () => void;
  private onPause?: () => void;
  private onPlay?: () => void;

  constructor(options: RSVPEngineOptions) {
    this.wpm = options.wpm;
    this.onWord = options.onWord;
    this.onComplete = options.onComplete;
    this.onPause = options.onPause;
    this.onPlay = options.onPlay;
  }

  /**
   * Load words into the engine
   */
  loadWords(words: string[]): void {
    this.words = words;
    this.currentIndex = 0;
    this.stop();
  }

  /**
   * Load text and automatically tokenize into words
   */
  loadText(text: string): void {
    const words = this.tokenize(text);
    this.loadWords(words);
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (this.isPlaying) return;
    if (this.currentIndex >= this.words.length) return;

    this.isPlaying = true;
    this.onPlay?.();
    this.scheduleNextWord();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.onPause?.();
  }

  /**
   * Toggle play/pause state
   */
  toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.pause();
    this.currentIndex = 0;
  }

  /**
   * Reset to beginning without stopping
   */
  reset(): void {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentIndex = 0;
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Go to a specific word index
   */
  goToIndex(index: number): void {
    if (index < 0 || index >= this.words.length) return;

    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentIndex = index;

    // Show the word at the new position
    this.emitCurrentWord();

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Move to the next word without waiting
   */
  nextWord(): void {
    if (this.currentIndex < this.words.length - 1) {
      this.goToIndex(this.currentIndex + 1);
    }
  }

  /**
   * Move to the previous word
   */
  previousWord(): void {
    if (this.currentIndex > 0) {
      this.goToIndex(this.currentIndex - 1);
    }
  }

  /**
   * Set words per minute
   */
  setWPM(wpm: number): void {
    this.wpm = Math.max(50, Math.min(1500, wpm));
  }

  /**
   * Get current WPM
   */
  getWPM(): number {
    return this.wpm;
  }

  /**
   * Get current playback state
   */
  getState(): { isPlaying: boolean; currentIndex: number; totalWords: number; progress: number } {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      totalWords: this.words.length,
      progress: this.words.length > 0 ? this.currentIndex / this.words.length : 0,
    };
  }

  /**
   * Get the current word
   */
  getCurrentWord(): RSVPWord | null {
    if (this.currentIndex >= this.words.length) return null;

    const word = this.words[this.currentIndex];
    return {
      text: word,
      orpIndex: calculateORP(word),
      delay: calculateDelay(word, this.wpm),
    };
  }

  /**
   * Get word parts split by ORP
   */
  getCurrentWordParts(): { before: string; orp: string; after: string } | null {
    const word = this.words[this.currentIndex];
    if (!word) return null;
    return splitWordByORP(word);
  }

  /**
   * Schedule the next word display
   */
  private scheduleNextWord(): void {
    if (!this.isPlaying) return;
    if (this.currentIndex >= this.words.length) {
      this.isPlaying = false;
      this.onComplete?.();
      return;
    }

    const word = this.words[this.currentIndex];
    const delay = calculateDelay(word, this.wpm);

    // Emit the current word
    this.emitCurrentWord();

    // Schedule next word
    this.timeoutId = setTimeout(() => {
      this.currentIndex++;
      this.scheduleNextWord();
    }, delay);
  }

  /**
   * Emit the current word via callback
   */
  private emitCurrentWord(): void {
    const rsvpWord = this.getCurrentWord();
    if (rsvpWord && this.onWord) {
      this.onWord(rsvpWord, this.currentIndex);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.words = [];
    this.onWord = undefined;
    this.onComplete = undefined;
    this.onPause = undefined;
    this.onPlay = undefined;
  }
}
