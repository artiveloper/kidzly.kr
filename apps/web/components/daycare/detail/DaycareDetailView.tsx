'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { sendGAEvent } from '@next/third-parties/google';
import { useDaycareDetail } from '@/domain/daycare';
import type { BlogPostMeta } from '@/lib/blog';
import DaycareDetailContent from './DaycareDetailContent';
import NaverBlogSection from './NaverBlogSection';
import NaverBlogSectionError from './NaverBlogSectionError';
import NaverBlogSectionSkeleton from './NaverBlogSectionSkeleton';
import DaycareNearbySection from './DaycareNearbySection';
import DaycareNearbySectionError from './DaycareNearbySectionError';
import DaycareNearbySectionSkeleton from './DaycareNearbySectionSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
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
    latestPosts?: BlogPostMeta[];
}

export default function DaycareDetailView({ id, latestPosts = [] }: DaycareDetailInnerProps) {
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        aria-label="뒤로가기"
                        className="shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </Button>

                    <div className="min-w-0 flex-1 px-2 text-center">
                        <h1 className="truncate text-sm leading-snug font-semibold text-gray-900">
                            {detail.name}
                        </h1>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        aria-label="공유"
                        className="shrink-0"
                    >
                        {copied ? (
                            <Check size={18} className="text-emerald-500" />
                        ) : (
                            <Share2 size={18} />
                        )}
                    </Button>
                </div>
            </div>

            <DaycareDetailContent daycare={detail} />

            <ErrorBoundary fallback={<DaycareNearbySectionError />}>
                <Suspense fallback={<DaycareNearbySectionSkeleton />}>
                    <DaycareNearbySection
                        sigunguCode={detail.sigunguCode}
                        excludeId={id}
                        latitude={detail.latitude}
                        longitude={detail.longitude}
                    />
                </Suspense>
            </ErrorBoundary>

            <ErrorBoundary fallback={<NaverBlogSectionError />}>
                <Suspense fallback={<NaverBlogSectionSkeleton />}>
                    <NaverBlogSection
                        query={buildBlogQuery(
                            detail.sigunguName,
                            detail.name,
                            detail.address
                        )}
                    />
                </Suspense>
            </ErrorBoundary>

            {latestPosts.length > 0 && (
                <section className="border-t-8 border-gray-100 px-3 py-5">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-wide">함께 보면 좋은 글</p>
                        <Link
                            href="/contents"
                            className="flex items-center gap-0.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
                        >
                            더보기
                            <ChevronRight size={12} />
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {latestPosts.map((post) => (
                            <li key={post.slug}>
                                <Link
                                    href={`/contents/${post.slug}`}
                                    className="group flex items-start gap-2"
                                >
                                    {post.thumbnail && (
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                                            <Image
                                                src={post.thumbnail}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-green-600">
                                            {post.title}
                                        </p>
                                        <span className="mt-1 block text-xs text-gray-400">
                                            {formatDate(post.publishedAt)}
                                        </span>
                                    </div>
                                    <ChevronRight
                                        size={14}
                                        className="mt-0.5 shrink-0 text-gray-300 transition-colors group-hover:text-green-500"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="border-t border-gray-100 px-3 py-4 space-y-3">
                <Link
                    href={
                        detail.sidoName
                            ? `/rankings/${encodeURIComponent(detail.sidoName)}`
                            : "/rankings"
                    }
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                    <span className="text-2xl">🏆</span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                            {detail.sidoName
                                ? `${detail.sidoName} 어린이집 랭킹`
                                : "어린이집 랭킹"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                            대기·정원·역사 순위를 한눈에
                        </p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-gray-400" />
                </Link>

                {detail.sidoName && detail.sigunguName && (
                    <Link
                        href="/daycares"
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 active:bg-gray-200"
                    >
                        <span className="text-2xl" aria-hidden="true">📍</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                {detail.sigunguName} 어린이집 전체보기
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                같은 지역 어린이집을 모두 확인해보세요
                            </p>
                        </div>
                        <ChevronRight size={16} className="shrink-0 text-gray-400" />
                    </Link>
                )}
            </div>

            {detail.dataStandardDate && (
                <p className="px-3 py-4 text-center text-xs text-gray-400">
                    데이터 출처: 어린이집 정보공개포털 · 마지막 수정일 {formatDate(detail.dataStandardDate)}
                </p>
            )}
        </>
    )
}
