import React from 'react';
import { Menu as MenuIcon } from 'lucide-react';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  className?: string;
}

/**
 * App header with hamburger menu and title.
 */
export function Header({ title = 'StreamReader', onMenuClick, className = '' }: HeaderProps) {
  return (
    <header
      className={`header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        backgroundColor: 'var(--header-bg, #0f0f1a)',
        borderBottom: '1px solid var(--header-border, #2a2a4e)',
      }}
    >
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '2px solid var(--button-border, #2a2a4e)',
            backgroundColor: 'var(--button-bg, #1a1a2e)',
            color: 'var(--button-color, #e0e0e0)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </button>
      )}

      <h1
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--header-title-color, #ffffff)',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {title}
      </h1>
    </header>
  );
}
