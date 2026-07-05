'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContentStats, articleKeys } from '@/domain/article';

const STORAGE_KEY = (uuid: string) => `liked_${uuid}`;

function getIsLiked(uuid: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY(uuid)) === '1';
}

function setIsLiked(uuid: string, value: boolean) {
    if (value) {
        localStorage.setItem(STORAGE_KEY(uuid), '1');
    } else {
        localStorage.removeItem(STORAGE_KEY(uuid));
    }
}

export default function LikeButton({ uuid }: { uuid: string }) {
    const { data: stats } = useContentStats(uuid);
    const [liked, setLiked] = useState(() => getIsLiked(uuid));
    const [pending, setPending] = useState(false);
    const queryClient = useQueryClient();

    async function handleClick() {
        if (pending) return;
        const nextLiked = !liked;
        const delta = nextLiked ? 1 : -1;

        setLiked(nextLiked);
        setIsLiked(uuid, nextLiked);
        setPending(true);

        try {
            await fetch(`/api/article/${uuid}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta }),
            });
            await queryClient.invalidateQueries({ queryKey: articleKeys.stats(uuid) });
        } catch {
            setLiked(!nextLiked);
            setIsLiked(uuid, !nextLiked);
        } finally {
            setPending(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={pending}
            aria-label={liked ? '좋아요 취소' : '좋아요'}
            aria-pressed={liked}
            className={[
                'flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
                'min-h-[44px] min-w-[44px]',
                liked
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
                pending && 'opacity-60',
            ].join(' ')}
        >
            <span aria-hidden>{liked ? '❤️' : '🤍'}</span>
            <span>도움이 됐어요 {stats && stats.likeCount > 0 && stats.likeCount}</span>
        </button>
    );
}
