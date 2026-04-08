'use client';

import { Clock, MapPin, Phone, Users } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import type { Daycare, DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_LABELS } from '@/domain/daycare';

interface DaycareListItemProps {
  daycare: Daycare;
  selected: boolean;
  onClick: () => void;
  activeAge: DaycareAgeFilter | null;
}


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
      className={`w-full border-b border-gray-100 px-4 py-3.5 text-left transition-all hover:bg-gray-50 ${
        selected ? "border-l-2 border-l-emerald-500 bg-emerald-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">
              {daycare.name}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {daycare.typeName}
            </Badge>
          </div>

          <div className="mb-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={11} className="shrink-0 text-gray-400" />
            <span className="truncate">{daycare.address}</span>
          </div>

          <div className="flex items-center gap-3">
            {daycare.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Phone size={11} className="shrink-0 text-gray-400" />
                <span>{daycare.phone}</span>
              </div>
            )}
            {occupancyRate !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users size={11} className="shrink-0 text-gray-400" />
                <span>
                  {daycare.currentChildCount}/{daycare.capacity}명
                </span>
                <span
                  className={`text-sm font-medium ${
                    occupancyRate >= 90
                      ? "text-red-500"
                      : occupancyRate >= 70
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                >
                  ({occupancyRate}%)
                </span>
              </div>
            )}
          </div>

          {activeAge !== null && (
            <div
              className={`mt-1.5 flex items-center gap-1 text-sm ${
                waitingCount === null
                  ? "text-gray-400"
                  : waitingCount === 0
                    ? "text-emerald-600"
                    : "text-amber-600"
              }`}
            >
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

          {daycare.services && (
            <div className="mt-2 flex flex-wrap gap-1">
              {daycare.services
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((service) => (
                  <Badge key={service} variant="outline">
                    {service}
                  </Badge>
                ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        )}
      </div>
    </button>
  )
}
