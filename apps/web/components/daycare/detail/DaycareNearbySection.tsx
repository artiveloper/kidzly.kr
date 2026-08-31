'use client';

import Link from 'next/link';
import { useDaycareNearby } from '@/domain/daycare';
import TypeBadge from '@/components/rankings/TypeBadge';
import { formatDistanceKm } from '@/lib/geo';

type Props = {
    sigunguCode: string;
    excludeId: string;
    latitude: number | null;
    longitude: number | null;
};

export default function DaycareNearbySection({ sigunguCode, excludeId, latitude, longitude }: Props) {
    const { data: items } = useDaycareNearby({ sigunguCode, excludeId, latitude, longitude, limit: 10 });

    return (
        <section className="px-3 py-4 border-t-8 border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2.5">
                주변 다른 어린이집
            </h2>

            {items.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">
                    주변에 등록된 다른 어린이집 정보가 없습니다.
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
                            <div className="flex items-center gap-1">
                                <TypeBadge typeName={item.typeName} />
                                {item.distanceKm !== null && (
                                    <span className="text-[11px] text-gray-500">
                                        {formatDistanceKm(item.distanceKm)}
                                    </span>
                                )}
                            </div>
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
