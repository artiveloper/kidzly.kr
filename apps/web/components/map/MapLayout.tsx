'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import type { DaycareType, MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds } from '@/domain/daycare';
import { Header } from './Header';
import { SearchPanel } from './SearchPanel';
import { NaverMapView, type NaverMapViewHandle } from './NaverMapView';
import { MobileBottomSheet } from './MobileBottomSheet';

export function MapLayout() {
    const [bounds, setBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const [searchQuery, setSearchQuery] = useQueryState(
        'q',
        parseAsString.withDefault('')
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<DaycareType | 'all'>('all');
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const { data: daycares = [], isFetching } = useDaycaresInBounds(
        bounds,
        searchQuery || undefined
    );

    const mapViewRef = useRef<NaverMapViewHandle>(null);
    const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleBoundsChange = useCallback((newBounds: MapBounds) => {
        clearTimeout(boundsTimerRef.current);
        boundsTimerRef.current = setTimeout(() => {
            setBounds(newBounds);
        }, 600);
    }, []);

    const filteredDaycares = useMemo(() => {
        return daycares.filter(
            (d) => activeFilter === 'all' || d.type === activeFilter
        );
    }, [daycares, activeFilter]);

    const handleSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setRecentSearches((prev) =>
            [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5)
        );
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
        onClearSearch: () => {
            setSearchQuery(null);
            const currentBounds = mapViewRef.current?.getCurrentBounds();
            if (currentBounds) setBounds(currentBounds);
        },
        onSelectDaycare: (id: string) => {
            setSelectedId((prev) => (prev === id ? null : id));
            setIsBottomSheetOpen(false);
            const daycare = daycares.find((d) => d.id === id);
            if (daycare?.latitude && daycare?.longitude) {
                mapViewRef.current?.panTo(daycare.latitude, daycare.longitude);
            }
        },
        isLoading: isFetching,
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    <SearchPanel {...panelProps} />
                </aside>

                <main className="flex-1 relative">
                    <NaverMapView
                        ref={mapViewRef}
                        daycares={filteredDaycares}
                        selectedId={selectedId}
                        onSelectDaycare={(id) => setSelectedId((prev) => (prev === id ? null : id))}
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
