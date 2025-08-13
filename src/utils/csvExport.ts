import { format } from 'date-fns';
import { QualitativeDocument, Segment } from '../types';
import { CSV_HEADERS, MAX_SNIPPET_LENGTH } from './constants';
import { extractTextSnippet, escapeForCSV } from './textProcessing';

export function exportToCSV(document: QualitativeDocument, segments: Segment[], studentIdentifier: string = ''): void {
  if (!document || segments.length === 0) {
    throw new Error('No data to export');
  }

  // Sort segments by paragraph index, then by start character
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.paragraphIndex !== b.paragraphIndex) {
      return a.paragraphIndex - b.paragraphIndex;
    }
    return a.startChar - b.startChar;
  });

  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(CSV_HEADERS.join(','));
  
  // Add data rows
  for (const segment of sortedSegments) {
    const paragraph = document.paragraphs[segment.paragraphIndex];
    if (!paragraph) continue;
    
    let textSnippet = extractTextSnippet(paragraph, segment.startChar, segment.endChar);
    
    // Truncate if too long
    if (textSnippet.length > MAX_SNIPPET_LENGTH) {
      textSnippet = textSnippet.substring(0, MAX_SNIPPET_LENGTH - 3) + '...';
    }
    
    const row = [
      escapeForCSV(document.title),
      escapeForCSV(studentIdentifier),
      segment.paragraphIndex.toString(),
      segment.startChar.toString(),
      segment.endChar.toString(),
      escapeForCSV(textSnippet),
      escapeForCSV(segment.tags.join('|')),
      escapeForCSV(segment.memo),
      segment.createdAt
    ];
    
    csvRows.push(row.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename
    const today = format(new Date(), 'yyyy-MM-dd');
    const safeTitle = document.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const safeStudentId = studentIdentifier ? `${studentIdentifier.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
    
    link.setAttribute('download', `${safeStudentId}QualCoding_${safeTitle}_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function generateCSVPreview(document: QualitativeDocument, segments: Segment[], studentIdentifier: string = '', maxRows: number = 3): string[] {
  if (!document || segments.length === 0) {
    return ['No data to preview'];
  }

  const sortedSegments = [...segments].sort((a, b) => {
    if (a.paragraphIndex !== b.paragraphIndex) {
      return a.paragraphIndex - b.paragraphIndex;
    }
    return a.startChar - b.startChar;
  });

  const previewRows: string[] = [];
  previewRows.push(CSV_HEADERS.join(','));
  
  for (let i = 0; i < Math.min(maxRows, sortedSegments.length); i++) {
    const segment = sortedSegments[i];
    const paragraph = document.paragraphs[segment.paragraphIndex];
    if (!paragraph) continue;
    
    let textSnippet = extractTextSnippet(paragraph, segment.startChar, segment.endChar);
    if (textSnippet.length > 50) {
      textSnippet = textSnippet.substring(0, 47) + '...';
    }
    
    const row = [
      escapeForCSV(document.title),
      escapeForCSV(studentIdentifier),
      segment.paragraphIndex.toString(),
      segment.startChar.toString(),
      segment.endChar.toString(),
      escapeForCSV(textSnippet),
      escapeForCSV(segment.tags.join('|')),
      escapeForCSV(segment.memo),
      segment.createdAt
    ];
    
    previewRows.push(row.join(','));
  }
  
  if (sortedSegments.length > maxRows) {
    previewRows.push(`... and ${sortedSegments.length - maxRows} more rows`);
  }
  
  return previewRows;
}