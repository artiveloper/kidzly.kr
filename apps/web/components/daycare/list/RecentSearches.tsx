'use client';

import { Clock, X } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (s: string) => void;
  onRemove: (s: string) => void;
}

export function RecentSearches({ searches, onSelect, onRemove }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-xs font-medium text-gray-400 mb-2">최근 검색어</p>
      <div className="flex flex-wrap gap-1.5">
        {searches.map((s) => (
          <div
            key={s}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-150 rounded-full pl-2.5 pr-1.5 py-1 group"
          >
            <Clock size={11} className="text-gray-400 shrink-0" />
            <button
              className="text-xs text-gray-600 hover:text-gray-900"
              onClick={() => onSelect(s)}
            >
              {s}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(s);
              }}
              className="ml-0.5 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
