'use client';

import { Suspense } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import SidoFilter from './SidoFilter';
import RankingsLists from './RankingsLists';
import { RankingsListsSkeleton } from './RankingsSkeleton';

export default function RankingsContent() {
    const [sido, setSido] = useQueryState('sido', parseAsString);

    return (
        <div className="max-w-lg mx-auto px-4 pb-12 space-y-10 pt-6">
            <SidoFilter sido={sido} onSidoChange={setSido} />
            <Suspense fallback={<RankingsListsSkeleton />}>
                <RankingsLists key={sido ?? 'all'} sido={sido ?? undefined} />
            </Suspense>
        </div>
    );
}
