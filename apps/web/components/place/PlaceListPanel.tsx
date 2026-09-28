'use client';

// 놀거리 레이어에서 지도 영역 안의 장소를 나열하는 패널
import { Star, X } from 'lucide-react';
import type { PlaceMapItem } from '@/domain/place';
import { PLACE_AGE_GROUP_LABELS } from '@/domain/place';
import PlaceFilters from './filters/PlaceFilters';
import PlaceListSkeleton from './PlaceListSkeleton';

interface PlaceListPanelProps {
    places: PlaceMapItem[];
    isLoading?: boolean;
    selectedId?: string | null;
    onSelect: (id: string) => void;
    onClose?: () => void;
    /** 필터가 걸려 있으면 빈 상태 문구를 다르게 안내한다 */
    isFiltered?: boolean;
}

export default function PlaceListPanel({
    places,
    isLoading = false,
    selectedId,
    onSelect,
    onClose,
    isFiltered = false,
}: PlaceListPanelProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                    이 지역 놀거리{' '}
                    <span className="font-bold text-violet-600">{places.length}</span>곳
                </p>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="목록 닫기"
                        className="-m-2 p-2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* 모바일은 지도 위에 필터 바가 따로 떠 있어 여기서는 중복을 피한다 */}
            <div className="hidden border-b border-gray-100 md:block">
                <PlaceFilters />
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && places.length === 0 ? (
                    <PlaceListSkeleton />
                ) : places.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm break-keep text-gray-500">
                        {isFiltered
                            ? '조건에 맞는 놀거리가 없어요. 필터를 줄이거나 지도를 넓혀서 찾아보세요.'
                            : '이 지역에는 등록된 놀거리가 없어요. 지도를 옮기거나 넓혀서 찾아보세요.'}
                    </p>
                ) : (
                    <ul>
                        {places.map((place) => {
                            const ageLabels = place.ageGroups.map(
                                (age) => PLACE_AGE_GROUP_LABELS[age]
                            );
                            return (
                                <li key={place.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(place.id)}
                                        className={`min-h-11 w-full border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                                            place.id === selectedId
                                                ? 'bg-violet-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-baseline gap-1.5">
                                            <p className="text-sm font-semibold break-keep text-gray-900">
                                                {place.name}
                                            </p>
                                            {place.rating !== null && (
                                                <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-600">
                                                    <Star
                                                        size={11}
                                                        className="fill-amber-400 text-amber-400"
                                                        aria-hidden
                                                    />
                                                    {place.rating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs break-keep text-gray-600">
                                            {place.summary}
                                        </p>
                                        <p className="mt-1 text-xs text-violet-700">
                                            {[
                                                place.placeTypeLabel,
                                                place.indoorOutdoorLabel,
                                                place.isFree ? '무료' : '유료',
                                            ].join(' · ')}
                                        </p>
                                        {ageLabels.length > 0 && (
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {ageLabels.join(' · ')}
                                            </p>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
