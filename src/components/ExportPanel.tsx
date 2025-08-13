import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { validateExport } from '../utils/validation';
import { generateCSVPreview } from '../utils/csvExport';

export const ExportPanel: React.FC = () => {
  const { document, segments, studentIdentifier, setStudentIdentifier, exportCSV } = useAppStore();
  const [showPreview, setShowPreview] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentIdentifier(e.target.value);
  };

  const handleExport = async () => {
    setExportError(null);
    
    const validation = validateExport(document, segments);
    if (!validation.isValid) {
      setExportError(validation.error!);
      return;
    }

    setIsExporting(true);
    
    try {
      exportCSV();
      setExportError(null);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = document && segments.length > 0;
  const previewData = canExport ? generateCSVPreview(document, segments, studentIdentifier) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Export Data</h2>
        <div className="text-sm text-gray-500">
          {segments.length} segment{segments.length !== 1 ? 's' : ''} ready for export
        </div>
      </div>

      {/* Student Identifier */}
      <div>
        <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
          Student Identifier (optional)
        </label>
        <input
          id="student-id"
          type="text"
          value={studentIdentifier}
          onChange={handleStudentIdChange}
          placeholder="Enter your name or ID..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be included in the exported CSV filename and data
        </p>
      </div>

      {/* Export Preview */}
      {canExport && (
        <div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg 
              className={`w-4 h-4 mr-1 transform transition-transform ${showPreview ? 'rotate-90' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {showPreview ? 'Hide' : 'Show'} CSV Preview
          </button>
          
          {showPreview && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Preview (first 3 rows):
              </p>
              <pre className="text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap">
                {previewData.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleExport}
          disabled={!canExport || isExporting}
          className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            canExport && !isExporting
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </span>
          ) : (
            'Export CSV'
          )}
        </button>

        {canExport && (
          <div className="text-sm text-gray-600">
            <p>Filename: {(() => {
              const today = new Date().toISOString().split('T')[0];
              const safeTitle = (document?.title || 'Document').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
              const safeStudentId = studentIdentifier ? `${studentIdentifier.replace(/[^a-zA-Z0-9]/g, '_')}_` : '';
              return `${safeStudentId}QualCoding_${safeTitle}_${today}.csv`;
            })()}</p>
          </div>
        )}
      </div>

      {/* Export Status */}
      {exportError && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Export Error</h3>
              <p className="text-sm text-red-700 mt-1">{exportError}</p>
            </div>
          </div>
        </div>
      )}

      {!canExport && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">No Data to Export</h3>
              <p className="text-sm text-gray-600 mt-1">
                {!document 
                  ? 'Load a document and create segments to enable export.'
                  : 'Create at least one segment to enable export.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Export Format</h3>
        <p className="text-sm text-blue-700 mb-2">
          The exported CSV will contain the following columns:
        </p>
        <ul className="text-xs text-blue-600 space-y-1 font-mono">
          <li>• document_title - Title of your document</li>
          <li>• student_identifier - Your name/ID (if provided)</li>
          <li>• paragraph_index - Paragraph number (0-based)</li>
          <li>• start_char, end_char - Character positions in paragraph</li>
          <li>• text_snippet - The selected text (max 280 characters)</li>
          <li>• tags - Your tags separated by | (pipe)</li>
          <li>• memo - Your notes (newlines escaped as \n)</li>
          <li>• created_at_iso - Timestamp when segment was created</li>
        </ul>
      </div>
    </div>
  );
};