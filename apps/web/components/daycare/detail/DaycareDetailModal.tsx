'use client';

import { Suspense } from 'react';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { DaycareDetailView } from './DaycareDetailView';
import { DaycareDetailLoading } from './DaycareDetailLoading';

interface DaycareDetailModalProps {
    id: string;
}

export function DaycareDetailModal({ id }: DaycareDetailModalProps) {
    const isMobile = useIsMobile();

    // 모바일은 DaycareMap의 Drawer 안에서 렌더링
    if (isMobile) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col overflow-y-auto bg-white md:left-0 md:right-auto md:w-[360px] md:border-r md:border-gray-200 md:shadow-sm">
            <Suspense fallback={<DaycareDetailLoading />}>
                <DaycareDetailView id={id} />
            </Suspense>
        </div>
    );
}
