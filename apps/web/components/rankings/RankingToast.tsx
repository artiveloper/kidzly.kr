'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const STORAGE_KEY = 'ranking_toast_dismissed';

export function RankingToast() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        setVisible(false);
        sessionStorage.setItem(STORAGE_KEY, '1');
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl">
                <span className="text-xl shrink-0">🏆</span>
                <p className="flex-1 text-sm font-medium leading-snug">
                    전국 어린이집 랭킹을 확인해보세요
                </p>
                <Link
                    href="/rankings"
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
