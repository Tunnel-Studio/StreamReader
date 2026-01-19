import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export interface FileImportProps {
  onFileSelect: (file: File) => void;
  acceptTypes?: string;
  className?: string;
}

/**
 * File import component with drag-and-drop support.
 */
export function FileImport({
  onFileSelect,
  acceptTypes = '.txt,.epub,.pdf,text/plain,application/epub+zip,application/pdf',
  className = '',
}: FileImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.txt', '.epub', '.pdf'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(extension)) {
      setError(`Unsupported file type. Please use ${validExtensions.join(', ')}`);
      return false;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    setError(null);
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`file-import ${className}`}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          borderRadius: '12px',
          border: `2px dashed ${
            isDragging
              ? 'var(--dropzone-active-border, #4f46e5)'
              : 'var(--dropzone-border, #3a3a5e)'
          }`,
          backgroundColor: isDragging
            ? 'var(--dropzone-active-bg, rgba(79, 70, 229, 0.1))'
            : 'var(--dropzone-bg, #1a1a2e)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {selectedFile ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <FileText size={32} style={{ color: 'var(--success-color, #22c55e)' }} />
              <div>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-color, #e0e0e0)',
                    margin: 0,
                  }}
                >
                  {selectedFile.name}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted, #888)',
                    margin: 0,
                    marginTop: '4px',
                  }}
                >
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--button-secondary-bg, #2a2a4e)',
                color: 'var(--button-secondary-color, #e0e0e0)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
              Clear
            </button>
          </>
        ) : (
          <>
            <Upload
              size={48}
              style={{
                color: isDragging
                  ? 'var(--dropzone-active-icon, #4f46e5)'
                  : 'var(--dropzone-icon, #4a4a6e)',
                marginBottom: '16px',
              }}
            />
            <p
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-color, #e0e0e0)',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {isDragging ? 'Drop your file here' : 'Drag & drop a file here'}
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-muted, #888)',
                margin: 0,
              }}
            >
              or click to browse
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #666)',
                margin: 0,
                marginTop: '16px',
              }}
            >
              Supports EPUB, PDF, and TXT files
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--error-bg, rgba(239, 68, 68, 0.1))',
            border: '1px solid var(--error-border, #ef4444)',
            color: 'var(--error-color, #ef4444)',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
