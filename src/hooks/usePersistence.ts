import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

export function usePersistence() {
  const { load, save, dirty } = useAppStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await load();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [load]);

  // Auto-save when dirty after a delay
  useEffect(() => {
    if (dirty) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await save();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dirty, save]);

  // Warn about unsaved changes on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const manualSave = async (): Promise<boolean> => {
    try {
      await save();
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  };

  return {
    manualSave,
    isDirty: dirty
  };
}