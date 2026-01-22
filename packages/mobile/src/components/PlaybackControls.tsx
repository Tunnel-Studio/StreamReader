import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, Columns2 } from 'lucide-react-native';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
  onReset: () => void;
  disabled?: boolean;
  onToggleSplitView?: () => void;
  splitViewActive?: boolean;
}

export function PlaybackControls({ 
  isPlaying, 
  onToggle, 
  onReset, 
  disabled,
  onToggleSplitView,
  splitViewActive = false,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onReset}
        disabled={disabled}
      >
        <RotateCcw size={24} color="#e0e0e0" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.playButton]} 
        onPress={onToggle}
        disabled={disabled}
      >
        {isPlaying ? (
          <Pause size={32} color="#ffffff" fill="#ffffff" />
        ) : (
          <Play size={32} color="#ffffff" fill="#ffffff" />
        )}
      </TouchableOpacity>

      {onToggleSplitView && (
        <TouchableOpacity 
          style={[
            styles.button,
            splitViewActive && styles.buttonActive,
          ]} 
          onPress={onToggleSplitView}
          disabled={disabled}
        >
          <Columns2 size={24} color={splitViewActive ? '#4f46e5' : '#e0e0e0'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  buttonActive: {
    backgroundColor: '#2a2a4e',
    borderColor: '#4f46e5',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    borderColor: '#4338ca',
  },
});
