import React, { useEffect, useRef } from 'react';

export interface DocumentViewerProps {
  content: string;
  currentWordIndex: number;
  words: string[];
  className?: string;
}

/**
 * Displays the full document text with the current word highlighted.
 * Used in split-screen mode.
 */
export function DocumentViewer({
  content,
  currentWordIndex,
  words,
  className = '',
}: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  // Scroll to keep the highlighted word visible
  useEffect(() => {
    if (highlightRef.current && containerRef.current) {
      const container = containerRef.current;
      const highlight = highlightRef.current;

      const containerRect = container.getBoundingClientRect();
      const highlightRect = highlight.getBoundingClientRect();

      // Check if highlight is outside visible area
      if (
        highlightRect.top < containerRect.top + 100 ||
        highlightRect.bottom > containerRect.bottom - 100
      ) {
        highlight.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentWordIndex]);

  // Render content with highlighted word
  const renderContent = () => {
    if (!content || words.length === 0) {
      return <span style={{ opacity: 0.5 }}>No content loaded</span>;
    }

    // Build highlighted content
     // const currentWord = words[currentWordIndex];
    let wordCount = 0;
    let foundHighlight = false;

    // Split content by whitespace while preserving structure
    const parts: React.ReactNode[] = [];
    const tokens = content.split(/(\s+)/);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Check if this is whitespace
      if (/^\s+$/.test(token)) {
        parts.push(token);
        continue;
      }

      // This is a word
      if (wordCount === currentWordIndex && !foundHighlight) {
        foundHighlight = true;
        parts.push(
          <span
            key={`word-${i}`}
            ref={highlightRef}
            style={{
              backgroundColor: 'var(--highlight-bg, #fbbf24)',
              color: 'var(--highlight-color, #1a1a2e)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {token}
          </span>
        );
      } else {
        parts.push(token);
      }

      wordCount++;
    }

    return parts;
  };

  return (
    <div
      ref={containerRef}
      className={`document-viewer ${className}`}
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        backgroundColor: 'var(--viewer-bg, #0f0f1a)',
        borderLeft: '1px solid var(--viewer-border, #2a2a4e)',
        fontSize: '16px',
        lineHeight: 1.8,
        color: 'var(--viewer-text-color, #c0c0c0)',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
