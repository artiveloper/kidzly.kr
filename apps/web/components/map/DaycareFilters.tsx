'use client';

import type { DaycareType } from '@/domain/daycare';
import { DAYCARE_TYPE_LABELS } from '@/domain/daycare';

const FILTERS: Array<DaycareType | 'all'> = [
  'all', 'national', 'public', 'private', 'home', 'workplace', 'cooperative',
];

interface DaycareFiltersProps {
  active: DaycareType | 'all';
  onChange: (f: DaycareType | 'all') => void;
}

export function DaycareFilters({ active, onChange }: DaycareFiltersProps) {
  return (
    <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto scrollbar-none">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            active === f
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
          }`}
        >
          {DAYCARE_TYPE_LABELS[f]}
        </button>
      ))}
    </div>
  );
}
