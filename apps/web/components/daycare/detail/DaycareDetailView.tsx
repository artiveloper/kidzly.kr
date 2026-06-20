'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { sendGAEvent } from '@next/third-parties/google';
import { useDaycareDetail } from '@/domain/daycare';
import { DetailContent } from './DaycareDetailContent';
import { NaverBlogSection, NaverBlogSectionError, NaverBlogSectionSkeleton } from './NaverBlogSection';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { formatDate } from '@/lib/format';
import { popDaycareReturnUrl } from '@/lib/navigation';

function extractDong(address: string): string | null {
    return address.split(' ').find((part) => /[동읍면]$/.test(part)) ?? null;
}

function buildBlogQuery(sigunguName: string | null, name: string, address: string): string {
    const dong = extractDong(address);
    const location = [sigunguName, dong].filter(Boolean).join(' ');
    return location ? `${location} "${name}"` : `"${name}"`;
}

interface DaycareDetailInnerProps {
    id: string;
}

export function DaycareDetailView({ id }: DaycareDetailInnerProps) {
    const router = useRouter();
    const { data: detail } = useDaycareDetail(id);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = `${window.location.origin}/daycare/${id}`;
        const shareData = { title: detail.name, url };
        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
                sendGAEvent('event', 'share', { method: 'native', content_type: 'daycare', item_id: id });
            } catch {
                // 사용자가 취소한 경우 무시
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            sendGAEvent('event', 'share', { method: 'clipboard', content_type: 'daycare', item_id: id });
        }
    };

    const handleBack = () => {
        if (detail.latitude && detail.longitude) {
            sessionStorage.setItem(
                'map_initial_center',
                JSON.stringify({ lat: detail.latitude, lng: detail.longitude })
            );
        }
        router.replace(popDaycareReturnUrl());
    };

    return (
        <>
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
                <div className="flex items-center px-2 py-2">
                    <Button variant="ghost" size="icon" onClick={handleBack} aria-label="뒤로가기" className="shrink-0">
                        <ArrowLeft size={18} />
                    </Button>

                    <div className="flex-1 min-w-0 px-2 text-center">
                        <h1 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                            {detail.name}
                        </h1>
                        {detail.dataStandardDate && (
                            <p className="mt-0.5 text-xs text-gray-400">
                                최종 수정일 {formatDate(detail.dataStandardDate)}
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

            <DetailContent daycare={detail} />

            <ErrorBoundary fallback={<NaverBlogSectionError />}>
                <Suspense fallback={<NaverBlogSectionSkeleton />}>
                    <NaverBlogSection query={buildBlogQuery(detail.sigunguName, detail.name, detail.address)} />
                </Suspense>
            </ErrorBoundary>

            <div className="px-3 py-4 border-t border-gray-100">
                <Link
                    href={detail.sidoName
                        ? `/rankings?sido=${encodeURIComponent(detail.sidoName)}`
                        : '/rankings'
                    }
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    <span className="text-2xl">🏆</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            {detail.sidoName ? `${detail.sidoName} 어린이집 랭킹` : '어린이집 랭킹'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">대기·정원·역사 순위를 한눈에</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-gray-400" />
                </Link>
            </div>
        </>
    );
}
