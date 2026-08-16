'use client';

import { useRouter } from 'next/navigation';
import { Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import DetailSkeleton from './DetailSkeleton';

export default function DaycareDetailLoading() {
    const router = useRouter();

    const handleBack = () => {
        router.replace('/map');
    };

    return (
        <>
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center px-2 py-2">
                    <Button variant="ghost" size="icon" onClick={handleBack} aria-label="뒤로가기" className="shrink-0">
                        <ArrowLeft size={18} />
                    </Button>

                    <div className="flex-1 min-w-0 px-2 text-center animate-pulse">
                        <div className="h-4 w-36 rounded bg-gray-200 mx-auto" />
                    </div>

                    <Button variant="ghost" size="icon" aria-label="공유" className="shrink-0" disabled>
                        <Share2 size={18} />
                    </Button>
                </div>
            </div>

            <DetailSkeleton />
        </>
    );
}
