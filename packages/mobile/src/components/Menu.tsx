import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, BookOpen, Plus, List } from 'lucide-react-native';
import type { Chapter } from '@streamreader/core';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  chapters?: Chapter[];
  currentChapterIndex?: number;
  onChapterSelect?: (index: number) => void;
  onLibraryClick?: () => void;
  onImportClick?: () => void;
}

export function Menu({
  visible,
  onClose,
  chapters = [],
  currentChapterIndex = 0,
  onChapterSelect,
  onLibraryClick,
  onImportClick,
}: MenuProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.menuPanel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#e0e0e0" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Navigation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Navigation</Text>
              
              {onLibraryClick && (
                <TouchableOpacity style={styles.menuItem} onPress={onLibraryClick}>
                  <BookOpen size={20} color="#4f46e5" />
                  <Text style={styles.menuItemText}>Library</Text>
                </TouchableOpacity>
              )}
              
              {onImportClick && (
                <TouchableOpacity style={styles.menuItem} onPress={onImportClick}>
                  <Plus size={20} color="#4f46e5" />
                  <Text style={styles.menuItemText}>Import Document</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Table of Contents */}
            {chapters.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Table of Contents</Text>
                {chapters.map((chapter, index) => (
                  <TouchableOpacity
                    key={chapter.id}
                    style={[
                      styles.chapterItem,
                      index === currentChapterIndex && styles.chapterItemActive,
                    ]}
                    onPress={() => {
                      onChapterSelect?.(index);
                      onClose();
                    }}
                  >
                    <List size={16} color={index === currentChapterIndex ? '#4f46e5' : '#808080'} />
                    <Text
                      style={[
                        styles.chapterText,
                        index === currentChapterIndex && styles.chapterTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {chapter.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  menuPanel: {
    backgroundColor: '#0f0f1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#2a2a4e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  chapterItemActive: {
    backgroundColor: '#1a1a3e',
  },
  chapterText: {
    fontSize: 15,
    color: '#e0e0e0',
    flex: 1,
  },
  chapterTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
