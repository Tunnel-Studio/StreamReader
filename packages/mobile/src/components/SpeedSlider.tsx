import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SpeedSlider({
  value,
  onChange,
  min = 100,
  max = 800,
  step = 25,
}: SpeedSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Speed</Text>
        <Text style={styles.value}>{value} WPM</Text>
      </View>
      
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#4f46e5"
        maximumTrackTintColor="#2a2a4e"
        thumbTintColor="#4f46e5"
      />
      
      <View style={styles.labels}>
        <Text style={styles.labelText}>{min}</Text>
        <Text style={styles.labelText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#666',
  },
});
