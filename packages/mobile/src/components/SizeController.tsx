import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SizeControllerProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function SizeController({ fontSize, onFontSizeChange }: SizeControllerProps) {
  const fontSizes = [
    { label: 'S', value: 32 },
    { label: 'M', value: 42 },
    { label: 'L', value: 52 },
    { label: 'XL', value: 64 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Font Size</Text>
      <View style={styles.buttonRow}>
        {fontSizes.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.button,
              fontSize === value && styles.buttonActive,
            ]}
            onPress={() => onFontSizeChange(value)}
          >
            <Text
              style={[
                styles.buttonText,
                fontSize === value && styles.buttonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2a2a4e',
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4338ca',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
});
