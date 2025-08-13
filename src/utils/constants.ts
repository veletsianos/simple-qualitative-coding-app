export const MAX_SEGMENTS = 10;
export const MAX_TEXT_LENGTH = 50000;
export const MAX_SNIPPET_LENGTH = 280;
export const TRUNCATED_SNIPPET_LENGTH = 50;

export const KEYBOARD_SHORTCUTS = {
  TAG_PICKER: 'k',
  SAVE: 's',
  EXPORT: 'e',
  CLEAR_FILTER: 'c'
} as const;

export const CSV_HEADERS = [
  'document_title',
  'student_identifier', 
  'paragraph_index',
  'start_char',
  'end_char',
  'text_snippet',
  'tags',
  'memo',
  'created_at_iso'
] as const;