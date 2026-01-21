import { splitWordByORP } from '@streamreader/core';

export interface WordDisplayProps {
  word: string;
  fontSize?: number;
  boxWidth?: number;
  className?: string;
}

/**
 * Displays a word with the ORP (Optimal Recognition Point) highlighted.
 * The ORP is shown in a contrasting color to help the eye focus.
 */
export function WordDisplay({
  word,
  fontSize = 48,
  boxWidth = 500,
  className = '',
}: WordDisplayProps) {
  const { before, orp, after } = splitWordByORP(word || '');

  return (
    <div
      className={`word-display ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: boxWidth,
        minHeight: fontSize * 2.5,
        padding: '1.5rem 2rem',
        backgroundColor: 'var(--word-display-bg, #1a1a2e)',
        borderRadius: '12px',
        border: '2px solid var(--word-display-border, #2a2a4e)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Focus line indicator */}
      <div
        style={{
          width: '2px',
          height: '12px',
          backgroundColor: 'var(--orp-color, #ef4444)',
          marginBottom: '8px',
        }}
      />

      {/* Word container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: `${fontSize}px`,
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: 'var(--word-color, #e0e0e0)',
          minHeight: fontSize * 1.2,
        }}
      >
        {word ? (
          <>
            <span style={{ flex: 1, textAlign: 'right', opacity: 0.7 }}>{before}</span>
            <span
              style={{
                color: 'var(--orp-color, #ef4444)',
                fontWeight: 700,
                padding: '0 1px',
              }}
            >
              {orp}
            </span>
            <span style={{ flex: 1, textAlign: 'left', opacity: 0.7 }}>{after}</span>
          </>
        ) : (
          <span style={{ flex: 1, textAlign: 'center', opacity: 0.3 }}>Ready</span>
        )}
      </div>

      {/* Focus line indicator bottom */}
      <div
        style={{
          width: '2px',
          height: '12px',
          backgroundColor: 'var(--orp-color, #ef4444)',
          marginTop: '8px',
        }}
      />
    </div>
  );
}
