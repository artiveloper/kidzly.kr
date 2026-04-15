'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { DaycareListItem } from '@/domain/daycare';
import { RecentSearches } from './RecentSearches';
import { DaycareList } from './DaycareList';
import { DaycareFilters } from './filters/DaycareFilters';

interface ListPanelProps {
    searchQuery: string;
    onSearchChange: (v: string) => void;
    onClearSearch: () => void;
    onSearch: (v: string) => void;
    recentSearches: string[];
    onRemoveRecentSearch: (s: string) => void;
    daycares: DaycareListItem[];
    isLoading?: boolean;
    scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function ListPanel({
    searchQuery,
    onSearchChange,
    onClearSearch,
    onSearch,
    recentSearches,
    onRemoveRecentSearch,
    daycares,
    isLoading = false,
    scrollRef,
}: ListPanelProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Search bar */}
            <form
                className="px-4 py-3 border-b border-gray-100"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch(searchQuery);
                }}
            >
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="어린이집 이름, 주소로 검색"
                        className="w-full h-10 pl-9 pr-9 text-sm bg-gray-100 rounded-lg border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={onClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </form>

            {/* Recent searches — only when not searching */}
            {!searchQuery && (
                <RecentSearches
                    searches={recentSearches}
                    onSelect={(s) => {
                        onSearchChange(s);
                        onSearch(s);
                    }}
                    onRemove={onRemoveRecentSearch}
                />
            )}

            {/* Filters */}
            <DaycareFilters />

            {/* List */}
            <DaycareList
                daycares={daycares}
                isLoading={isLoading}
                scrollRef={scrollRef}
            />
        </div>
    );
}
