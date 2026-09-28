'use client';

// 놀거리 정보를 운영자가 마지막으로 확인한 시점을 알려주는 배지
import { BadgeCheck } from 'lucide-react';
import { formatDate } from '@/lib/format';

/** 요금·시설 정보는 6개월이면 절반쯤 틀려지므로, 오래된 확인일은 색으로 구분한다 */
const STALE_MONTHS = 6;

function monthsSince(dateStr: string): number | null {
    const verified = new Date(`${dateStr}T00:00:00+09:00`);
    if (Number.isNaN(verified.getTime())) return null;
    const days = (Date.now() - verified.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 0) return null;
    return Math.floor(days / 30);
}

export default function PlaceVerifiedBadge({ lastVerifiedAt }: { lastVerifiedAt: string }) {
    const months = monthsSince(lastVerifiedAt);
    const isStale = months !== null && months >= STALE_MONTHS;

    const label =
        months === null
            ? `${formatDate(lastVerifiedAt)} 확인`
            : months === 0
              ? '이번 달 확인'
              : `${months}개월 전 확인`;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isStale ? 'bg-gray-100 text-gray-600' : 'bg-violet-50 text-violet-700'
            }`}
            title={`최종 확인일 ${formatDate(lastVerifiedAt)}`}
        >
            <BadgeCheck size={12} aria-hidden />
            {label}
        </span>
    );
}
