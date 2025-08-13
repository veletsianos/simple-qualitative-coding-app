import React, { useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '../store/appStore';
import type { Segment } from '../types';
import { format } from 'date-fns';
import { TRUNCATED_SNIPPET_LENGTH } from '../utils/constants';

type SortOption = 'paragraph' | 'created';

export const SegmentList: React.FC = () => {
  const { 
    segments, 
    document, 
    selectedSegmentId, 
    filterTag,
    setSelectedSegmentId, 
    deleteSegment,
    updateSegment
  } = useAppStore();
  
  const [sortBy, setSortBy] = useState<SortOption>('paragraph');
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<string>('');
  const [editMemo, setEditMemo] = useState<string>('');

  const filteredSegments = filterTag 
    ? segments.filter(segment => segment.tags.includes(filterTag))
    : segments;

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    if (sortBy === 'paragraph') {
      if (a.paragraphIndex !== b.paragraphIndex) {
        return a.paragraphIndex - b.paragraphIndex;
      }
      return a.startChar - b.startChar;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getTextSnippet = (segment: Segment): string => {
    if (!document) return '';
    const paragraph = document.paragraphs[segment.paragraphIndex];
    if (!paragraph) return '';
    
    const text = paragraph.substring(segment.startChar, segment.endChar);
    if (text.length <= TRUNCATED_SNIPPET_LENGTH) return text;
    return text.substring(0, TRUNCATED_SNIPPET_LENGTH - 3) + '...';
  };

  const handleSegmentClick = (segmentId: string) => {
    const isCurrentlySelected = selectedSegmentId === segmentId;
    setSelectedSegmentId(isCurrentlySelected ? null : segmentId);
    
    // Scroll to segment in document if selected
    if (!isCurrentlySelected) {
      const segment = segments.find(s => s.id === segmentId);
      if (segment) {
        const paragraphElement = window.document.querySelector(`[data-paragraph-index="${segment.paragraphIndex}"]`);
        if (paragraphElement) {
          paragraphElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleDeleteSegment = (segment: Segment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Delete segment "${getTextSnippet(segment)}"?`)) {
      deleteSegment(segment.id);
    }
  };

  const handleEditSegment = (segment: Segment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSegment(segment.id);
    setEditTags(segment.tags.join(', '));
    setEditMemo(segment.memo);
  };

  const handleSaveEdit = (segmentId: string) => {
    const tags = editTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    if (tags.length === 0) {
      alert('At least one tag is required');
      return;
    }

    try {
      updateSegment(segmentId, {
        tags,
        memo: editMemo.trim()
      });
      setEditingSegment(null);
      setEditTags('');
      setEditMemo('');
    } catch (error) {
      alert('Failed to update segment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingSegment(null);
    setEditTags('');
    setEditMemo('');
  };

  if (!document) {
    return (
      <div className="text-center text-gray-500 py-8">
        Load a document to see segments
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Segments ({filteredSegments.length}/{segments.length})
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="paragraph">Paragraph order</option>
            <option value="created">Creation time</option>
          </select>
        </div>
      </div>

      {sortedSegments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {segments.length === 0 
            ? 'No segments created yet. Select text to create your first segment.'
            : `No segments match the current filter (${filterTag}).`
          }
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSegments.map((segment) => (
            <div
              key={segment.id}
              className={clsx(
                'border rounded-lg p-4 cursor-pointer transition-all',
                selectedSegmentId === segment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => handleSegmentClick(segment.id)}
            >
              {editingSegment === segment.id ? (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memo:
                    </label>
                    <textarea
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder="Add notes about this segment..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(segment.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Paragraph {segment.paragraphIndex + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          chars {segment.startChar}-{segment.endChar}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(segment.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-800 mb-2 italic">
                        "{getTextSnippet(segment)}"
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {segment.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {segment.memo && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Memo:</strong> {segment.memo}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => handleEditSegment(segment, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit segment"
                        aria-label="Edit segment"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSegment(segment, e)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete segment"
                        aria-label="Delete segment"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};