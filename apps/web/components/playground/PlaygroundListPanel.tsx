'use client';

// 놀이시설 레이어에서 지도 영역 안의 시설을 나열하는 패널
import { X } from 'lucide-react';
import type { PlaygroundMapItem } from '@/domain/playground';
import PlaygroundListSkeleton from './PlaygroundListSkeleton';

interface PlaygroundListPanelProps {
    playgrounds: PlaygroundMapItem[];
    isLoading?: boolean;
    selectedId?: string | null;
    onSelect: (id: string) => void;
    onClose?: () => void;
}

export default function PlaygroundListPanel({
    playgrounds,
    isLoading = false,
    selectedId,
    onSelect,
    onClose,
}: PlaygroundListPanelProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                    이 지역 놀이시설{' '}
                    <span className="font-bold text-amber-600">{playgrounds.length}</span>곳
                </p>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="목록 닫기"
                        className="-m-2 p-2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && playgrounds.length === 0 ? (
                    <PlaygroundListSkeleton />
                ) : playgrounds.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm break-keep text-gray-500">
                        이 지역에는 등록된 놀이시설이 없습니다. 지도를 옮기거나 넓혀서 찾아보세요.
                    </p>
                ) : (
                    <ul>
                        {playgrounds.map((playground) => {
                            const tags = [playground.indoorOutdoor, playground.installPlace].filter(
                                (tag): tag is string => Boolean(tag)
                            );
                            return (
                                <li key={playground.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(playground.id)}
                                        className={`min-h-11 w-full border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                                            playground.id === selectedId
                                                ? 'bg-amber-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <p className="text-sm font-semibold break-keep text-gray-900">
                                            {playground.name}
                                        </p>
                                        {playground.address && (
                                            <p className="mt-0.5 text-xs break-keep text-gray-500">
                                                {playground.address}
                                            </p>
                                        )}
                                        {tags.length > 0 && (
                                            <p className="mt-1 text-xs text-amber-700">
                                                {tags.join(' · ')}
                                            </p>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
