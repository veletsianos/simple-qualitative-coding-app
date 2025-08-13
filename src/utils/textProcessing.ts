import { QualitativeDocument } from '../types';

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIntoParagraphs(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  
  return normalized
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

export function createDocumentFromText(text: string, title?: string): QualitativeDocument {
  const paragraphs = splitIntoParagraphs(text);
  return {
    title: title || 'Untitled Document',
    paragraphs
  };
}

export function extractTextSnippet(paragraph: string, startChar: number, endChar: number): string {
  const snippet = paragraph.substring(startChar, endChar);
  return snippet.replace(/\n/g, '\\n');
}

export function validateSelection(
  paragraph: string, 
  startChar: number, 
  endChar: number
): { isValid: boolean; error?: string } {
  if (startChar < 0 || endChar <= startChar) {
    return { isValid: false, error: 'Invalid selection boundaries' };
  }
  
  if (endChar > paragraph.length) {
    return { isValid: false, error: 'Selection extends beyond paragraph' };
  }
  
  const selectedText = paragraph.substring(startChar, endChar).trim();
  if (!selectedText) {
    return { isValid: false, error: 'Selection cannot be empty or whitespace only' };
  }
  
  return { isValid: true };
}

export function findWordBoundaries(text: string, startChar: number, endChar: number): { start: number; end: number } {
  let start = startChar;
  let end = endChar;
  
  // Expand to word boundaries
  while (start > 0 && /\w/.test(text[start - 1])) {
    start--;
  }
  
  while (end < text.length && /\w/.test(text[end])) {
    end++;
  }
  
  return { start, end };
}

export function escapeForCSV(text: string): string {
  if (!text) return '';
  
  // Escape newlines
  const escaped = text.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  
  return escaped;
}