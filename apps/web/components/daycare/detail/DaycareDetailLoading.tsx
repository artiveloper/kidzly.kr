'use client';

import { useRouter } from 'next/navigation';
import { Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { DetailSkeleton } from './DaycareDetailContent';

interface DaycareDetailLoadingProps {
    onBack?: () => void;
}

export function DaycareDetailLoading({ onBack }: DaycareDetailLoadingProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (window.history.length <= 1) {
            router.push('/');
        } else {
            router.back();
        }
    };

    return (
        <>
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <div className="max-w-2xl mx-auto flex items-center px-2 py-2">
                    <Button variant="ghost" size="icon" onClick={handleBack} aria-label="뒤로가기" className="shrink-0">
                        <ArrowLeft size={18} />
                    </Button>

                    <div className="flex-1 min-w-0 px-2 text-center animate-pulse">
                        <div className="h-4 w-36 rounded bg-gray-200 mx-auto" />
                        <div className="h-3 w-24 rounded bg-gray-100 mx-auto mt-1.5" />
                    </div>

                    <Button variant="ghost" size="icon" aria-label="공유" className="shrink-0" disabled>
                        <Share2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <DetailSkeleton />
            </div>
        </>
    );
}
