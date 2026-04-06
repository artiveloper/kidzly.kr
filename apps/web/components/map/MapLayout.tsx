'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import type { DaycareType, MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds } from '@/domain/daycare';
import { Header } from './Header';
import { SearchPanel } from './SearchPanel';
import { NaverMapView } from './NaverMapView';
import { MobileBottomSheet } from './MobileBottomSheet';

export function MapLayout() {
    const [bounds, setBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<DaycareType | 'all'>('all');
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const { data: daycares = [], isFetching } = useDaycaresInBounds(bounds);

    const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleBoundsChange = useCallback((newBounds: MapBounds) => {
        clearTimeout(boundsTimerRef.current);
        boundsTimerRef.current = setTimeout(() => {
            setBounds(newBounds);
        }, 600);
    }, []);

    const filteredDaycares = useMemo(() => {
        const q = searchQuery.trim();
        return daycares.filter((d) => {
            const matchesSearch = !q || d.name.includes(q) || d.address.includes(q);
            const matchesFilter = activeFilter === 'all' || d.type === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [daycares, searchQuery, activeFilter]);

    const handleSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setRecentSearches((prev) =>
            [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5),
        );
    };

    const handleSelectDaycare = (id: string) => {
        setSelectedId((prev) => (prev === id ? null : id));
    };

    const panelProps = {
        searchQuery,
        onSearchChange: setSearchQuery,
        onSearch: handleSearch,
        recentSearches,
        onRemoveRecentSearch: (s: string) =>
            setRecentSearches((prev) => prev.filter((r) => r !== s)),
        activeFilter,
        onFilterChange: setActiveFilter,
        daycares: filteredDaycares,
        selectedId,
        onSelectDaycare: (id: string) => {
            handleSelectDaycare(id);
            setIsBottomSheetOpen(false);
        },
        isLoading: isFetching,
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
            />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    <SearchPanel {...panelProps} />
                </aside>

                <main className="flex-1 relative">
                    <NaverMapView
                        daycares={filteredDaycares}
                        selectedId={selectedId}
                        onSelectDaycare={handleSelectDaycare}
                        onBoundsChange={handleBoundsChange}
                        onOpenBottomSheet={() => setIsBottomSheetOpen(true)}
                    />
                </main>
            </div>

            <MobileBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
            >
                <SearchPanel {...panelProps} />
            </MobileBottomSheet>
        </div>
    );
}
