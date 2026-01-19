import React from 'react';
import { FileText, Trash2, Clock, BookOpen } from 'lucide-react';
import type { DocumentMeta } from '@streamreader/core';

export interface LibraryProps {
  documents: DocumentMeta[];
  onDocumentSelect?: (doc: DocumentMeta) => void;
  onDocumentDelete?: (id: string) => void;
  onImportClick?: () => void;
  className?: string;
}

/**
 * Library view showing all imported documents.
 */
export function Library({
  documents,
  onDocumentSelect,
  onDocumentDelete,
  onImportClick,
  className = '',
}: LibraryProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatProgress = (meta: DocumentMeta) => {
    if (meta.lastPosition) {
      return `${Math.round(meta.lastPosition.progress * 100)}% complete`;
    }
    return 'Not started';
  };

  const getFileIcon = (fileType: DocumentMeta['fileType']) => {
    switch (fileType) {
      case 'epub':
        return <BookOpen size={24} />;
      case 'pdf':
        return <FileText size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  return (
    <div
      className={`library ${className}`}
      style={{
        padding: '24px',
        backgroundColor: 'var(--library-bg, #0a0a12)',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--library-title-color, #ffffff)',
            margin: 0,
          }}
        >
          Library
        </h2>
        {onImportClick && (
          <button
            onClick={onImportClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary-button-bg, #4f46e5)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Import Document
          </button>
        )}
      </div>

      {/* Document grid */}
      {documents.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <BookOpen size={64} style={{ color: 'var(--empty-icon-color, #3a3a5e)', marginBottom: '16px' }} />
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--empty-title-color, #a0a0a0)',
              marginBottom: '8px',
            }}
          >
            No documents yet
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--empty-text-color, #666)',
              marginBottom: '24px',
            }}
          >
            Import an EPUB, PDF, or TXT file to get started
          </p>
          {onImportClick && (
            <button
              onClick={onImportClick}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--primary-button-bg, #4f46e5)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Import Your First Document
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                backgroundColor: 'var(--card-bg, #1a1a2e)',
                borderRadius: '12px',
                border: '1px solid var(--card-border, #2a2a4e)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => onDocumentSelect?.(doc)}
            >
              {/* Card header with icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderBottom: '1px solid var(--card-border, #2a2a4e)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--icon-bg, #2a2a4e)',
                    color: 'var(--icon-color, #a0a0a0)',
                  }}
                >
                  {getFileIcon(doc.fileType)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--card-title-color, #ffffff)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.title}
                  </h3>
                  {doc.author && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--card-subtitle-color, #888)',
                        margin: 0,
                        marginTop: '2px',
                      }}
                    >
                      {doc.author}
                    </p>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '12px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: 'var(--card-meta-color, #888)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {formatDate(doc.addedAt)}
                  </span>
                  <span>{doc.totalWords.toLocaleString()} words</span>
                </div>

                {/* Progress */}
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--card-progress-color, #4f46e5)',
                  }}
                >
                  {formatProgress(doc)}
                </div>
              </div>

              {/* Delete button */}
              {onDocumentDelete && (
                <div
                  style={{
                    padding: '8px 16px',
                    borderTop: '1px solid var(--card-border, #2a2a4e)',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDocumentDelete(doc.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--delete-color, #ef4444)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
