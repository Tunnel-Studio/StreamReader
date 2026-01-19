import React from 'react';

export interface SizeControllerProps {
  fontSize: number;
  boxWidth: number;
  onFontSizeChange: (size: number) => void;
  onBoxWidthChange: (width: number) => void;
  className?: string;
}

/**
 * Controls for adjusting the word display size and box width.
 */
export function SizeController({
  fontSize,
  boxWidth,
  onFontSizeChange,
  onBoxWidthChange,
  className = '',
}: SizeControllerProps) {
  const fontSizes = [
    { label: 'S', value: 32 },
    { label: 'M', value: 48 },
    { label: 'L', value: 64 },
    { label: 'XL', value: 80 },
  ];

  const boxWidths = [
    { label: 'Narrow', value: 350 },
    { label: 'Medium', value: 500 },
    { label: 'Wide', value: 650 },
  ];

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid var(--button-border, #2a2a4e)',
    backgroundColor: isActive
      ? 'var(--button-active-bg, #4f46e5)'
      : 'var(--button-bg, #1a1a2e)',
    color: isActive ? '#ffffff' : 'var(--button-color, #e0e0e0)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  });

  return (
    <div
      className={`size-controller ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Font Size */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--label-color, #a0a0a0)',
            marginBottom: '8px',
          }}
        >
          Font Size
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {fontSizes.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onFontSizeChange(value)}
              style={buttonStyle(fontSize === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Box Width */}
      <div>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--label-color, #a0a0a0)',
            marginBottom: '8px',
          }}
        >
          Box Width
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {boxWidths.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onBoxWidthChange(value)}
              style={buttonStyle(boxWidth === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
