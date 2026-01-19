import React from 'react';

export interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  unit?: string;
  className?: string;
}

/**
 * Slider control for adjusting playback speed (WPM) or other numeric values.
 */
export function SpeedSlider({
  value,
  onChange,
  min = 100,
  max = 800,
  step = 25,
  label = 'Speed',
  showValue = true,
  unit = 'WPM',
  className = '',
}: SpeedSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={`speed-slider ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        maxWidth: '300px',
      }}
    >
      {/* Label and value */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: 'var(--label-color, #a0a0a0)',
        }}
      >
        <span>{label}</span>
        {showValue && (
          <span
            style={{
              fontWeight: 600,
              color: 'var(--value-color, #e0e0e0)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {value} {unit}
          </span>
        )}
      </div>

      {/* Slider */}
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={{
            width: '100%',
            height: '8px',
            appearance: 'none',
            backgroundColor: 'var(--slider-track-bg, #2a2a4e)',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
            background: `linear-gradient(to right, var(--slider-fill, #4f46e5) 0%, var(--slider-fill, #4f46e5) ${percentage}%, var(--slider-track-bg, #2a2a4e) ${percentage}%, var(--slider-track-bg, #2a2a4e) 100%)`,
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--minmax-color, #666)',
        }}
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
