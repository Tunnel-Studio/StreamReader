import { useState, useEffect } from 'react';
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
    library,
    setWpm,
    setFontSize,
    setBoxWidth,
    toggleMenu,
    setShowMenu,
    toggleSplitView,
    loadDocument,
    addToLibrary,
    removeDocument,
    saveDocument,
    getDocument,
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
      // In Electron, we might be able to get the file path and read it directly
      // but the web parser accepts a File object which is also available in Electron
      // when using <input type="file">.
      const doc = await documentParser.parse(file);
      saveDocument(doc); // Save full document to storage
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
  const handleDocumentSelect = (meta: DocumentMeta) => {
    const doc = getDocument(meta.id);
    if (doc) {
      rsvp.stop();
      loadDocument(doc);
      setView('reader');
      setShowMenu(false);
    }
  };

  const handleLibraryClick = () => {
    rsvp.stop();
    setView('library');
    setShowMenu(false);
  };

  const handleImportClick = () => {
    rsvp.stop();
    setView('import');
    setShowMenu(false);
  };

  return (
    <div className={`app-container ${showMenu ? 'menu-open' : ''}`}>
      <Header
        onMenuClick={toggleMenu}
        title={currentDocument?.metadata.title}
      />
      
      <Menu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onLibraryClick={handleLibraryClick}
        onImportClick={handleImportClick}
        chapters={currentDocument?.chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterSelect={(_index) => {
            // Logic to change chapter
        }}
      />
      {/* Settings controls that were in Menu might need to be placed elsewhere or Menu component updated */}
       {showMenu && (
        <div className="settings-panel" style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            background: 'var(--menu-bg)',
            border: '1px solid var(--border-primary)',
            padding: '20px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <h3>Settings</h3>
             <SizeController
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                boxWidth={boxWidth}
                onBoxWidthChange={setBoxWidth}
             />
             <button onClick={toggleSplitView}>
                {splitView ? 'Hide Text' : 'Show Text'}
             </button>
        </div>
      )}

      <main className="main-content">
        {view === 'reader' && (
          <div className={`reader-view ${splitView ? 'split' : ''}`}>
            <div className="rsvp-section">
              <div className="reader-container">
                <WordDisplay
                  word={rsvp.currentWord}
                  fontSize={fontSize}
                  boxWidth={boxWidth}
                />
                <PlaybackControls
                  isPlaying={rsvp.isPlaying}
                  onPlay={rsvp.play}
                  onPause={rsvp.pause}
                  onStop={rsvp.stop}
                />
                <div className="controls-row">
                    <SpeedSlider value={wpm} onChange={setWpm} />
                </div>
                {currentDocument && (
                  <ProgressBar
                    current={rsvp.currentIndex}
                    total={words.length}
                  />
                )}
              </div>
            </div>
            
            {(splitView && currentDocument) && (
               <div className="document-section">
                 <DocumentViewer
                    content={currentDocument.chapters[currentChapterIndex]?.content || ''}
                    currentWordIndex={rsvp.currentIndex}
                    words={words}
                 />
               </div>
            )}
          </div>
        )}

        {view === 'library' && (
          <Library
            documents={library}
            onDocumentSelect={handleDocumentSelect}
            onDocumentDelete={removeDocument}
          />
        )}

        {view === 'import' && (
          <div className="import-view">
            <h2>Import Document</h2>
            <FileImport onFileSelect={handleFileSelect} />
            {isLoading && <div className="loading-message">Loading...</div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
