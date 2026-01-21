export interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  className?: string;
}

/**
 * Reading progress indicator.
 */
export function ProgressBar({
  current,
  total,
  showText = true,
  className = '',
}: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const percentage = Math.round(progress);

  return (
    <div
      className={`progress-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* Progress track */}
      <div
        style={{
          flex: 1,
          height: '6px',
          backgroundColor: 'var(--progress-track-bg, #2a2a4e)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--progress-fill, #4f46e5)',
            borderRadius: '3px',
            transition: 'width 0.15s ease',
          }}
        />
      </div>

      {/* Progress text */}
      {showText && (
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'ui-monospace, monospace',
            color: 'var(--progress-text-color, #a0a0a0)',
            minWidth: '100px',
            textAlign: 'right',
          }}
        >
          {current.toLocaleString()} / {total.toLocaleString()} ({percentage}%)
        </span>
      )}
    </div>
  );
}
