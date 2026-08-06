'use client';

import Link from 'next/link';
import { useDaycareNearby } from '@/domain/daycare';
import TypeBadge from '@/components/rankings/TypeBadge';

type Props = {
    sigunguCode: string;
    excludeId: string;
};

export default function DaycareNearbySection({ sigunguCode, excludeId }: Props) {
    const { data: items } = useDaycareNearby({ sigunguCode, excludeId, limit: 10 });

    return (
        <section className="px-3 py-4 border-t-8 border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2.5">
                같은 지역 다른 어린이집
            </p>

            {items.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">
                    같은 지역에 등록된 다른 어린이집 정보가 없습니다.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/daycare/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 min-w-0 flex-col justify-center gap-1 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all"
                        >
                            <TypeBadge typeName={item.typeName} className="self-start" />
                            <span className="text-xs font-semibold text-gray-900 truncate">
                                {item.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
