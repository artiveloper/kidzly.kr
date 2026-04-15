'use client';

import { Suspense } from 'react';
import { DaycareDetailView } from './DaycareDetailView';
import { DaycareDetailLoading } from './DaycareDetailLoading';

interface DaycareDetailPageProps {
    id: string;
}

export function DaycareDetailPage({ id }: DaycareDetailPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<DaycareDetailLoading id={id} />}>
                <DaycareDetailView id={id} />
            </Suspense>
        </div>
    );
}
