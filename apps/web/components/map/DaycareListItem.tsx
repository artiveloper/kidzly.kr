'use client';

import { Clock, MapPin, Phone, Users } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import type { Daycare, DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_LABELS } from '@/domain/daycare';

interface DaycareListItemProps {
  daycare: Daycare;
  onClick: () => void;
  activeAge: DaycareAgeFilter | null; // 연령 필터 선택 시 해당 연령 대기 정보 표시
}


export function DaycareListItem({ daycare, onClick, activeAge }: DaycareListItemProps) {
  // 정원 대비 현원 비율 (정원 또는 현원이 없으면 null)
  const occupancyRate =
    daycare.capacity && daycare.currentChildCount
      ? Math.round((daycare.currentChildCount / daycare.capacity) * 100)
      : null;

  // 선택된 연령 필터의 대기 인원 (필터 없으면 null)
  const waitingCount =
    activeAge !== null ? daycare.waitingChildByAge[activeAge] : null;

  return (
    <button
      onClick={onClick}
      className="w-full border-b border-gray-100 px-4 py-3.5 text-left transition-all hover:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* 이름 + 유형 뱃지 */}
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">
              {daycare.name}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {daycare.typeName}
            </Badge>
          </div>

          {/* 주소 */}
          <div className="mb-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={11} className="shrink-0 text-gray-400" />
            <span className="truncate">{daycare.address}</span>
          </div>

          {/* 전화번호 + 충원율 */}
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
                {/* 90% 이상 빨강, 70% 이상 주황, 미만 초록 */}
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

          {/* 연령 필터 선택 시 해당 연령 대기 현황 */}
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

          {/* 통학차량 운영 여부 + 제공 서비스 뱃지 */}
          {(daycare.services || daycare.vehicleOperation === '운영') && (
            <div className="mt-2 flex flex-wrap gap-1">
              {daycare.vehicleOperation === '운영' && (
                <Badge variant="outline">통학차량</Badge>
              )}
              {daycare.services &&
                daycare.services
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
      </div>
    </button>
  )
}
