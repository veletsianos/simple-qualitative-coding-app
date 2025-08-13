import { useState, useCallback, useRef } from 'react';
import { SelectionData } from '../types';

export interface UseSelectionReturn {
  selection: SelectionData | null;
  isSelecting: boolean;
  handleMouseDown: (e: React.MouseEvent, paragraphIndex: number) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  clearSelection: () => void;
  selectionError: string | null;
}

export function useSelection(): UseSelectionReturn {
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const selectionStartRef = useRef<{ paragraphIndex: number; charIndex: number } | null>(null);

  const getCharacterIndexFromElement = useCallback((element: Element, x: number): number => {
    const range = document.createRange();
    const textNode = element.firstChild;
    
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return 0;
    }
    
    let bestOffset = 0;
    let bestDistance = Infinity;
    const textLength = (textNode as Text).length;
    
    // Binary search for the closest character
    for (let i = 0; i <= textLength; i++) {
      try {
        range.setStart(textNode, i);
        range.setEnd(textNode, i);
        const rect = range.getBoundingClientRect();
        const distance = Math.abs(rect.left - x);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestOffset = i;
        }
      } catch (e) {
        // Ignore range errors
      }
    }
    
    return bestOffset;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, paragraphIndex: number) => {
    e.preventDefault();
    setSelectionError(null);
    
    const target = e.currentTarget as HTMLElement;
    const charIndex = getCharacterIndexFromElement(target, e.clientX);
    
    selectionStartRef.current = { paragraphIndex, charIndex };
    setIsSelecting(true);
    setSelection(null);
  }, [getCharacterIndexFromElement]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStartRef.current) {
      return;
    }
    
    setIsSelecting(false);
    
    const target = e.currentTarget as HTMLElement;
    const paragraphElement = target.closest('[data-paragraph-index]') as HTMLElement;
    
    if (!paragraphElement) {
      setSelectionError('Invalid selection target');
      return;
    }
    
    const paragraphIndex = parseInt(paragraphElement.dataset.paragraphIndex || '0', 10);
    
    // Ensure selection is within the same paragraph
    if (paragraphIndex !== selectionStartRef.current.paragraphIndex) {
      setSelectionError('Selection cannot span multiple paragraphs');
      selectionStartRef.current = null;
      return;
    }
    
    const endCharIndex = getCharacterIndexFromElement(paragraphElement, e.clientX);
    const startCharIndex = selectionStartRef.current.charIndex;
    
    // Ensure proper order
    const actualStart = Math.min(startCharIndex, endCharIndex);
    const actualEnd = Math.max(startCharIndex, endCharIndex);
    
    // Validate selection
    if (actualStart === actualEnd) {
      setSelectionError('Please select some text');
      selectionStartRef.current = null;
      return;
    }
    
    // Get the actual text content
    const textContent = paragraphElement.textContent || '';
    const selectedText = textContent.substring(actualStart, actualEnd);
    
    if (selectedText.trim().length === 0) {
      setSelectionError('Selection cannot be empty or whitespace only');
      selectionStartRef.current = null;
      return;
    }
    
    const newSelection: SelectionData = {
      paragraphIndex,
      startChar: actualStart,
      endChar: actualEnd,
      text: selectedText
    };
    
    setSelection(newSelection);
    selectionStartRef.current = null;
  }, [isSelecting, getCharacterIndexFromElement]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
    setSelectionError(null);
    selectionStartRef.current = null;
  }, []);

  return {
    selection,
    isSelecting,
    handleMouseDown,
    handleMouseUp,
    clearSelection,
    selectionError
  };
}