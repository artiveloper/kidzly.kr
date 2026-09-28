'use client';

// 놀거리 지도의 필터 바 — 정의서가 상한으로 정한 5개 축만 둔다
import { useQueryState } from 'nuqs';
import { RotateCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { PlaceAgeGroup, PlaceIndoorOutdoor, PlaceType } from '@/domain/place';
import {
    PLACE_AGE_GROUPS,
    PLACE_AGE_GROUP_LABELS,
    PLACE_INDOOR_OUTDOORS,
    PLACE_INDOOR_OUTDOOR_LABELS,
    PLACE_TYPES,
    PLACE_TYPE_LABELS,
    placeFilterParsers,
} from '@/domain/place';
import PlaceMultiFilter from './PlaceMultiFilter';

const PLACE_TYPE_EMOJI: Record<PlaceType, string> = {
    kids_cafe: '🎠',
    park: '🌳',
    indoor_playground: '🧸',
    museum: '🔬',
    zoo: '🦒',
    library: '📚',
    cafe: '☕',
};

const TYPE_OPTIONS = PLACE_TYPES.map((value) => ({
    value,
    label: PLACE_TYPE_LABELS[value],
    emoji: PLACE_TYPE_EMOJI[value],
}));

const AGE_OPTIONS = PLACE_AGE_GROUPS.map((value) => ({
    value,
    label: PLACE_AGE_GROUP_LABELS[value],
}));

const INDOOR_OUTDOOR_OPTIONS = PLACE_INDOOR_OUTDOORS.map((value) => ({
    value,
    label: PLACE_INDOOR_OUTDOOR_LABELS[value],
}));

/** 선택한 값이 1개면 그 이름을, 여럿이면 "○○ 외 N개"를 보여준다 */
function summarize(labels: string[], fallback: string): string {
    const [first] = labels;
    if (first === undefined) return fallback;
    return labels.length === 1 ? first : `${first} 외 ${labels.length - 1}개`;
}

function toggle<T extends string>(current: T[], value: T): T[] {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export default function PlaceFilters({ className }: { className?: string }) {
    const [types, setTypes] = useQueryState('ptype', placeFilterParsers.ptype);
    const [ages, setAges] = useQueryState('page', placeFilterParsers.page);
    const [indoorOutdoors, setIndoorOutdoors] = useQueryState('io', placeFilterParsers.io);
    const [freeOnly, setFreeOnly] = useQueryState('free', placeFilterParsers.free);
    const [parkingOnly, setParkingOnly] = useQueryState('parking', placeFilterParsers.parking);

    // URL을 손으로 고쳐 들어온 미정의 코드는 라벨이 없으므로 요약에서 빠진다
    const typeLabels = types.flatMap((v) => PLACE_TYPE_LABELS[v as PlaceType] ?? []);
    const ageLabels = ages.flatMap((v) => PLACE_AGE_GROUP_LABELS[v as PlaceAgeGroup] ?? []);
    const ioLabels = indoorOutdoors.flatMap(
        (v) => PLACE_INDOOR_OUTDOOR_LABELS[v as PlaceIndoorOutdoor] ?? []
    );

    const isAnyActive =
        types.length > 0 ||
        ages.length > 0 ||
        indoorOutdoors.length > 0 ||
        freeOnly ||
        parkingOnly;

    // null을 넣어야 기본값일 때 query param이 URL에서 사라진다
    const resetAll = () => {
        setTypes(null);
        setAges(null);
        setIndoorOutdoors(null);
        setFreeOnly(null);
        setParkingOnly(null);
    };

    return (
        <div className={cn('scrollbar-none flex gap-2 overflow-x-auto px-4 py-2.5', className)}>
            {isAnyActive && (
                <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 px-2"
                    aria-label="필터 초기화"
                    onClick={resetAll}
                >
                    <RotateCcw size={14} />
                </Button>
            )}

            <PlaceMultiFilter
                title="장소유형 선택"
                label={summarize(typeLabels, '유형')}
                options={TYPE_OPTIONS}
                selected={types as PlaceType[]}
                onToggle={(value) => {
                    const next = toggle(types as PlaceType[], value);
                    setTypes(next.length > 0 ? next : null);
                }}
            />

            <PlaceMultiFilter
                title="대상연령 선택"
                label={summarize(ageLabels, '연령')}
                options={AGE_OPTIONS}
                selected={ages as PlaceAgeGroup[]}
                onToggle={(value) => {
                    const next = toggle(ages as PlaceAgeGroup[], value);
                    setAges(next.length > 0 ? next : null);
                }}
            />

            <PlaceMultiFilter
                title="실내·실외 선택"
                label={summarize(ioLabels, '실내외')}
                options={INDOOR_OUTDOOR_OPTIONS}
                selected={indoorOutdoors as PlaceIndoorOutdoor[]}
                onToggle={(value) => {
                    const next = toggle(indoorOutdoors as PlaceIndoorOutdoor[], value);
                    setIndoorOutdoors(next.length > 0 ? next : null);
                }}
            />

            <Button
                size="sm"
                variant={freeOnly ? 'default' : 'outline'}
                className="shrink-0 whitespace-nowrap"
                aria-pressed={freeOnly}
                onClick={() => setFreeOnly(freeOnly ? null : true)}
            >
                무료
            </Button>

            <Button
                size="sm"
                variant={parkingOnly ? 'default' : 'outline'}
                className="shrink-0 whitespace-nowrap"
                aria-pressed={parkingOnly}
                onClick={() => setParkingOnly(parkingOnly ? null : true)}
            >
                주차 가능
            </Button>
        </div>
    );
}
