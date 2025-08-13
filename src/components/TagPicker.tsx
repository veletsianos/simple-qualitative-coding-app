import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useAppStore } from '../store/appStore';
import { SelectionData } from '../types';
import { validateSegmentCreation, validateTags, validateMemo } from '../utils/validation';

interface TagPickerProps {
  selection: SelectionData;
  onClose: () => void;
  onSegmentCreated: () => void;
}

export const TagPicker: React.FC<TagPickerProps> = ({ selection, onClose, onSegmentCreated }) => {
  const { tags: existingTags, segments, document, addSegment } = useAppStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCreateSegment();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTags, memo, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredTags = existingTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  const getTagUsageCount = (tag: string) => {
    return segments.filter(segment => segment.tags.includes(tag)).length;
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setSearchQuery('');
    setError(null);
  };

  const handleCreateNewTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      setError('Tag cannot be empty');
      return;
    }

    const tagExists = existingTags.some(tag => 
      tag.toLowerCase() === trimmedTag.toLowerCase()
    );

    if (tagExists) {
      setError('Tag already exists');
      return;
    }

    if (selectedTags.includes(trimmedTag)) {
      setError('Tag already selected');
      return;
    }

    setSelectedTags(prev => [...prev, trimmedTag]);
    setNewTag('');
    setIsCreatingTag(false);
    setError(null);
  };

  const handleCreateSegment = () => {
    if (!document) return;

    // Validate tags
    const tagValidation = validateTags(selectedTags);
    if (!tagValidation.isValid) {
      setError(tagValidation.error!);
      return;
    }

    // Validate memo
    const memoValidation = validateMemo(memo);
    if (!memoValidation.isValid) {
      setError(memoValidation.error!);
      return;
    }

    // Validate segment creation
    const segmentValidation = validateSegmentCreation(
      segments,
      selection.paragraphIndex,
      selection.startChar,
      selection.endChar,
      document.paragraphs
    );

    if (!segmentValidation.isValid) {
      setError(segmentValidation.error!);
      return;
    }

    try {
      addSegment({
        paragraphIndex: selection.paragraphIndex,
        startChar: selection.startChar,
        endChar: selection.endChar,
        tags: selectedTags,
        memo: memo.trim()
      });

      onSegmentCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredTags.length > 0) {
      e.preventDefault();
      handleTagToggle(filteredTags[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
        role="dialog"
        aria-labelledby="tag-picker-title"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="tag-picker-title" className="text-lg font-semibold text-gray-900">
            Add Tags to Segment
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Selected text: "{selection.text.length > 50 ? selection.text.substring(0, 50) + '...' : selection.text}"
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Tag Search */}
          <div className="mb-4">
            <label htmlFor="tag-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search or select tags
            </label>
            <input
              id="tag-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type to search tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtered Tags */}
          {filteredTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available tags:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filteredTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center justify-between"
                  >
                    <span>{tag}</span>
                    <span className="text-xs text-gray-500">
                      ({getTagUsageCount(tag)} uses)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New Tag */}
          <div className="mb-4">
            {!isCreatingTag ? (
              <button
                onClick={() => setIsCreatingTag(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Create new tag
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewTag();
                    }
                    if (e.key === 'Escape') {
                      setIsCreatingTag(false);
                      setNewTag('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateNewTag}
                    disabled={!newTag.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingTag(false);
                      setNewTag('');
                    }}
                    className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Memo */}
          <div className="mb-4">
            <label htmlFor="segment-memo" className="block text-sm font-medium text-gray-700 mb-1">
              Memo (optional, 1-3 sentences)
            </label>
            <textarea
              id="segment-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add notes about this segment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSegment}
            disabled={selectedTags.length === 0}
            className={clsx(
              'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
              selectedTags.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Create Segment
          </button>
        </div>
      </div>
    </div>
  );
};