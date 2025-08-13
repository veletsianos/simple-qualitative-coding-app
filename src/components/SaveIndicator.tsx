import React, { useState } from 'react';
import clsx from 'clsx';
import { usePersistence } from '../hooks/usePersistence';

export const SaveIndicator: React.FC = () => {
  const { manualSave, isDirty } = usePersistence();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const success = await manualSave();
      if (!success) {
        setSaveError('Save failed. Please try again.');
      }
    } catch (error) {
      setSaveError('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isDirty && !isSaving && !saveError) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        All changes saved
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isDirty && (
        <div className="flex items-center gap-2">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            isSaving 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          )}>
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Unsaved changes'
            )}
          </span>
          
          {!isSaving && (
            <button
              onClick={handleManualSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSaving}
            >
              Save Now
            </button>
          )}
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Save failed
          </span>
          <button
            onClick={handleManualSave}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isSaving}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};