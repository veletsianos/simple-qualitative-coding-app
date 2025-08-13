import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { usePersistence } from './usePersistence';

interface UseKeyboardShortcutsProps {
  onOpenTagPicker?: () => void;
}

export function useKeyboardShortcuts({ onOpenTagPicker }: UseKeyboardShortcutsProps = {}) {
  const { setFilter, exportCSV, document, segments } = useAppStore();
  const { manualSave } = usePersistence();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      const target = e.target as HTMLElement;
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      if (isInInput) return;

      // Check for modifier keys (Ctrl/Cmd)
      const isModifierPressed = e.ctrlKey || e.metaKey;

      if (isModifierPressed) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            if (onOpenTagPicker) {
              onOpenTagPicker();
            }
            break;
          
          case 's':
            e.preventDefault();
            manualSave();
            break;
          
          case 'e':
            e.preventDefault();
            if (document && segments.length > 0) {
              try {
                exportCSV();
              } catch (error) {
                console.error('Export failed:', error);
              }
            }
            break;
          
          case 'c':
            e.preventDefault();
            setFilter(null);
            break;
        }
      }

      // Handle Escape key (without modifier)
      if (e.key === 'Escape' && !isModifierPressed) {
        // Clear any active selections or filters
        setFilter(null);
        const { setSelectedSegmentId } = useAppStore.getState();
        setSelectedSegmentId(null);
      }
    };

    window.document.addEventListener('keydown', handleKeyDown);
    return () => window.document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenTagPicker, manualSave, exportCSV, document, segments, setFilter]);
}