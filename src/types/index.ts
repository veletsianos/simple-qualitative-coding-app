export interface QualitativeDocument {
  title: string;
  paragraphs: string[];
}

export interface Segment {
  id: string;
  paragraphIndex: number;
  startChar: number;
  endChar: number;
  tags: string[];
  memo: string;
  createdAt: string; // ISO 8601
}

export interface AppState {
  document: QualitativeDocument | null;
  segments: Segment[];
  tags: string[];
  studentIdentifier: string;
  dirty: boolean;
  selectedSegmentId: string | null;
  filterTag: string | null;
}

export interface AppStore extends AppState {
  // Actions
  setDocument: (doc: QualitativeDocument) => void;
  addSegment: (segment: Omit<Segment, 'id' | 'createdAt'>) => void;
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;
  setFilter: (tag: string | null) => void;
  setSelectedSegmentId: (id: string | null) => void;
  setStudentIdentifier: (identifier: string) => void;
  save: () => Promise<void>;
  load: () => Promise<void>;
  exportCSV: () => void;
  clearAll: () => void;
  markClean: () => void;
}

export interface SelectionData {
  paragraphIndex: number;
  startChar: number;
  endChar: number;
  text: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}