'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import type { MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS, useDaycaresInBounds, daycareFilterParsers } from '@/domain/daycare';
import type { BlogPostMeta } from '@/lib/blog';
import { useDebounce } from '@/hooks/useDebounce';
import Header from '@/components/common/Header';
import ListPanel from '../list/ListPanel';
import NaverMap, {
    type NaverMapHandle,
    DAYCARE_MARKER_THEME,
    PLACE_MARKER_THEME,
    PLAYGROUND_MARKER_THEME,
} from './NaverMap';
import { useIsMobile } from '@workspace/ui/hooks/use-mobile';
import DaycareDetailView from '../detail/DaycareDetailView';
import DaycareDetailLoading from '../detail/DaycareDetailLoading';
import DaycareFilters from '../list/filters/DaycareFilters';
import { saveDaycareReturnUrl } from '@/lib/navigation';
import { usePlaygroundsInBounds } from '@/domain/playground';
import { placeFilterParsers, toPlaceFilters, usePlacesInBounds } from '@/domain/place';
import {
    mapLayerParsers,
    MAP_LAYER_TABS_ENABLED,
    DEFAULT_MAP_LAYER,
    type MapLayer,
} from '@/lib/map/layer-params';
import MapLayerToggle from '@/components/map/MapLayerToggle';
import PlaygroundListPanel from '@/components/playground/PlaygroundListPanel';
import PlaygroundInfoCard from '@/components/playground/PlaygroundInfoCard';
import PlaceListPanel from '@/components/place/PlaceListPanel';
import PlaceInfoCard from '@/components/place/PlaceInfoCard';
import PlaceFilters from '@/components/place/filters/PlaceFilters';

interface DaycareMapProps {
    promoPosts?: BlogPostMeta[];
    latestPosts?: BlogPostMeta[];
}

export default function DaycareMap({ promoPosts = [], latestPosts = [] }: DaycareMapProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const [rawBounds, setRawBounds] = useState<MapBounds>(DEFAULT_BOUNDS);
    const bounds = useDebounce(rawBounds, 600);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    // PC 목록 hover 중인 어린이집 — 지도 마커를 선택 상태와 동일하게 강조
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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

    // 목록 Drawer 상태 — 홈 검색(q 파라미터)으로 진입하면 모바일에서 목록을 열어 결과를 노출
    const [isListOpen, setIsListOpen] = useState(() => {
        if (typeof window === 'undefined') return false;
        return new URLSearchParams(window.location.search).has('q');
    });

    const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [activeType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAge] = useQueryState('age', daycareFilterParsers.age);

    const [layer, setLayer] = useQueryState('layer', mapLayerParsers.layer);
    const isDaycareLayer = layer === 'daycare';
    const isPlaceLayer = layer === 'place';
    const isPlaygroundLayer = layer === 'playground';
    // 놀이시설·놀거리 선택은 URL이 아닌 로컬 상태다 — 상세 페이지 없이 정보 카드만 띄운다
    const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<string | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    const { data: playgrounds = [], isFetching: isFetchingPlaygrounds } = usePlaygroundsInBounds(
        bounds,
        isPlaygroundLayer,
    );

    const [placeTypes] = useQueryState('ptype', placeFilterParsers.ptype);
    const [placeAges] = useQueryState('page', placeFilterParsers.page);
    const [placeIndoorOutdoors] = useQueryState('io', placeFilterParsers.io);
    const [placeFreeOnly] = useQueryState('free', placeFilterParsers.free);
    const [placeParkingOnly] = useQueryState('parking', placeFilterParsers.parking);

    const placeFilters = useMemo(
        () =>
            toPlaceFilters({
                ptype: placeTypes,
                page: placeAges,
                io: placeIndoorOutdoors,
                free: placeFreeOnly,
                parking: placeParkingOnly,
            }),
        [placeTypes, placeAges, placeIndoorOutdoors, placeFreeOnly, placeParkingOnly]
    );

    const { data: places = [], isFetching: isFetchingPlaces } = usePlacesInBounds(
        bounds,
        placeFilters,
        isPlaceLayer,
    );

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

    // 어린이집 레이어가 아니면 어린이집 상세를 띄우지 않는다 (딥링크로 두 상태가 함께 들어올 수 있다)
    const activeDaycareId = isDaycareLayer ? pathnameId : null;

    useEffect(() => {
        if (!activeDaycareId) return;
        const daycare = daycaresRef.current.find(d => d.id === activeDaycareId);
        if (daycare?.latitude && daycare?.longitude) {
            mapViewRef.current?.panTo(daycare.latitude, daycare.longitude);
        }
    }, [activeDaycareId]);

    // 목록 Drawer에서 상세로 진입 시 ID
    const listDaycareId = isMobile && isListOpen && activeDaycareId ? activeDaycareId : null;

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
        saveDaycareReturnUrl();
        router.replace(`/daycare/${id}${window.location.search}`);
    };

    const handleOpenList = () => {
        setIsListOpen(true);
    };

    const handleSelectPlayground = (id: string) => {
        setSelectedPlaygroundId(id);
        setIsListOpen(false);
        const playground = playgrounds.find((p) => p.id === id);
        if (playground) mapViewRef.current?.panTo(playground.latitude, playground.longitude);
    };

    const handleSelectPlace = (id: string) => {
        setSelectedPlaceId(id);
        setIsListOpen(false);
        const place = places.find((p) => p.id === id);
        if (place) mapViewRef.current?.panTo(place.latitude, place.longitude);
    };

    const handleLayerChange = (nextLayer: MapLayer) => {
        setSelectedPlaygroundId(null);
        setSelectedPlaceId(null);
        setIsListOpen(false);
        // 어린이집 상세가 열린 상태에서 레이어를 바꾸면 지도로 되돌린다
        if (pathnameId) {
            router.replace(
                nextLayer === DEFAULT_MAP_LAYER ? '/map' : `/map?layer=${nextLayer}`
            );
            return;
        }
        // 기본값(daycare)은 쿼리 파라미터에서 제거한다
        setLayer(nextLayer === DEFAULT_MAP_LAYER ? null : nextLayer);
    };

    const selectedPlayground =
        isPlaygroundLayer && selectedPlaygroundId
            ? (playgrounds.find((p) => p.id === selectedPlaygroundId) ?? null)
            : null;

    const selectedPlace =
        isPlaceLayer && selectedPlaceId
            ? (places.find((p) => p.id === selectedPlaceId) ?? null)
            : null;

    const playgroundPanelProps = {
        playgrounds,
        isLoading: isFetchingPlaygrounds,
        selectedId: selectedPlaygroundId,
        onSelect: handleSelectPlayground,
    };

    const placePanelProps = {
        places,
        isLoading: isFetchingPlaces,
        selectedId: selectedPlaceId,
        onSelect: handleSelectPlace,
        isFiltered:
            placeFilters.types.length > 0 ||
            placeFilters.ages.length > 0 ||
            placeFilters.indoorOutdoors.length > 0 ||
            placeFilters.freeOnly ||
            placeFilters.parkingOnly,
    };

    // 레이어마다 지도에 넘길 마커 집합과 선택 동작이 다르다
    const mapLayerProps = isPlaceLayer
        ? {
              items: places,
              markerTheme: PLACE_MARKER_THEME,
              selectedId: selectedPlaceId,
              onSelectItem: handleSelectPlace,
          }
        : isPlaygroundLayer
          ? {
                items: playgrounds,
                markerTheme: PLAYGROUND_MARKER_THEME,
                selectedId: selectedPlaygroundId,
                onSelectItem: handleSelectPlayground,
            }
          : {
                items: filteredDaycares,
                markerTheme: DAYCARE_MARKER_THEME,
                selectedId: activeDaycareId,
                onSelectItem: handleSelectDaycare,
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
        promoPosts,
    };

    const overlayClass = (open: boolean) =>
        `md:hidden fixed inset-x-0 top-14 bottom-0 z-[48] bg-white flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-y-0' : 'translate-y-full'}`;

    return (
        <div className="flex flex-col h-dvh overflow-hidden">
            {/* 모바일은 지도 위 공간이 좁아 헤더 가운데(내비게이션이 안 쓰는 자리)에 넣는다 */}
            <Header
                mobileCenter={
                    MAP_LAYER_TABS_ENABLED ? (
                        <MapLayerToggle
                            layer={layer}
                            onChange={handleLayerChange}
                            listClassName="border border-gray-200 bg-gray-100 p-0.5"
                        />
                    ) : undefined
                }
            />

            <div className="flex flex-1 overflow-hidden pt-14">
                <aside className="hidden md:flex w-[360px] shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden shadow-sm z-10">
                    {isPlaceLayer ? (
                        <PlaceListPanel {...placePanelProps} />
                    ) : isPlaygroundLayer ? (
                        <PlaygroundListPanel {...playgroundPanelProps} />
                    ) : (
                        <ListPanel {...panelProps} onHoverDaycare={setHoveredId} />
                    )}
                </aside>

                <main className="flex-1 relative">
                    {(isDaycareLayer || isPlaceLayer) && (
                        <div className="md:hidden absolute top-0 left-0 right-0 z-10 pointer-events-none">
                            <div className="pointer-events-auto">
                                {isPlaceLayer ? <PlaceFilters /> : <DaycareFilters />}
                            </div>
                        </div>
                    )}
                    {/* sm 미만은 헤더가 담당한다. sm~md 구간은 필터 바가 아직 떠 있어 그 아래로 내린다 */}
                    {MAP_LAYER_TABS_ENABLED && (
                        <div
                            className={`absolute left-1/2 z-20 hidden -translate-x-1/2 sm:block ${
                                isPlaygroundLayer ? 'top-3' : 'top-16 md:top-3'
                            }`}
                        >
                            <MapLayerToggle layer={layer} onChange={handleLayerChange} />
                        </div>
                    )}
                    <NaverMap
                        ref={mapViewRef}
                        {...mapLayerProps}
                        hoveredId={isDaycareLayer ? hoveredId : null}
                        initialCenter={initialCenter}
                        onBoundsChange={handleBoundsChange}
                        onOpenBottomSheet={handleOpenList}
                    />
                    {selectedPlayground && (
                        <PlaygroundInfoCard
                            playground={selectedPlayground}
                            onClose={() => setSelectedPlaygroundId(null)}
                        />
                    )}
                    {selectedPlace && (
                        <PlaceInfoCard
                            place={selectedPlace}
                            onClose={() => setSelectedPlaceId(null)}
                        />
                    )}
                </main>
            </div>

            {/* 모바일 목록 오버레이 */}
            <div className={overlayClass(isMobile && (isListOpen || !!listDaycareId))}>
                {isPlaceLayer ? (
                    <PlaceListPanel {...placePanelProps} onClose={() => setIsListOpen(false)} />
                ) : isPlaygroundLayer ? (
                    <PlaygroundListPanel
                        {...playgroundPanelProps}
                        onClose={() => setIsListOpen(false)}
                    />
                ) : listDaycareId ? (
                    <div className="flex-1 overflow-y-auto pb-4">
                        <Suspense fallback={<DaycareDetailLoading />}>
                            <DaycareDetailView id={listDaycareId} latestPosts={latestPosts} />
                        </Suspense>
                    </div>
                ) : (
                    <ListPanel {...panelProps} onClose={() => setIsListOpen(false)} />
                )}
            </div>

            {/* 모바일 마커 상세 오버레이 */}
            <div className={overlayClass(isMobile && !isListOpen && !!activeDaycareId)}>
                <div className="flex-1 overflow-y-auto pb-4">
                    {activeDaycareId && !isListOpen && (
                        <Suspense key={activeDaycareId} fallback={<DaycareDetailLoading />}>
                            <DaycareDetailView id={activeDaycareId} latestPosts={latestPosts} />
                        </Suspense>
                    )}
                </div>
            </div>

            {/* 네이버 지도 로고(z-100) 가림 — 모바일 오버레이 오픈 시에만 표시 */}
            {isMobile && (isListOpen || !!activeDaycareId) && (
                <div className="fixed bottom-0 inset-x-0 h-4 bg-white z-101" />
            )}
        </div>
    );
}
