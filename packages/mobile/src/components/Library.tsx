import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FileText, Trash2, BookOpen, Plus } from 'lucide-react-native';
import type { DocumentMeta } from '@streamreader/core';

interface LibraryProps {
  documents: DocumentMeta[];
  onDocumentSelect?: (doc: DocumentMeta) => void;
  onDocumentDelete?: (id: string) => void;
  onImportClick?: () => void;
}

export function Library({
  documents,
  onDocumentSelect,
  onDocumentDelete,
  onImportClick,
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

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDocumentDelete?.(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        {onImportClick && (
          <TouchableOpacity style={styles.importButton} onPress={onImportClick}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Document List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#4a4a5e" />
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyText}>
              Import your first document to get started
            </Text>
            {onImportClick && (
              <TouchableOpacity style={styles.emptyButton} onPress={onImportClick}>
                <Text style={styles.emptyButtonText}>Import Document</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => onDocumentSelect?.(doc)}
              >
                <View style={styles.iconContainer}>
                  {doc.fileType === 'epub' ? (
                    <BookOpen size={24} color="#4f46e5" />
                  ) : (
                    <FileText size={24} color="#4f46e5" />
                  )}
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  {doc.author && (
                    <Text style={styles.cardAuthor} numberOfLines={1}>
                      {doc.author}
                    </Text>
                  )}
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>{formatProgress(doc)}</Text>
                    {doc.addedAt && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>{formatDate(doc.addedAt)}</Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(doc.id, doc.title)}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e0e0e0',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#808080',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2a2a4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  deleteButton: {
    padding: 16,
  },
});
