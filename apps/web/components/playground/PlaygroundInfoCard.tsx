'use client';

// 지도에서 선택한 놀이시설의 간단 정보를 지도 위에 띄우는 카드
import { MapPin, X } from 'lucide-react';
import type { PlaygroundMapItem } from '@/domain/playground';

interface PlaygroundInfoCardProps {
    playground: PlaygroundMapItem;
    onClose: () => void;
}

export default function PlaygroundInfoCard({ playground, onClose }: PlaygroundInfoCardProps) {
    const tags = [playground.indoorOutdoor, playground.installPlace].filter(
        (tag): tag is string => Boolean(tag)
    );

    return (
        <div
            // 모바일에서는 "목록 보기" 버튼 위로 띄운다
            className="absolute inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:inset-x-auto md:bottom-4 md:left-4 md:w-[320px]"
        >
            <div className="flex items-start gap-2">
                <h2 className="flex-1 text-base leading-snug font-bold break-keep text-gray-900">
                    {playground.name}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="놀이시설 정보 닫기"
                    className="-m-2 shrink-0 p-2 text-gray-400 transition-colors hover:text-gray-600"
                >
                    <X size={18} />
                </button>
            </div>

            {tags.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <li
                            key={tag}
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            )}

            {playground.address && (
                <p className="mt-2.5 flex items-start gap-1.5 text-sm break-keep text-gray-600">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                    {playground.address}
                </p>
            )}
        </div>
    );
}
