'use client';

import { Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { DaycareDetailView } from './DaycareDetailView';
import { DaycareDetailLoading } from './DaycareDetailLoading';

interface DaycareDetailModalProps {
    id: string;
}

export function DaycareDetailModal({ id }: DaycareDetailModalProps) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const pathname = usePathname();

    // 모바일은 DaycareMap의 Drawer 안에서 렌더링
    if (isMobile) return null;

    // 뒤로가기 시 URL은 바뀌지만 @modal 슬롯이 즉시 언마운트되지 않는 Next.js 이슈 대응
    if (!pathname.startsWith('/daycare/')) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col overflow-y-auto bg-white md:left-0 md:right-auto md:w-[360px] md:border-r md:border-gray-200 md:shadow-sm">
            <Suspense fallback={<DaycareDetailLoading />}>
                <DaycareDetailView id={id} onBack={() => router.replace('/')} />
            </Suspense>
        </div>
    );
}
