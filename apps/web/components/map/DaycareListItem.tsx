'use client';

import { Clock, MapPin, Phone, Users } from 'lucide-react';
import type { Daycare, DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_LABELS } from '@/domain/daycare';

interface DaycareListItemProps {
  daycare: Daycare;
  selected: boolean;
  onClick: () => void;
  activeAge: DaycareAgeFilter | null;
}

const TYPE_COLORS: Record<string, string> = {
  national: 'bg-blue-50 text-blue-600',
  public: 'bg-sky-50 text-sky-600',
  private: 'bg-orange-50 text-orange-600',
  home: 'bg-purple-50 text-purple-600',
  workplace: 'bg-indigo-50 text-indigo-600',
  cooperative: 'bg-pink-50 text-pink-600',
};

export function DaycareListItem({ daycare, selected, onClick, activeAge }: DaycareListItemProps) {
  const occupancyRate =
    daycare.capacity && daycare.currentChildCount
      ? Math.round((daycare.currentChildCount / daycare.capacity) * 100)
      : null;

  const waitingCount =
    activeAge !== null ? daycare.waitingChildByAge[activeAge] : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-all hover:bg-gray-50 ${
        selected ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 truncate">
              {daycare.name}
            </span>
            <span
              className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                TYPE_COLORS[daycare.type] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {daycare.typeName || daycare.type}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <MapPin size={11} className="shrink-0 text-gray-400" />
            <span className="truncate">{daycare.address}</span>
          </div>

          <div className="flex items-center gap-3">
            {daycare.phone && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone size={11} className="shrink-0 text-gray-400" />
                <span>{daycare.phone}</span>
              </div>
            )}
            {occupancyRate !== null && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={11} className="shrink-0 text-gray-400" />
                <span>
                  {daycare.currentChildCount}/{daycare.capacity}명
                </span>
                <span
                  className={`text-xs font-medium ${
                    occupancyRate >= 90
                      ? 'text-red-500'
                      : occupancyRate >= 70
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  }`}
                >
                  ({occupancyRate}%)
                </span>
              </div>
            )}
          </div>

          {activeAge !== null && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${
              waitingCount === null
                ? 'text-gray-400'
                : waitingCount === 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
            }`}>
              <Clock size={11} className="shrink-0" />
              <span>
                {waitingCount === null
                  ? `${DAYCARE_AGE_LABELS[activeAge]} 정보 없음`
                  : waitingCount === 0
                    ? `${DAYCARE_AGE_LABELS[activeAge]} 대기 없음`
                    : `${DAYCARE_AGE_LABELS[activeAge]} 대기 ${waitingCount}명`}
              </span>
            </div>
          )}
        </div>

        {selected && (
          <div className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
        )}
      </div>
    </button>
  );
}
