import React, { useMemo } from 'react';
import clsx from 'clsx';
import { useAppStore } from '../store/appStore';
import { useSelection } from '../hooks/useSelection';
import type { Segment } from '../types';

export const ParagraphDisplay: React.FC = () => {
  const { document, segments, selectedSegmentId, filterTag } = useAppStore();
  const { selection, isSelecting, handleMouseDown, handleMouseUp, clearSelection, selectionError } = useSelection();

  const segmentsByParagraph = useMemo(() => {
    const map = new Map<number, Segment[]>();
    segments.forEach(segment => {
      const existing = map.get(segment.paragraphIndex) || [];
      existing.push(segment);
      existing.sort((a, b) => a.startChar - b.startChar);
      map.set(segment.paragraphIndex, existing);
    });
    return map;
  }, [segments]);

  const getSegmentBackgroundColor = (segment: Segment, index: number) => {
    const colors = [
      'bg-yellow-200',
      'bg-blue-200', 
      'bg-green-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-orange-200',
      'bg-teal-200'
    ];
    return colors[index % colors.length];
  };

  const renderParagraphWithSegments = (paragraph: string, paragraphIndex: number) => {
    const paragraphSegments = segmentsByParagraph.get(paragraphIndex) || [];
    
    if (paragraphSegments.length === 0) {
      return (
        <span 
          className="select-none cursor-text"
          onMouseDown={(e) => handleMouseDown(e, paragraphIndex)}
          onMouseUp={handleMouseUp}
        >
          {paragraph}
        </span>
      );
    }

    const parts: React.ReactNode[] = [];
    let currentPos = 0;

    paragraphSegments.forEach((segment, segmentIndex) => {
      // Add text before this segment
      if (currentPos < segment.startChar) {
        const beforeText = paragraph.substring(currentPos, segment.startChar);
        parts.push(
          <span 
            key={`before-${segment.id}`}
            className="select-none cursor-text"
            onMouseDown={(e) => handleMouseDown(e, paragraphIndex)}
            onMouseUp={handleMouseUp}
          >
            {beforeText}
          </span>
        );
      }

      // Add the segment
      const segmentText = paragraph.substring(segment.startChar, segment.endChar);
      const isSelected = selectedSegmentId === segment.id;
      const isFiltered = filterTag && !segment.tags.includes(filterTag);
      const backgroundColor = getSegmentBackgroundColor(segment, segmentIndex);
      
      parts.push(
        <span
          key={segment.id}
          className={clsx(
            backgroundColor,
            'px-1 py-0.5 rounded-sm',
            isSelected && 'ring-2 ring-blue-500',
            isFiltered && 'opacity-30',
            'hover:ring-1 hover:ring-gray-400',
            'cursor-pointer'
          )}
          onClick={() => {
            const { setSelectedSegmentId } = useAppStore.getState();
            setSelectedSegmentId(isSelected ? null : segment.id);
          }}
          title={`Tags: ${segment.tags.join(', ')}${segment.memo ? `\nMemo: ${segment.memo}` : ''}`}
        >
          {segmentText}
        </span>
      );

      currentPos = segment.endChar;
    });

    // Add remaining text after all segments
    if (currentPos < paragraph.length) {
      const afterText = paragraph.substring(currentPos);
      parts.push(
        <span 
          key={`after-${paragraphIndex}`}
          className="select-none cursor-text"
          onMouseDown={(e) => handleMouseDown(e, paragraphIndex)}
          onMouseUp={handleMouseUp}
        >
          {afterText}
        </span>
      );
    }

    return <>{parts}</>;
  };

  if (!document) {
    return (
      <div className="text-center text-gray-500 py-8">
        Load a document to begin coding
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Document: {document.title}</h2>
        <div className="text-sm text-gray-500">
          {document.paragraphs.length} paragraph{document.paragraphs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {selection && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Selected text ({selection.text.length} characters):
              </p>
              <p className="text-sm text-blue-700 mt-1 italic">
                "{selection.text}"
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Paragraph {selection.paragraphIndex + 1}, characters {selection.startChar}-{selection.endChar}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800 text-sm"
              aria-label="Clear selection"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {selectionError && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200" role="alert">
          <p className="text-sm text-red-800">{selectionError}</p>
        </div>
      )}

      {isSelecting && (
        <div className="bg-yellow-50 p-2 rounded-md text-sm text-yellow-800">
          Selecting text... Release mouse to complete selection
        </div>
      )}

      <div className="space-y-4">
        {document.paragraphs.map((paragraph, index) => (
          <div key={index} className="group">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 text-right text-sm text-gray-400 font-mono mt-1">
                {index + 1}
              </div>
              <div 
                className="flex-1 leading-relaxed text-gray-900"
                data-paragraph-index={index}
              >
                {renderParagraphWithSegments(paragraph, index)}
              </div>
            </div>
            
            {/* Show overlap warning during selection */}
            {selection && selection.paragraphIndex === index && (
              <div className="ml-11 mt-2">
                {(() => {
                  const existingSegments = segmentsByParagraph.get(index) || [];
                  const hasOverlap = existingSegments.some(segment => 
                    (selection.startChar >= segment.startChar && selection.startChar < segment.endChar) ||
                    (selection.endChar > segment.startChar && selection.endChar <= segment.endChar) ||
                    (selection.startChar <= segment.startChar && selection.endChar >= segment.endChar)
                  );
                  
                  if (hasOverlap) {
                    return (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        ⚠️ Warning: Selection overlaps with existing segment
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};