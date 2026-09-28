'use client';

// 지도에서 선택한 놀거리의 상세 정보를 지도 위에 띄우는 카드
import { Clock, MapPin, Star, Ticket, X } from 'lucide-react';
import type { PlaceMapItem } from '@/domain/place';
import { PLACE_AGE_GROUP_LABELS } from '@/domain/place';
import PlaceVerifiedBadge from './PlaceVerifiedBadge';

interface PlaceInfoCardProps {
    place: PlaceMapItem;
    onClose: () => void;
}

/** 정의서 지시대로 '없음'과 '아직 확인 안 됨'을 구분해 보여준다 */
function facilityLabel(value: boolean | null): string {
    if (value === null) return '정보 없음';
    return value ? '있음' : '없음';
}

function facilityClass(value: boolean | null): string {
    if (value === null) return 'text-gray-400';
    return value ? 'text-gray-900' : 'text-gray-500';
}

export default function PlaceInfoCard({ place, onClose }: PlaceInfoCardProps) {
    const tags = [
        place.placeTypeLabel,
        place.indoorOutdoorLabel,
        place.isFree ? '무료' : '유료',
        ...place.ageGroups.map((age) => PLACE_AGE_GROUP_LABELS[age]),
    ];

    return (
        <div
            // 모바일에서는 "목록 보기" 버튼 위로 띄운다
            className="absolute inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 max-h-[60dvh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:inset-x-auto md:bottom-4 md:left-4 md:w-[340px]"
        >
            <div className="flex items-start gap-2">
                <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                        <h2 className="text-base leading-snug font-bold break-keep text-gray-900">
                            {place.name}
                        </h2>
                        {place.rating !== null && (
                            <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-600">
                                <Star
                                    size={12}
                                    className="fill-amber-400 text-amber-400"
                                    aria-hidden
                                />
                                {place.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm break-keep text-gray-600">{place.summary}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="놀거리 정보 닫기"
                    className="-m-2 shrink-0 p-2 text-gray-400 transition-colors hover:text-gray-600"
                >
                    <X size={18} />
                </button>
            </div>

            <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                    <li
                        key={tag}
                        className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
                    >
                        {tag}
                    </li>
                ))}
            </ul>

            <dl className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm">
                <div className="flex items-start gap-1.5">
                    <Clock size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                    <dt className="sr-only">운영시간</dt>
                    <dd className="break-keep text-gray-700">
                        {place.openingHours}
                        <span className="block text-xs text-gray-500">
                            휴무 · {place.closedDays}
                        </span>
                    </dd>
                </div>

                <div className="flex items-start gap-1.5">
                    <Ticket size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                    <dt className="sr-only">입장료</dt>
                    <dd className="break-keep text-gray-700">
                        {place.priceDetail ?? (place.isFree ? '무료' : '현장 확인 필요')}
                    </dd>
                </div>

                <div className="flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                    <dt className="sr-only">주소</dt>
                    <dd className="break-keep text-gray-700">
                        {place.address}
                        {place.parkingDetail && (
                            <span className="block text-xs text-gray-500">
                                주차 · {place.parkingDetail}
                            </span>
                        )}
                    </dd>
                </div>
            </dl>

            <dl className="mt-3 flex gap-4 border-t border-gray-100 pt-3 text-xs">
                <div>
                    <dt className="text-gray-500">수유실</dt>
                    <dd className={`mt-0.5 font-medium ${facilityClass(place.hasNursingRoom)}`}>
                        {facilityLabel(place.hasNursingRoom)}
                    </dd>
                </div>
                <div>
                    <dt className="text-gray-500">기저귀 교환대</dt>
                    <dd className={`mt-0.5 font-medium ${facilityClass(place.hasDiaperTable)}`}>
                        {facilityLabel(place.hasDiaperTable)}
                    </dd>
                </div>
                <div>
                    <dt className="text-gray-500">주차</dt>
                    <dd className={`mt-0.5 font-medium ${facilityClass(place.hasParking)}`}>
                        {place.hasParking === null
                            ? '정보 없음'
                            : place.hasParking
                              ? '가능'
                              : '불가'}
                    </dd>
                </div>
            </dl>

            <div className="mt-3 border-t border-gray-100 pt-3">
                <PlaceVerifiedBadge lastVerifiedAt={place.lastVerifiedAt} />
            </div>
        </div>
    );
}
