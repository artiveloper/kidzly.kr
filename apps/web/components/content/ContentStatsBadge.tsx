'use client';

import { Eye, Heart } from 'lucide-react';
import { useContentStats } from '@/domain/article';

export default function ContentStatsBadge({ uuid }: { uuid: string }) {
    const { data: stats } = useContentStats(uuid);

    if (!stats) return null;

    return (
        <span className="flex items-center gap-3 text-gray-400">
            <span className="flex items-center gap-1 whitespace-nowrap">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">조회수</span>
                {stats.viewCount.toLocaleString()}
            </span>
            {stats.likeCount > 0 && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                    <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">좋아요</span>
                    {stats.likeCount.toLocaleString()}
                </span>
            )}
        </span>
    );
}
