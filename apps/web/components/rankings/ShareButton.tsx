'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

type Props = {
    title: string;
    url: string;
};

export default function ShareButton({ title, url }: Props) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = { title, url };
        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
                sendGAEvent('event', 'share_ranking', { method: 'native', url });
            } catch {
                // 사용자가 취소한 경우 무시
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            sendGAEvent('event', 'share_ranking', { method: 'clipboard', url });
        }
    };

    return (
        <button
            onClick={handleShare}
            aria-label="공유"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2.5 transition-colors bg-white"
        >
            {copied
                ? <><Check size={13} className="text-emerald-500" /><span className="text-emerald-500">복사됨</span></>
                : <><Share2 size={13} />공유</>
            }
        </button>
    );
}
