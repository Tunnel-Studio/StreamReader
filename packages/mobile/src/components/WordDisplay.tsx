import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { splitWordByORP } from '@streamreader/core';

interface WordDisplayProps {
  word: string;
  fontSize?: number;
}

export function WordDisplay({ word, fontSize = 42 }: WordDisplayProps) {
  const { before, orp, after } = splitWordByORP(word || '');

  return (
    <View style={styles.container}>
      {/* Top ORP Marker */}
      <View style={styles.orpMarker} />

      <View style={styles.wordContainer}>
        {word ? (
            <View style={styles.textWrapper}>
                <Text style={[styles.text, styles.textParts, { fontSize, textAlign: 'right' }]}>
                    {before}
                </Text>
                <Text style={[styles.text, { fontSize, color: '#ef4444', fontWeight: '700' }]}>
                    {orp}
                </Text>
                <Text style={[styles.text, styles.textParts, { fontSize, textAlign: 'left' }]}>
                    {after}
                </Text>
            </View>
        ) : (
          <Text style={[styles.text, { fontSize, opacity: 0.3 }]}>Ready</Text>
        )}
      </View>

      {/* Bottom ORP Marker */}
      <View style={styles.orpMarker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a4e',
    minHeight: 150,
    width: '100%',
  },
  wordContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: '#e0e0e0',
    fontFamily: 'Menlo', // Monospace font on iOS, needs verification for Android
  },
  textParts: {
    flex: 1,
    opacity: 0.7,
  },
  orpMarker: {
    width: 2,
    height: 12,
    backgroundColor: '#ef4444',
  },
});
