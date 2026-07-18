'use client';

import { Fragment, useMemo } from 'react';
import { useQueryState } from 'nuqs';
import type { DaycareListItem as DaycareListItemType, DaycareAgeFilter } from '@/domain/daycare';
import { daycareFilterParsers } from '@/domain/daycare';
import type { BlogPostMeta } from '@/lib/blog';
import DaycareListItem from './DaycareListItem';
import ContentPromoCard from './ContentPromoCard';

// 목록이 충분히 길 때만 자연스럽게 끼워넣기 위한 삽입 위치(0-based, 해당 인덱스 항목 뒤에 삽입)
const CONTENT_SLOT_POSITIONS = [5, 15];

interface DaycareListProps {
    daycares: DaycareListItemType[];
    isLoading?: boolean;
    scrollRef?: React.RefObject<HTMLDivElement | null>;
    promoPosts?: BlogPostMeta[];
}

export default function DaycareList({ daycares, isLoading = false, scrollRef, promoPosts = [] }: DaycareListProps) {
    const [activeAgeStr] = useQueryState('age', daycareFilterParsers.age);
    const activeAge = (activeAgeStr ? Number(activeAgeStr) : null) as DaycareAgeFilter | null;

    const contentSlots = useMemo(() => {
        const slots = new Map<number, BlogPostMeta>();
        CONTENT_SLOT_POSITIONS.forEach((position, i) => {
            const post = promoPosts[i];
            if (post) slots.set(position, post);
        });
        return slots;
    }, [promoPosts]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative pb-4">
            {/* 로딩 인디케이터 — 리스트 위에 얇은 바 */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-emerald-100 overflow-hidden z-10 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite]" />
            </div>

            {daycares.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <p className="text-sm text-gray-500">이 지역에 어린이집이 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">지도를 이동하거나 필터를 변경해 보세요.</p>
                </div>
            ) : (
                <>
                    <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                            총 {' '}
                            <span className="font-semibold text-gray-900">{daycares.length}</span>개 어린이집
                        </p>
                        {isLoading && (
                            <span className="text-[10px] text-emerald-500 font-medium">업데이트 중...</span>
                        )}
                    </div>
                    {daycares.map((daycare, index) => {
                        const promoPost = contentSlots.get(index) ?? null;
                        return (
                            <Fragment key={daycare.id}>
                                <DaycareListItem
                                    daycare={daycare}
                                    activeAge={activeAge}
                                />
                                {promoPost && <ContentPromoCard post={promoPost} />}
                            </Fragment>
                        );
                    })}
                </>
            )}
        </div>
    );
}
