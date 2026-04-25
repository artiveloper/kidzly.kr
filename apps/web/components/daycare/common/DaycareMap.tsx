'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import type { MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds, daycareFilterParsers } from '@/domain/daycare';
import { useDebounce } from '@/hooks/useDebounce';
import { Header } from './Header';
import { ListPanel } from '../list/ListPanel';
import { NaverMap, type NaverMapHandle } from './NaverMap';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import { DaycareDetailView } from '../detail/DaycareDetailView';
import { DaycareDetailLoading } from '../detail/DaycareDetailLoading';
import { DaycareFilters } from '../list/filters/DaycareFilters';

export function DaycareMap() {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const [rawBounds, setRawBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const bounds = useDebounce(rawBounds, 600);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const [initialCenter] = useState<{ lat: number; lng: number } | null>(() => {
        if (typeof window === 'undefined') return null;
        const raw = sessionStorage.getItem('map_initial_center');
        if (!raw) return null;
        try {
            sessionStorage.removeItem('map_initial_center');
            return JSON.parse(raw) as { lat: number; lng: number };
        } catch {
            return null;
        }
    });

    // 목록 Drawer 상태
    const [isListOpen, setIsListOpen] = useState(false);

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

    const mapViewRef = useRef<NaverMapHandle>(null);
    const listScrollRef = useRef<HTMLDivElement>(null);
    const savedScrollTop = useRef(0);
    const daycaresRef = useRef(daycares);
    daycaresRef.current = daycares;

    // pathname 기반 선택된 어린이집 ID (마커 강조 + Drawer 제어 공통)
    const pathnameId = pathname.startsWith('/daycare/') ? pathname.slice('/daycare/'.length) : null;

    useEffect(() => {
        if (!pathnameId) return;
        const daycare = daycaresRef.current.find(d => d.id === pathnameId);
        if (daycare?.latitude && daycare?.longitude) {
            mapViewRef.current?.panTo(daycare.latitude, daycare.longitude);
        }
    }, [pathnameId]);

    // 목록 Drawer에서 상세로 진입 시 ID
    const listDaycareId = isMobile && isListOpen && pathnameId ? pathnameId : null;

    // 목록 상세 진입 시 스크롤 저장, 복귀 시 복원
    useEffect(() => {
        if (listDaycareId) {
            savedScrollTop.current = listScrollRef.current?.scrollTop ?? 0;
        } else {
            requestAnimationFrame(() => {
                if (listScrollRef.current) {
                    listScrollRef.current.scrollTop = savedScrollTop.current;
                }
            });
        }
    }, [listDaycareId]);

    // 모바일 키보드 오픈 시 브라우저가 body를 스크롤해 Drawer가 Header 뒤로 밀리는 현상 방지
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;
        const resetScroll = () => window.scrollTo(0, 0);
        vv.addEventListener('scroll', resetScroll);
        return () => vv.removeEventListener('scroll', resetScroll);
    }, []);

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

    const handleSelectDaycare = (id: string) => {
        router.replace(`/daycare/${id}`);
    };

    const handleOpenList = () => {
        setIsListOpen(true);
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
        scrollRef: listScrollRef,
    };

    const overlayClass = (open: boolean) =>
        `md:hidden fixed inset-0 z-[200] bg-white flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-y-0' : 'translate-y-full'}`;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    <ListPanel {...panelProps} />
                </aside>

                <main className="flex-1 relative">
                    <div className="md:hidden absolute top-0 left-0 right-0 z-10 pointer-events-none">
                        <div className="pointer-events-auto">
                            <DaycareFilters />
                        </div>
                    </div>
                    <NaverMap
                        ref={mapViewRef}
                        daycares={filteredDaycares}
                        selectedId={pathnameId}
                        initialCenter={initialCenter}
                        onSelectDaycare={handleSelectDaycare}
                        onBoundsChange={handleBoundsChange}
                        onOpenBottomSheet={handleOpenList}
                    />
                </main>
            </div>

            {/* 모바일 목록 오버레이 */}
            <div className={overlayClass(isMobile && (isListOpen || !!listDaycareId))}>
                {listDaycareId ? (
                    <div className="flex-1 overflow-y-auto">
                        <Suspense fallback={<DaycareDetailLoading onBack={() => router.back()} />}>
                            <DaycareDetailView id={listDaycareId} onBack={() => router.back()} />
                        </Suspense>
                    </div>
                ) : (
                    <ListPanel {...panelProps} onClose={() => setIsListOpen(false)} />
                )}
            </div>

            {/* 모바일 마커 상세 오버레이 */}
            <div className={overlayClass(isMobile && !isListOpen && !!pathnameId)}>
                <div className="flex-1 overflow-y-auto">
                    {pathnameId && !isListOpen && (
                        <Suspense fallback={<DaycareDetailLoading onBack={() => router.back()} />}>
                            <DaycareDetailView id={pathnameId} onBack={() => router.back()} />
                        </Suspense>
                    )}
                </div>
            </div>
        </div>
    );
}
