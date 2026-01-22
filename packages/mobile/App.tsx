import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useReaderStore } from '@streamreader/core';
import type { DocumentMeta } from '@streamreader/core';
import { WordDisplay } from './src/components/WordDisplay';
import { PlaybackControls } from './src/components/PlaybackControls';
import { FileImport } from './src/components/FileImport';
import { Menu } from './src/components/Menu';
import { Library } from './src/components/Library';
import { SpeedSlider } from './src/components/SpeedSlider';
import { SizeController } from './src/components/SizeController';
import { useRSVP } from './src/hooks/useRSVP';
import type { ParsedDocument } from './src/utils/documentParser';
import { Menu as MenuIcon } from 'lucide-react-native';

// Import polyfills for EPUB.js and other libraries
import './src/polyfills';

type AppView = 'reader' | 'library' | 'import';

export default function App() {
  const [view, setView] = useState<AppView>('import');
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    wpm,
    fontSize,
    currentDocument,
    currentChapterIndex,
    words,
    library,
    setWpm,
    setFontSize,
    loadDocument,
    setChapter,
    addToLibrary,
    removeDocument,
    saveDocument,
    getDocument,
    goToWord,
  } = useReaderStore();

  const rsvp = useRSVP({
    wpm,
  });

  // Load words when they change
  useEffect(() => {
    if (words.length > 0) {
      rsvp.loadWords(words);
    }
  }, [words]);

  // Sync word index
  useEffect(() => {
    goToWord(rsvp.currentIndex);
  }, [rsvp.currentIndex]);

  // Handle parsed document
  const handleFileSelect = async (parsedDoc: ParsedDocument) => {
    setIsLoading(true);
    try {
      // Convert to full document format
      const docId = `doc-${Date.now()}`;
      const doc = {
        id: docId,
        title: parsedDoc.title,
        author: parsedDoc.author,
        metadata: {
          id: docId,
          title: parsedDoc.title,
          author: parsedDoc.author,
          fileType: parsedDoc.title.toLowerCase().endsWith('.epub') ? 'epub' as const : 'txt' as const,
          totalWords: parsedDoc.chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).length, 0),
          addedAt: Date.now(),
        },
        chapters: parsedDoc.chapters,
      };
      
      saveDocument(doc);
      loadDocument(doc);
      addToLibrary(doc.metadata);
      setView('reader');
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = (meta: DocumentMeta) => {
    const doc = getDocument(meta.id);
    if (doc) {
      rsvp.stop();
      loadDocument(doc);
      setView('reader');
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {view === 'reader' && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
                <MenuIcon size={24} color="#e0e0e0" />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{currentDocument?.metadata.title || 'StreamReader'}</Text>
                {currentDocument?.metadata.author && (
                  <Text style={styles.authorText} numberOfLines={1}>{currentDocument.metadata.author}</Text>
                )}
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Reader Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              <WordDisplay word={rsvp.currentWord} fontSize={fontSize} />
              
              <View style={styles.controls}>
                <PlaybackControls 
                  isPlaying={rsvp.isPlaying}
                  onToggle={rsvp.togglePlay}
                  onReset={() => {
                    rsvp.stop();
                    rsvp.seek(0);
                  }}
                />
              </View>

              <View style={styles.settings}>
                <SpeedSlider value={wpm} onChange={setWpm} />
                <View style={{ height: 20 }} />
                <SizeController fontSize={fontSize} onFontSizeChange={setFontSize} />
              </View>
            </ScrollView>

            {/* Menu */}
            <Menu
              visible={showMenu}
              onClose={() => setShowMenu(false)}
              chapters={currentDocument?.chapters}
              currentChapterIndex={currentChapterIndex}
              onChapterSelect={(index) => {
                rsvp.stop();
                setChapter(index);
              }}
              onLibraryClick={handleLibraryClick}
              onImportClick={handleImportClick}
            />
          </>
        )}

        {view === 'library' && (
          <Library
            documents={library}
            onDocumentSelect={handleDocumentSelect}
            onDocumentDelete={removeDocument}
            onImportClick={handleImportClick}
          />
        )}

        {view === 'import' && (
          <View style={styles.importView}>
            <Text style={styles.importTitle}>StreamReader</Text>
            <FileImport onFileSelect={handleFileSelect} />
            {library.length > 0 && (
              <TouchableOpacity style={styles.libraryLink} onPress={handleLibraryClick}>
                <Text style={styles.libraryLinkText}>View Library</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  menuButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 4,
  },
  authorText: {
    color: '#808080',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  readerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controls: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  settings: {
    width: '100%',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  importView: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  libraryLink: {
    marginTop: 24,
    padding: 12,
  },
  libraryLinkText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
});
