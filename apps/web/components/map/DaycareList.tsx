'use client';

import type { Daycare } from '@/domain/daycare';
import { DaycareListItem } from './DaycareListItem';

interface DaycareListProps {
  daycares: Daycare[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function DaycareList({
  daycares,
  selectedId,
  onSelect,
  isLoading = false,
}: DaycareListProps) {
  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* 로딩 인디케이터 — 리스트 위에 얇은 바 */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-100 overflow-hidden z-10">
          <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      )}

      {daycares.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-sm text-gray-500">이 지역에 어린이집이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">지도를 이동하거나 필터를 변경해 보세요.</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-2.5 flex items-center gap-2">
            <p className="text-xs text-gray-500">
              현재 지역{' '}
              <span className="font-semibold text-gray-900">{daycares.length}</span>개
            </p>
            {isLoading && (
              <span className="text-[10px] text-emerald-500 font-medium">업데이트 중...</span>
            )}
          </div>
          {daycares.map((daycare) => (
            <DaycareListItem
              key={daycare.id}
              daycare={daycare}
              selected={selectedId === daycare.id}
              onClick={() => onSelect(daycare.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
