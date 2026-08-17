'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useDaycareRegionList, daycareFilterParsers } from '@/domain/daycare';
import TypeBadge from '@/components/rankings/TypeBadge';

type Props = {
    /** sigungus.arcode와 동일한 값 공간의 시군구 코드 (daycares.sigungu_code) */
    sigunguCode: string;
};

// 카드는 이름+유형뱃지+주소만(밀도 낮춰 대형 지역도 스크롤 부담 적게) — SSR 시 실제 <a href>가
// hydration 전에 존재해야 하므로 next/link를 직접 렌더(클라이언트 전용 표시로 숨기지 않음)
// totalCount > items.length 안내문구는 안전장치 상한(1000)에 걸리는 이상 데이터 대비용으로
// 남겨둠 — 실제 지역에서는 노출되지 않음(실측 최대 779건)
//
// 유형/연령/지원서비스 필터는 /map(DaycareMap)과 동일한 정책: 연령·지원서비스·통학차량은
// 쿼리 파라미터로 서버에 전달해 DB에서 필터링하고, 유형만 결과를 클라이언트에서 추가로 거른다
// (지역 스코프 결과가 이미 소량이라 유형까지 서버 왕복할 필요는 없음).
// 필터 UI(DaycareFilters) 자체는 부모(SidoChipList)가 Suspense 경계 밖에서 렌더한다 —
// 여기 두면 필터를 바꿀 때마다 이 컴포넌트가 통째로 suspend되며 필터 바까지 스켈레톤에 가려진다.
export default function RegionDaycareList({ sigunguCode }: Props) {
    const [activeType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAge] = useQueryState('age', daycareFilterParsers.age);

    const { data } = useDaycareRegionList({
        sigunguCode,
        vehicleOperation: vehicleOperation || undefined,
        services: activeServices.length > 0 ? activeServices : undefined,
        ages: activeAge !== null ? [Number(activeAge)] : undefined,
    });
    const { totalCount } = data;

    const items = useMemo(
        () => data.items.filter((item) => activeType.length === 0 || activeType.includes(item.typeName)),
        [data.items, activeType],
    );

    return (
        <div>
            {items.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                    조건에 맞는 어린이집이 없습니다.
                </p>
            ) : (
                <>
                    {totalCount > data.items.length && (
                        <p className="mb-3 text-xs text-gray-500">
                            전체 {totalCount}개 중 {data.items.length}개를 보여드려요.
                        </p>
                    )}
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={`/daycare/${item.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-11 flex-col justify-center gap-1 rounded-lg border border-gray-100 bg-white px-3 py-2.5 transition-all hover:border-gray-200 hover:shadow-sm active:bg-gray-50"
                                >
                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <TypeBadge typeName={item.typeName} />
                                        <span className="truncate text-sm font-semibold text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>
                                    <p className="truncate text-xs text-gray-500">{item.address}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
