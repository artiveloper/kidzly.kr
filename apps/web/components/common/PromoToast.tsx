'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

const STORAGE_KEY = 'promo_toast_dismissed';

type PromoVariant =
    | { type: 'ranking' }
    | { type: 'content'; post: BlogPostMeta };

interface PromoToastProps {
    latestPost?: BlogPostMeta;
}

export default function PromoToast({ latestPost }: PromoToastProps) {
    const [promo, setPromo] = useState<PromoVariant | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        // 세션마다 랭킹/최신 콘텐츠 프로모를 랜덤으로 로테이션
        const chosen: PromoVariant =
            latestPost && Math.random() < 0.5
                ? { type: 'content', post: latestPost }
                : { type: 'ranking' };
        const timer = setTimeout(() => setPromo(chosen), 1500);
        return () => clearTimeout(timer);
    }, [latestPost]);

    const dismiss = () => {
        setPromo(null);
        sessionStorage.setItem(STORAGE_KEY, '1');
    };

    if (!promo) return null;

    const { emoji, text, href } =
        promo.type === 'content'
            ? { emoji: '📖', text: promo.post.title, href: `/contents/${promo.post.slug}` }
            : { emoji: '🏆', text: '전국 어린이집 랭킹을 확인해보세요', href: '/rankings' };

    return (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl">
                <span className="text-xl shrink-0">{emoji}</span>
                <p className="flex-1 text-sm font-medium leading-snug line-clamp-2">
                    {text}
                </p>
                <Link
                    href={href}
                    onClick={dismiss}
                    className="shrink-0 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
                >
                    보기
                </Link>
                <button
                    onClick={dismiss}
                    aria-label="닫기"
                    className="shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}
