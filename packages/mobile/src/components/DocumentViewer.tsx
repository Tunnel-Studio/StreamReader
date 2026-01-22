import React, { useRef, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DocumentViewerProps {
  content: string;
  currentWordIndex: number;
  words: string[];
  onWordClick?: (index: number) => void;
}

export function DocumentViewer({
  content,
  currentWordIndex,
  words,
  onWordClick,
}: DocumentViewerProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  if (!content || words.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.noContent}>No content loaded</Text>
      </ScrollView>
    );
  }

  // Render content with highlighted word
  const renderContent = () => {
    let wordCount = 0;
    const tokens = content.split(/(\s+)/);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Check if this is whitespace
      if (/^\s+$/.test(token)) {
        elements.push(<Text key={`space-${i}`}>{token}</Text>);
        continue;
      }

      // This is a word
      const currentIndex = wordCount;
      const isHighlighted = wordCount === currentWordIndex;

      elements.push(
        <Text
          key={`word-${i}`}
          onPress={() => onWordClick?.(currentIndex)}
          style={[
            styles.word,
            isHighlighted && styles.highlightedWord,
          ]}
        >
          {token}
        </Text>
      );

      wordCount++;
    }

    return elements;
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.text}>
        {renderContent()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  contentContainer: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 28,
    color: '#e0e0e0',
  },
  noContent: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    padding: 40,
  },
  word: {
    color: '#e0e0e0',
  },
  highlightedWord: {
    backgroundColor: '#fbbf24',
    color: '#1a1a2e',
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
