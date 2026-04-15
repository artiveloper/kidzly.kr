'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useDaycareDetail } from '@/domain/daycare';
import { DetailContent, formatDate } from './DaycareDetailContent';

interface DaycareDetailInnerProps {
    id: string;
    onBack?: () => void;
}

export function DaycareDetailView({ id, onBack }: DaycareDetailInnerProps) {
    const router = useRouter();
    const { data: detail } = useDaycareDetail(id);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = `${window.location.origin}/daycare/${id}`;
        const shareData = { title: detail.name, url };
        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
            } catch {
                // 사용자가 취소한 경우 무시
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push('/');
        }
    };

    return (
        <>
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
                <div className="max-w-2xl mx-auto flex items-center px-2 py-2">
                    <Button variant="ghost" size="icon" onClick={handleBack} aria-label="뒤로가기" className="shrink-0">
                        <ArrowLeft size={18} />
                    </Button>

                    <div className="flex-1 min-w-0 px-2 text-center">
                        <h1 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                            {detail.name}
                        </h1>
                        {detail.dataStandardDate && (
                            <p className="mt-0.5 text-xs text-gray-400">
                                {formatDate(detail.dataStandardDate)} 기준
                            </p>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        aria-label="공유"
                        className="shrink-0"
                    >
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                    </Button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <DetailContent daycare={detail} />
            </div>
        </>
    );
}
