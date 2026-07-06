'use client';

import { useContentStats } from '@/domain/article';

export default function ContentStatsBadge({ uuid }: { uuid: string }) {
    const { data: stats } = useContentStats(uuid);

    if (!stats) return null;

    return (
        <span className="flex items-center gap-2 text-gray-400">
            <span>조회수 {stats.viewCount.toLocaleString()}</span>
            {stats.likeCount > 0 && (
                <>
                    <span>·</span>
                    <span>좋아요 {stats.likeCount.toLocaleString()}</span>
                </>
            )}
        </span>
    );
}
