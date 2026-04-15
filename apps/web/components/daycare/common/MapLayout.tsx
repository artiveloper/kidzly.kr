'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { MapPin, Users, X, ChevronRight } from 'lucide-react';
import type { MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds, daycareFilterParsers } from '@/domain/daycare';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@workspace/ui/components/badge';
import { Header } from './Header';
import { ListPanel } from '../list/ListPanel';
import { NaverMapView, type NaverMapViewHandle } from './NaverMapView';
import { Drawer, DrawerContent, DrawerTitle } from '@workspace/ui/components/drawer';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';

export function MapLayout() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [rawBounds, setRawBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const bounds = useDebounce(rawBounds, 600);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [activeType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAge] = useQueryState('age', daycareFilterParsers.age);

    const { data: daycares = [], isFetching } = useDaycaresInBounds(bounds, {
        query: debouncedSearchQuery || undefined,
        vehicleOperation: vehicleOperation || undefined,
        services: activeServices.length > 0 ? activeServices : undefined,
        ages: activeAge !== null ? [Number(activeAge)] : undefined,
    });

    const mapViewRef = useRef<NaverMapViewHandle>(null);

    const handleBoundsChange = (newBounds: MapBounds) => {
        setRawBounds(newBounds);
    };

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

    const selectedMarkerItem = selectedId
        ? (filteredDaycares.find((d) => d.id === selectedId) ?? daycares.find((d) => d.id === selectedId) ?? null)
        : null;

    const handleSelectDaycare = (id: string) => {
        if (isMobile) {
            setSelectedId(id);
        } else {
            window.open(`/daycare/${id}`, '_blank', 'noopener,noreferrer');
        }
    };

    const panelProps = {
        searchQuery,
        onSearchChange: setSearchQuery,
        onClearSearch: () => {
            setSearchQuery(null);
            const currentBounds = mapViewRef.current?.getCurrentBounds();
            if (currentBounds) setRawBounds(currentBounds);
        },
        onSearch: handleSearch,
        recentSearches,
        onRemoveRecentSearch: (s: string) =>
            setRecentSearches((prev) => prev.filter((r) => r !== s)),
        daycares: filteredDaycares,
        isLoading: isFetching,
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    <ListPanel {...panelProps} />
                </aside>

                <main className="flex-1 relative">
                    <NaverMapView
                        ref={mapViewRef}
                        daycares={filteredDaycares}
                        selectedId={selectedId}
                        onSelectDaycare={handleSelectDaycare}
                        onBoundsChange={handleBoundsChange}
                        onOpenBottomSheet={() => setIsBottomSheetOpen(true)}
                        onMapClick={() => setSelectedId(null)}
                    />

                    {/* 모바일 미니 카드 */}
                    <div
                        className={`md:hidden absolute left-3 right-3 bottom-20 z-20 transition-transform duration-300 ${selectedMarkerItem ? 'translate-y-0' : 'translate-y-[200%]'}`}
                    >
                        {selectedMarkerItem && (() => {
                            const occupancyRate = selectedMarkerItem.capacity && selectedMarkerItem.currentChildCount
                                ? Math.round((selectedMarkerItem.currentChildCount / selectedMarkerItem.capacity) * 100)
                                : null;
                            return (
                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="px-4 pt-4 pb-3">
                                        {/* 이름 + 유형 + 닫기 */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-semibold text-gray-900 truncate">
                                                    {selectedMarkerItem.name}
                                                </span>
                                                <Badge variant="secondary" className="shrink-0">
                                                    {selectedMarkerItem.typeName}
                                                </Badge>
                                            </div>
                                            <button
                                                onClick={() => setSelectedId(null)}
                                                className="shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                aria-label="닫기"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {/* 주소 */}
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                                            <MapPin size={12} className="shrink-0 text-gray-400" />
                                            <span className="truncate">{selectedMarkerItem.address}</span>
                                        </div>

                                        {/* 충원율 */}
                                        {occupancyRate !== null && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Users size={12} className="shrink-0 text-gray-400" />
                                                <span>
                                                    {selectedMarkerItem.currentChildCount}/{selectedMarkerItem.capacity}명
                                                </span>
                                                <span className={`font-medium ${occupancyRate >= 90 ? 'text-red-500' : occupancyRate >= 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    ({occupancyRate}%)
                                                </span>
                                            </div>
                                        )}

                                        {/* 통학차량 + 지원서비스 */}
                                        {(selectedMarkerItem.vehicleOperation === '운영' || selectedMarkerItem.services) && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {selectedMarkerItem.vehicleOperation === '운영' && (
                                                    <Badge variant="outline">통학차량</Badge>
                                                )}
                                                {selectedMarkerItem.services &&
                                                    selectedMarkerItem.services
                                                        .split(',')
                                                        .map((s) => s.trim())
                                                        .filter(Boolean)
                                                        .map((service) => (
                                                            <Badge key={service} variant="outline">
                                                                {service}
                                                            </Badge>
                                                        ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 상세보기 버튼 */}
                                    <button
                                        onClick={() => router.push(`/daycare/${selectedMarkerItem.id}`)}
                                        className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-gray-100 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    >
                                        상세보기
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </main>
            </div>

            <Drawer
                open={isBottomSheetOpen && isMobile}
                onOpenChange={(open) => {
                    if (!open) setIsBottomSheetOpen(false);
                }}
            >
                <DrawerContent className="md:hidden !mt-14 !max-h-[calc(100dvh-56px)] h-[calc(100dvh-56px)]">
                    <DrawerTitle className="sr-only">어린이집 목록</DrawerTitle>
                    <div className="flex-1 overflow-hidden">
                        <ListPanel {...panelProps} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
