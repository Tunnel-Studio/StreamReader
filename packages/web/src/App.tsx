import React, { useState, useCallback, useEffect } from 'react';
import {
  WordDisplay,
  PlaybackControls,
  SpeedSlider,
  SizeController,
  Menu,
  Header,
  DocumentViewer,
  ProgressBar,
  Library,
  FileImport,
  useRSVP,
} from '@streamreader/ui';
import {
  useReaderStore,
  documentParser,
  type Document,
  type DocumentMeta,
} from '@streamreader/core';

type View = 'reader' | 'library' | 'import';

function App() {
  const [view, setView] = useState<View>('reader');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get store state and actions
  const {
    wpm,
    fontSize,
    boxWidth,
    showMenu,
    splitView,
    currentDocument,
    currentChapterIndex,
    words,
    currentWordIndex,
    library,
    setWpm,
    setFontSize,
    setBoxWidth,
    toggleMenu,
    setShowMenu,
    toggleSplitView,
    loadDocument,
    setChapter,
    addToLibrary,
    removeFromLibrary,
    goToWord,
  } = useReaderStore();

  // RSVP hook
  const rsvp = useRSVP({
    wpm,
    onComplete: () => {
      // Handle completion - maybe move to next chapter
    },
  });

  // Load words into RSVP when they change
  useEffect(() => {
    if (words.length > 0) {
      rsvp.loadWords(words);
    }
  }, [words]);

  // Sync store word index with RSVP
  useEffect(() => {
    goToWord(rsvp.currentIndex);
  }, [rsvp.currentIndex]);

  // Handle file import
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const doc = await documentParser.parse(file);
      loadDocument(doc);
      addToLibrary(doc.metadata);
      setView('reader');
    } catch (err) {
      console.error('Failed to parse document:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse document');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle library document selection
  const handleDocumentSelect = async (meta: DocumentMeta) => {
    // For now, we need to re-import the file
    // In a real app, you'd store the parsed document data
    setView('import');
  };

  // Handle chapter selection
  const handleChapterSelect = (index: number) => {
    rsvp.stop();
    setChapter(index);
  };

  // Get current chapter content for split view
  const currentChapterContent =
    currentDocument?.chapters[currentChapterIndex]?.content || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <Header
        title={currentDocument?.title || 'StreamReader'}
        onMenuClick={toggleMenu}
      />

      {/* Menu */}
      <Menu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        chapters={currentDocument?.chapters || []}
        currentChapterIndex={currentChapterIndex}
        onChapterSelect={handleChapterSelect}
        onLibraryClick={() => {
          setView('library');
          setShowMenu(false);
        }}
        onImportClick={() => {
          setView('import');
          setShowMenu(false);
        }}
        onSettingsClick={() => {
          // TODO: Settings view
          setShowMenu(false);
        }}
      />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {view === 'library' && (
          <Library
            documents={library}
            onDocumentSelect={handleDocumentSelect}
            onDocumentDelete={removeFromLibrary}
            onImportClick={() => setView('import')}
          />
        )}

        {view === 'import' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                Import Document
              </h2>

              {isLoading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Loading document...
                </div>
              ) : (
                <FileImport
                  onFileSelect={handleFileSelect}
                  acceptTypes={documentParser.getAcceptTypes()}
                />
              )}

              {error && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    color: 'var(--error-color)',
                  }}
                >
                  {error}
                </div>
              )}

              {library.length > 0 && (
                <button
                  onClick={() => setView('library')}
                  style={{
                    display: 'block',
                    margin: '24px auto 0',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Back to Library
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'reader' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: splitView ? 'row' : 'column',
              overflow: 'hidden',
            }}
          >
            {/* Reader panel */}
            <div
              style={{
                flex: splitView ? '0 0 50%' : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px',
                overflow: 'auto',
              }}
            >
              {/* Progress bar */}
              {words.length > 0 && (
                <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
                  <ProgressBar
                    current={rsvp.currentIndex + 1}
                    total={rsvp.totalWords}
                  />
                </div>
              )}

              {/* Word display */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                {words.length > 0 ? (
                  <WordDisplay
                    word={rsvp.currentWord}
                    fontSize={fontSize}
                    boxWidth={boxWidth}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '48px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <p style={{ fontSize: '18px', marginBottom: '16px' }}>
                      No document loaded
                    </p>
                    <button
                      onClick={() => setView('import')}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Import a Document
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              {words.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    marginTop: '24px',
                    width: '100%',
                    maxWidth: '600px',
                  }}
                >
                  {/* Playback controls */}
                  <PlaybackControls
                    isPlaying={rsvp.isPlaying}
                    onPlay={rsvp.play}
                    onPause={rsvp.pause}
                    onStop={rsvp.stop}
                    onPrevious={rsvp.previousWord}
                    onNext={rsvp.nextWord}
                    onToggleSplitView={toggleSplitView}
                    splitViewActive={splitView}
                  />

                  {/* Speed slider */}
                  <SpeedSlider
                    value={wpm}
                    onChange={(newWpm) => {
                      setWpm(newWpm);
                      rsvp.setWPM(newWpm);
                    }}
                    min={100}
                    max={800}
                    step={25}
                    label="Speed"
                    unit="WPM"
                  />

                  {/* Size controller */}
                  <SizeController
                    fontSize={fontSize}
                    boxWidth={boxWidth}
                    onFontSizeChange={setFontSize}
                    onBoxWidthChange={setBoxWidth}
                  />
                </div>
              )}
            </div>

            {/* Document viewer (split view) */}
            {splitView && words.length > 0 && (
              <DocumentViewer
                content={currentChapterContent}
                currentWordIndex={rsvp.currentIndex}
                words={words}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
