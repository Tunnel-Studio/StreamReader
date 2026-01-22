import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RSVPEngine, splitWordByORP } from '@streamreader/core';
import type { RSVPWord } from '@streamreader/core';

export interface UseRSVPOptions {
  wpm?: number;
  onComplete?: () => void;
}

export function useRSVP(options: UseRSVPOptions = {}) {
  const { wpm: initialWpm = 300, onComplete } = options;

  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const engineRef = useRef<RSVPEngine | null>(null);

  useEffect(() => {
    const engine = new RSVPEngine({
      wpm: initialWpm,
      onWord: (word: RSVPWord, index: number) => {
        setCurrentWord(word.text);
        setCurrentIndex(index);
      },
      onComplete: () => {
        setIsPlaying(false);
        if (onComplete) onComplete();
      },
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
    });
    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setWPM(initialWpm);
    }
  }, [initialWpm]);

  const togglePlay = () => {
    if (!engineRef.current) return;
    
    // We don't manually set state here, we rely on callbacks
    if (isPlaying) {
      engineRef.current.pause();
    } else {
      engineRef.current.play();
    }
  };

  return {
    currentWord,
    currentIndex,
    isPlaying,
    togglePlay,
    stop: () => {
      engineRef.current?.stop();
    },
    loadWords: (words: string[]) => {
      if (engineRef.current) {
        engineRef.current.loadWords(words);
      }
    },
    seek: (index: number) => {
      engineRef.current?.goToIndex(index);
    }
  };
}
