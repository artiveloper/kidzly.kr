'use client';

import Link from 'next/link';
import { useDaycareRegionList } from '@/domain/daycare';
import TypeBadge from '@/components/rankings/TypeBadge';

type Props = {
    sido: string;
    sigungu: string;
};

// 카드는 이름+유형뱃지+주소만(밀도 낮춰 최대 72개도 스크롤 부담 적게) — SSR 시 실제 <a href>가
// hydration 전에 존재해야 하므로 next/link를 직접 렌더(클라이언트 전용 표시로 숨기지 않음)
export default function RegionDaycareList({ sido, sigungu }: Props) {
    const { data } = useDaycareRegionList({ sido, sigungu });
    const { items, totalCount } = data;

    if (items.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-gray-500">
                현재 정상 운영 중인 어린이집 정보가 없습니다.
            </p>
        );
    }

    return (
        <div>
            {totalCount > items.length && (
                <p className="mb-3 text-xs text-gray-500">
                    전체 {totalCount}개 중 {items.length}개를 보여드려요.
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
        </div>
    );
}
