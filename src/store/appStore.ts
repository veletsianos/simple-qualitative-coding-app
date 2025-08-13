import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { get, set } from 'idb-keyval';
import { AppStore, QualitativeDocument, Segment } from '../types';
import { exportToCSV } from '../utils/csvExport';

const STORAGE_KEY = 'qualitative-coding-app';

export const useAppStore = create<AppStore>()((set, get) => ({
  // Initial state
  document: null,
  segments: [],
  tags: [],
  studentIdentifier: '',
  dirty: false,
  selectedSegmentId: null,
  filterTag: null,

  // Actions
  setDocument: (doc: QualitativeDocument) => {
    set({
      document: doc,
      segments: [], // Clear segments when new document is loaded
      tags: [],
      dirty: true,
      selectedSegmentId: null,
      filterTag: null
    });
  },

  addSegment: (segment: Omit<Segment, 'id' | 'createdAt'>) => {
    const state = get();
    
    // Validate segment limit
    if (state.segments.length >= 10) {
      throw new Error('Maximum 10 segments allowed per document');
    }

    // Check for overlaps within the same paragraph
    const overlappingSegment = state.segments.find(s => 
      s.paragraphIndex === segment.paragraphIndex &&
      ((segment.startChar >= s.startChar && segment.startChar < s.endChar) ||
       (segment.endChar > s.startChar && segment.endChar <= s.endChar) ||
       (segment.startChar <= s.startChar && segment.endChar >= s.endChar))
    );

    if (overlappingSegment) {
      throw new Error('Segment overlaps with existing segment');
    }

    const newSegment: Segment = {
      ...segment,
      id: nanoid(),
      createdAt: new Date().toISOString()
    };

    // Add unique tags to the tags array
    const newTags = segment.tags.filter(tag => !state.tags.includes(tag));
    
    set({
      segments: [...state.segments, newSegment],
      tags: [...state.tags, ...newTags],
      dirty: true,
      selectedSegmentId: newSegment.id
    });
  },

  updateSegment: (id: string, updates: Partial<Segment>) => {
    const state = get();
    const segmentIndex = state.segments.findIndex(s => s.id === id);
    
    if (segmentIndex === -1) return;

    const updatedSegment = { ...state.segments[segmentIndex], ...updates };
    const newSegments = [...state.segments];
    newSegments[segmentIndex] = updatedSegment;

    // Update tags if they were modified
    let newTags = [...state.tags];
    if (updates.tags) {
      const allTags = new Set(state.tags);
      updates.tags.forEach(tag => allTags.add(tag));
      newTags = Array.from(allTags);
    }

    set({
      segments: newSegments,
      tags: newTags,
      dirty: true
    });
  },

  deleteSegment: (id: string) => {
    const state = get();
    const newSegments = state.segments.filter(s => s.id !== id);
    
    // Clean up unused tags
    const usedTags = new Set<string>();
    newSegments.forEach(segment => {
      segment.tags.forEach(tag => usedTags.add(tag));
    });
    
    set({
      segments: newSegments,
      tags: Array.from(usedTags),
      dirty: true,
      selectedSegmentId: state.selectedSegmentId === id ? null : state.selectedSegmentId
    });
  },

  setFilter: (tag: string | null) => {
    set({ filterTag: tag });
  },

  setSelectedSegmentId: (id: string | null) => {
    set({ selectedSegmentId: id });
  },

  setStudentIdentifier: (identifier: string) => {
    set({ studentIdentifier: identifier, dirty: true });
  },

  save: async () => {
    const state = get();
    try {
      await set(STORAGE_KEY, {
        document: state.document,
        segments: state.segments,
        tags: state.tags,
        studentIdentifier: state.studentIdentifier
      });
      get().markClean();
    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  },

  load: async () => {
    try {
      const data = await get(STORAGE_KEY);
      if (data) {
        set({
          document: data.document || null,
          segments: data.segments || [],
          tags: data.tags || [],
          studentIdentifier: data.studentIdentifier || '',
          dirty: false,
          selectedSegmentId: null,
          filterTag: null
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  },

  exportCSV: () => {
    const state = get();
    if (!state.document || state.segments.length === 0) {
      throw new Error('No data to export');
    }
    exportToCSV(state.document, state.segments, state.studentIdentifier);
  },

  clearAll: () => {
    set({
      document: null,
      segments: [],
      tags: [],
      studentIdentifier: '',
      dirty: false,
      selectedSegmentId: null,
      filterTag: null
    });
  },

  markClean: () => {
    set({ dirty: false });
  }
}));