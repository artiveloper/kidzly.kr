'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import type { MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds, daycareFilterParsers } from '@/domain/daycare';
import { Header } from './Header';
import { SearchPanel } from '../list/SearchPanel';
import { DaycareDetail } from '../detail/DaycareDetail';
import { NaverMapView, type NaverMapViewHandle } from './NaverMapView';
import { Drawer, DrawerContent, DrawerTitle } from '@workspace/ui/components/drawer';

export function MapLayout() {
    const [bounds, setBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
    const [activeType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAge] = useQueryState('age', daycareFilterParsers.age);

    const { data: daycares = [], isFetching } = useDaycaresInBounds(bounds, {
        query: searchQuery || undefined,
        vehicleOperation: vehicleOperation || undefined,
        services: activeServices.length > 0 ? activeServices : undefined,
        ages: activeAge !== null ? [Number(activeAge)] : undefined,
    });

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
            (d) => activeType.length === 0 || activeType.includes(d.typeName)
        );
    }, [daycares, activeType]);

    const handleSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setRecentSearches((prev) =>
            [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5)
        );
    };

    const selectedListItem = selectedId ? daycares.find((d) => d.id === selectedId) ?? null : null;

    const handleSelectDaycare = (id: string) => {
        setSelectedId(id);
        setIsBottomSheetOpen(true);
        const daycare = daycares.find((d) => d.id === id);
        if (daycare?.latitude && daycare?.longitude) {
            mapViewRef.current?.panTo(daycare.latitude, daycare.longitude);
        }
    };

    const handleBack = () => {
        setSelectedId(null);
    };

    const panelProps = {
        searchQuery,
        onSearchChange: setSearchQuery,
        onClearSearch: () => {
            setSearchQuery(null);
            const currentBounds = mapViewRef.current?.getCurrentBounds();
            if (currentBounds) setBounds(currentBounds);
        },
        onSearch: handleSearch,
        recentSearches,
        onRemoveRecentSearch: (s: string) =>
            setRecentSearches((prev) => prev.filter((r) => r !== s)),
        daycares: filteredDaycares,
        onSelectDaycare: handleSelectDaycare,
        isLoading: isFetching,
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    <div className="relative flex-1 overflow-hidden h-full">
                        <div className={`absolute inset-0 transition-transform duration-300 ${selectedListItem ? '-translate-x-full' : 'translate-x-0'}`}>
                            <SearchPanel {...panelProps} />
                        </div>
                        <div className={`absolute inset-0 transition-transform duration-300 ${selectedListItem ? 'translate-x-0' : 'translate-x-full'}`}>
                            {selectedId && selectedListItem && (
                                <DaycareDetail id={selectedId} listItem={selectedListItem} onBack={handleBack} />
                            )}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative">
                    <NaverMapView
                        ref={mapViewRef}
                        daycares={filteredDaycares}
                        selectedId={selectedId}
                        onSelectDaycare={handleSelectDaycare}
                        onBoundsChange={handleBoundsChange}
                        onOpenBottomSheet={() => setIsBottomSheetOpen(true)}
                    />
                </main>
            </div>

            <Drawer
                open={isBottomSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsBottomSheetOpen(false);
                        setSelectedId(null);
                    }
                }}
            >
                <DrawerContent className="md:hidden h-[65dvh]">
                    <DrawerTitle className="sr-only">어린이집 목록</DrawerTitle>
                    <div className="relative overflow-hidden flex-1">
                        <div className={`absolute inset-0 transition-transform duration-300 ${selectedListItem ? '-translate-x-full' : 'translate-x-0'}`}>
                            <SearchPanel {...panelProps} />
                        </div>
                        <div className={`absolute inset-0 transition-transform duration-300 ${selectedListItem ? 'translate-x-0' : 'translate-x-full'}`}>
                            {selectedId && selectedListItem && (
                                <DaycareDetail id={selectedId} listItem={selectedListItem} onBack={handleBack} />
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
