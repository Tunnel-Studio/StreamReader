import { User, BookOpen, Plus, Settings, X, ChevronRight } from 'lucide-react';
import type { Chapter } from '@streamreader/core';

export interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  chapters?: Chapter[];
  currentChapterIndex?: number;
  onChapterSelect?: (index: number) => void;
  onLibraryClick?: () => void;
  onImportClick?: () => void;
  onSettingsClick?: () => void;
  onAccountClick?: () => void;
  className?: string;
}

/**
 * Slide-out menu with table of contents and navigation options.
 */
export function Menu({
  isOpen,
  onClose,
  chapters = [],
  currentChapterIndex = 0,
  onChapterSelect,
  onLibraryClick,
  onImportClick,
  onSettingsClick,
  onAccountClick,
  className = '',
}: MenuProps) {
  if (!isOpen) return null;

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--menu-item-bg, #1a1a2e)',
    border: '1px solid var(--menu-item-border, #2a2a4e)',
    color: 'var(--menu-item-color, #e0e0e0)',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    width: '100%',
    textAlign: 'left',
  };

  const chapterItemStyle = (isActive: boolean): React.CSSProperties => ({
    ...menuItemStyle,
    backgroundColor: isActive
      ? 'var(--menu-item-active-bg, #2a2a5e)'
      : 'var(--menu-item-bg, transparent)',
    border: 'none',
    borderBottom: '1px solid var(--menu-divider, #2a2a4e)',
    borderRadius: 0,
    padding: '12px 16px',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
        }}
      />

      {/* Menu panel */}
      <div
        className={`menu-panel ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '320px',
          maxWidth: '85vw',
          backgroundColor: 'var(--menu-bg, #0f0f1a)',
          borderRight: '1px solid var(--menu-border, #2a2a4e)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--menu-border, #2a2a4e)',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--menu-title-color, #ffffff)',
              margin: 0,
            }}
          >
            Menu
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--menu-close-color, #a0a0a0)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Table of Contents */}
        {chapters.length > 0 && (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
            }}
          >
            <h3
              style={{
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--menu-section-color, #666)',
                marginBottom: '12px',
              }}
            >
              Table of Contents
            </h3>
            <div
              style={{
                backgroundColor: 'var(--menu-section-bg, #1a1a2e)',
                borderRadius: '8px',
                border: '1px solid var(--menu-item-border, #2a2a4e)',
                overflow: 'hidden',
              }}
            >
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onChapterSelect?.(index);
                    onClose();
                  }}
                  style={chapterItemStyle(index === currentChapterIndex)}
                >
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chapter.title}
                  </span>
                  <ChevronRight size={16} style={{ opacity: 0.5 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--menu-border, #2a2a4e)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {onAccountClick && (
            <button onClick={onAccountClick} style={menuItemStyle}>
              <User size={20} />
              Account
            </button>
          )}
          {onLibraryClick && (
            <button onClick={onLibraryClick} style={menuItemStyle}>
              <BookOpen size={20} />
              Library
            </button>
          )}
          {onImportClick && (
            <button onClick={onImportClick} style={menuItemStyle}>
              <Plus size={20} />
              Import New
            </button>
          )}
          {onSettingsClick && (
            <button onClick={onSettingsClick} style={menuItemStyle}>
              <Settings size={20} />
              Settings
            </button>
          )}
        </div>
      </div>
    </>
  );
}
