import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FilePlus } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { documentParser, ParsedDocument } from '../utils/documentParser';

interface FileImportProps {
  onFileSelect: (document: ParsedDocument) => void;
}

export function FileImport({ onFileSelect }: FileImportProps) {
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/epub+zip',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        try {
          // Parse the document
          const parsedDoc = await documentParser.parse(file.uri, file.name);
          onFileSelect(parsedDoc);
        } catch (error) {
          console.error('Error parsing document:', error);
          Alert.alert(
            'Parse Error',
            `Failed to parse ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert(
        'Error',
        `Failed to pick document: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={pickDocument}
      disabled={loading}
    >
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.text}>Loading...</Text>
        </>
      ) : (
        <>
          <FilePlus size={32} color="#4f46e5" />
          <Text style={styles.text}>Import Document</Text>
          <Text style={styles.subText}>TXT, EPUB, or PDF</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 2,
    borderColor: '#2a2a4e',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    gap: 10,
    width: '100%',
  },
  text: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '500',
  },
  subText: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 4,
  },
});
