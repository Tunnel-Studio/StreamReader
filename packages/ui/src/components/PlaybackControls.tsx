import React from 'react';
import { Play, Pause, Square, BookOpen, SkipBack, SkipForward } from 'lucide-react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleSplitView?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  splitViewActive?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Playback control buttons for the RSVP reader.
 */
export function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onToggleSplitView,
  onPrevious,
  onNext,
  splitViewActive = false,
  disabled = false,
  className = '',
}: PlaybackControlsProps) {
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: '2px solid var(--button-border, #2a2a4e)',
    backgroundColor: 'var(--button-bg, #1a1a2e)',
    color: 'var(--button-color, #e0e0e0)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'var(--button-active-bg, #3a3a6e)',
    borderColor: 'var(--button-active-border, #4a4a8e)',
  };

  return (
    <div
      className={`playback-controls ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Previous */}
      {onPrevious && (
        <button
          onClick={onPrevious}
          disabled={disabled}
          style={buttonStyle}
          title="Previous word"
          aria-label="Previous word"
        >
          <SkipBack size={20} />
        </button>
      )}

      {/* Stop/Reset */}
      <button
        onClick={onStop}
        disabled={disabled}
        style={buttonStyle}
        title="Stop and reset"
        aria-label="Stop and reset"
      >
        <Square size={20} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        style={{
          ...buttonStyle,
          width: '56px',
          height: '56px',
          backgroundColor: isPlaying
            ? 'var(--pause-bg, #ef4444)'
            : 'var(--play-bg, #22c55e)',
          borderColor: isPlaying
            ? 'var(--pause-border, #dc2626)'
            : 'var(--play-border, #16a34a)',
          color: '#ffffff',
        }}
        title={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '3px' }} />}
      </button>

      {/* Next */}
      {onNext && (
        <button
          onClick={onNext}
          disabled={disabled}
          style={buttonStyle}
          title="Next word"
          aria-label="Next word"
        >
          <SkipForward size={20} />
        </button>
      )}

      {/* Split View Toggle */}
      {onToggleSplitView && (
        <button
          onClick={onToggleSplitView}
          disabled={disabled}
          style={splitViewActive ? activeButtonStyle : buttonStyle}
          title="Toggle split view"
          aria-label="Toggle split view"
        >
          <BookOpen size={20} />
        </button>
      )}
    </div>
  );
}
