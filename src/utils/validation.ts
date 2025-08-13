import { QualitativeDocument, Segment, ValidationResult } from '../types';
import { MAX_SEGMENTS, MAX_TEXT_LENGTH } from './constants';

export function validateDocument(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Document cannot be empty' };
  }
  
  if (text.length > MAX_TEXT_LENGTH) {
    return { isValid: false, error: `Document exceeds maximum length of ${MAX_TEXT_LENGTH} characters` };
  }
  
  return { isValid: true };
}

export function validateSegmentCreation(
  segments: Segment[], 
  paragraphIndex: number,
  startChar: number,
  endChar: number,
  paragraphs: string[]
): ValidationResult {
  // Check segment limit
  if (segments.length >= MAX_SEGMENTS) {
    return { isValid: false, error: `Maximum ${MAX_SEGMENTS} segments allowed per document` };
  }
  
  // Validate paragraph index
  if (paragraphIndex < 0 || paragraphIndex >= paragraphs.length) {
    return { isValid: false, error: 'Invalid paragraph index' };
  }
  
  const paragraph = paragraphs[paragraphIndex];
  
  // Validate character boundaries
  if (startChar < 0 || endChar <= startChar || endChar > paragraph.length) {
    return { isValid: false, error: 'Invalid selection boundaries' };
  }
  
  // Validate selection content
  const selectedText = paragraph.substring(startChar, endChar).trim();
  if (!selectedText) {
    return { isValid: false, error: 'Selection cannot be empty or whitespace only' };
  }
  
  // Check for overlaps with existing segments in the same paragraph
  const overlappingSegment = segments.find(segment => 
    segment.paragraphIndex === paragraphIndex &&
    ((startChar >= segment.startChar && startChar < segment.endChar) ||
     (endChar > segment.startChar && endChar <= segment.endChar) ||
     (startChar <= segment.startChar && endChar >= segment.endChar))
  );
  
  if (overlappingSegment) {
    return { isValid: false, error: 'Selection overlaps with existing segment' };
  }
  
  return { isValid: true };
}

export function validateTags(tags: string[]): ValidationResult {
  if (tags.length === 0) {
    return { isValid: false, error: 'At least one tag is required' };
  }
  
  const invalidTags = tags.filter(tag => !tag || tag.trim().length === 0);
  if (invalidTags.length > 0) {
    return { isValid: false, error: 'Tags cannot be empty' };
  }
  
  const trimmedTags = tags.map(tag => tag.trim());
  const duplicates = trimmedTags.filter((tag, index) => trimmedTags.indexOf(tag) !== index);
  if (duplicates.length > 0) {
    return { isValid: false, error: `Duplicate tags found: ${duplicates.join(', ')}` };
  }
  
  return { isValid: true };
}

export function validateMemo(memo: string): ValidationResult {
  // Memos are optional, so empty is valid
  if (!memo) return { isValid: true };
  
  const sentences = memo.trim().split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) {
    return { isValid: false, error: 'Memo should be 1-3 sentences maximum' };
  }
  
  return { isValid: true };
}

export function validateExport(document: QualitativeDocument | null, segments: Segment[]): ValidationResult {
  if (!document) {
    return { isValid: false, error: 'No document loaded' };
  }
  
  if (segments.length === 0) {
    return { isValid: false, error: 'No segments to export' };
  }
  
  // Check if all segments reference valid paragraphs
  const invalidSegments = segments.filter(segment => 
    segment.paragraphIndex < 0 || 
    segment.paragraphIndex >= document.paragraphs.length ||
    segment.startChar < 0 ||
    segment.endChar <= segment.startChar ||
    segment.endChar > document.paragraphs[segment.paragraphIndex].length
  );
  
  if (invalidSegments.length > 0) {
    return { isValid: false, error: 'Some segments have invalid references to document text' };
  }
  
  return { isValid: true };
}