import React from 'react';
import clsx from 'clsx';
import { useAppStore } from '../store/appStore';

export const FilterPanel: React.FC = () => {
  const { tags, segments, filterTag, setFilter } = useAppStore();

  const getTagUsageCount = (tag: string) => {
    return segments.filter(segment => segment.tags.includes(tag)).length;
  };

  const filteredSegmentCount = filterTag 
    ? segments.filter(segment => segment.tags.includes(filterTag)).length 
    : segments.length;

  const handleFilterChange = (tag: string | null) => {
    setFilter(tag);
  };

  if (tags.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-800">Filter by Tag</h3>
        <p className="text-sm text-gray-600 mt-1">
          No tags available yet. Create segments with tags to enable filtering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filter by Tag</h3>
        <div className="text-sm text-gray-500">
          {filterTag ? (
            <span>
              Showing {filteredSegmentCount} of {segments.length} segments
            </span>
          ) : (
            <span>
              Showing all {segments.length} segments
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {/* Clear Filter Option */}
        <button
          onClick={() => handleFilterChange(null)}
          className={clsx(
            'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
            !filterTag 
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <div className="flex items-center justify-between">
            <span>All Tags</span>
            <span className="text-xs">
              ({segments.length} segments)
            </span>
          </div>
        </button>

        {/* Individual Tag Filters */}
        <div className="space-y-1">
          {tags
            .sort((a, b) => {
              // Sort by usage count (descending), then alphabetically
              const countA = getTagUsageCount(a);
              const countB = getTagUsageCount(b);
              if (countA !== countB) {
                return countB - countA;
              }
              return a.localeCompare(b);
            })
            .map(tag => {
              const usageCount = getTagUsageCount(tag);
              const isActive = filterTag === tag;
              
              return (
                <button
                  key={tag}
                  onClick={() => handleFilterChange(tag)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{tag}</span>
                    <span className="text-xs flex-shrink-0 ml-2">
                      ({usageCount} segment{usageCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* Quick Stats */}
      {filterTag && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Filter: "{filterTag}"
              </p>
              <p className="text-xs text-blue-600">
                {filteredSegmentCount} of {segments.length} segments match
              </p>
            </div>
            <button
              onClick={() => handleFilterChange(null)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <p>💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-200 rounded font-mono">Ctrl+C</kbd> to clear filters quickly</p>
      </div>
    </div>
  );
};