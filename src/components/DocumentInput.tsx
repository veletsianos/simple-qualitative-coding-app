import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { createDocumentFromText } from '../utils/textProcessing';
import { validateDocument } from '../utils/validation';

export const DocumentInput: React.FC = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setDocument, document, segments, dirty } = useAppStore();
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const processDocument = () => {
    const validation = validateDocument(text);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }
    
    try {
      const doc = createDocumentFromText(text, title || 'Untitled Document');
      if (doc.paragraphs.length === 0) {
        setError('Document must contain at least one paragraph');
        return;
      }
      
      setDocument(doc);
      setText('');
      setTitle('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
    }
  };
  
  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/plain') {
      setError('Only .txt files are supported');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      setTitle(file.name.replace('.txt', ''));
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  
  const handleClearDocument = () => {
    if (dirty && segments.length > 0) {
      if (!confirm('You have unsaved changes. Are you sure you want to clear the document?')) {
        return;
      }
    }
    
    const { clearAll } = useAppStore.getState();
    clearAll();
  };
  
  const paragraphCount = document?.paragraphs.length || 0;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Document Input</h2>
        {document && (
          <button
            onClick={handleClearDocument}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            aria-label="Clear current document"
          >
            Clear Document
          </button>
        )}
      </div>
      
      {!document ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-1">
              Document Title (optional)
            </label>
            <input
              id="document-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter document title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="document-text" className="block text-sm font-medium text-gray-700 mb-1">
              Document Text
            </label>
            <div
              className={`relative ${dragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                id="document-text"
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your text here or drag and drop a .txt file..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                aria-describedby={error ? "text-error" : undefined}
              />
              {dragOver && (
                <div className="absolute inset-0 bg-blue-50 bg-opacity-80 flex items-center justify-center rounded-md">
                  <p className="text-blue-600 font-medium">Drop .txt file here</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={processDocument}
              disabled={!text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process Document
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Upload .txt File
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload text file"
            />
          </div>
          
          {error && (
            <div id="text-error" className="text-red-600 text-sm bg-red-50 p-3 rounded-md" role="alert">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Document Loaded: {document.title}
              </h3>
              <p className="text-sm text-green-700">
                {paragraphCount} paragraph{paragraphCount !== 1 ? 's' : ''} processed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};