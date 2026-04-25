'use client';

import Script from 'next/script';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { List } from 'lucide-react';
import type { DaycareListItem, MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS } from '@/domain/daycare';

export type NaverMapHandle = {
    panTo: (lat: number, lng: number) => void;
    getCurrentBounds: () => MapBounds | null;
};

interface NaverMapProps {
    daycares: DaycareListItem[];
    selectedId?: string | null;
    initialCenter?: { lat: number; lng: number } | null;
    onSelectDaycare: (id: string) => void;
    onBoundsChange: (bounds: MapBounds) => void;
    onOpenBottomSheet: () => void;
}

const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

const DEFAULT_CENTER = {
    lat: (DEFAULT_BOUNDS.north + DEFAULT_BOUNDS.south) / 2,
    lng: (DEFAULT_BOUNDS.east + DEFAULT_BOUNDS.west) / 2,
};

const NAME_MIN_ZOOM = 16;

function markerHtml(name: string, showName: boolean, selected: boolean): string {
    const color = selected ? '#059669' : '#10b981';
    const size = selected ? 36 : 28;
    const dotSize = selected ? 11 : 8;
    const border = selected ? '3px' : '2.5px';
    const shadow = selected
        ? '0 4px 12px rgba(5,150,105,0.45)'
        : '0 2px 6px rgba(0,0,0,0.18)';

    const dot = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#fff;border:${border} solid ${color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:${shadow};
      ${selected ? 'transform:scale(1.1);' : ''}
    ">
      <div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${color};"></div>
    </div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};margin-top:-1px;"></div>`;

    if (showName || selected) {
        return `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        ${dot}
        <div style="
          margin-top:2px;background:${selected ? color : 'rgba(255,255,255,0.95)'};
          color:${selected ? '#fff' : '#111827'};
          font-size:${selected ? '11px' : '10px'};font-weight:${selected ? '700' : '600'};
          padding:${selected ? '3px 8px' : '2px 6px'};border-radius:4px;
          white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;
          font-family:-apple-system,sans-serif;
          box-shadow:${selected ? '0 2px 8px rgba(5,150,105,0.4)' : '0 1px 4px rgba(0,0,0,0.15)'};
          border:1px solid ${selected ? color : 'rgba(16,185,129,0.25)'};
        ">${name}</div>
      </div>`;
    }

    return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      ${dot}
    </div>`;
}

function getBounds(map: naver.maps.Map): MapBounds {
    const bounds = map.getBounds() as naver.maps.LatLngBounds;
    const ne = bounds.getNE();
    const sw = bounds.getSW();
    return { north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() };
}

export const NaverMap = forwardRef<NaverMapHandle, NaverMapProps>(function NaverMap({
    daycares,
    selectedId,
    initialCenter,
    onSelectDaycare,
    onBoundsChange,
    onOpenBottomSheet,
}, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<naver.maps.Map | null>(null);
    const markersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
    const onBoundsChangeRef = useRef(onBoundsChange);
    const isProgrammaticMoveRef = useRef(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [zoom, setZoom] = useState(16);

    useImperativeHandle(ref, () => ({
        panTo(lat: number, lng: number) {
            if (!mapRef.current) return;
            isProgrammaticMoveRef.current = true;
            mapRef.current.panTo(
                new naver.maps.LatLng(lat, lng),
                { duration: 400, easing: 'easeOutCubic' }
            );
        },
        getCurrentBounds() {
            if (!mapRef.current) return null;
            return getBounds(mapRef.current);
        },
    }));

    useEffect(() => {
        onBoundsChangeRef.current = onBoundsChange;
    }, [onBoundsChange]);

    // 지도 초기화
    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || mapRef.current) return;

        const center = initialCenter ?? DEFAULT_CENTER;
        const map = new naver.maps.Map(containerRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: 16,
            mapTypeControl: false,
            scaleControl: false,
            logoControl: true,
            logoControlOptions: { position: naver.maps.Position.BOTTOM_RIGHT },
        });

        mapRef.current = map;

        let isFirstIdle = true;

        naver.maps.Event.addListener(map, 'idle', () => {
            if (isFirstIdle) { isFirstIdle = false; return; }
            if (isProgrammaticMoveRef.current) { isProgrammaticMoveRef.current = false; return; }
            setZoom(map.getZoom());
            onBoundsChangeRef.current(getBounds(map));
        });

        onBoundsChangeRef.current(getBounds(map));
    }, [scriptLoaded]);

    // 마커 동기화
    useEffect(() => {
        if (!scriptLoaded || !mapRef.current) return;
        const map = mapRef.current;
        const existing = markersRef.current;
        const nextIds = new Set(daycares.map((d) => d.id));

        for (const [id, marker] of existing) {
            if (!nextIds.has(id)) {
                marker.setMap(null);
                existing.delete(id);
            }
        }

        for (const daycare of daycares) {
            if (!daycare.latitude || !daycare.longitude) continue;

            const showName = zoom >= NAME_MIN_ZOOM;
            const selected = daycare.id === selectedId;
            const html = markerHtml(daycare.name, showName, selected);
            const anchor = new naver.maps.Point(selected ? 18 : 14, selected ? 50 : 41);

            if (existing.has(daycare.id)) {
                const marker = existing.get(daycare.id);
                if (marker) {
                    marker.setIcon({ content: html, anchor });
                    marker.setZIndex(selected ? 10 : 1);
                }
            } else {
                const marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(daycare.latitude, daycare.longitude),
                    map,
                    icon: { content: html, anchor },
                    title: daycare.name,
                    zIndex: selected ? 10 : 1,
                });
                naver.maps.Event.addListener(marker, 'click', () =>
                    onSelectDaycare(daycare.id),
                );
                existing.set(daycare.id, marker);
            }
        }
    }, [scriptLoaded, daycares, onSelectDaycare, zoom, selectedId]);

    if (!CLIENT_ID) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-sm text-gray-500">
                <p>
                    <code className="bg-gray-200 px-1 rounded">
                        NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
                    </code>
                    를 설정해 주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Script
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`}
                strategy="afterInteractive"
                onReady={() => setScriptLoaded(true)}
            />
            <div ref={containerRef} className="w-full h-full" />
            <button
                onClick={onOpenBottomSheet}
                className="md:hidden absolute bottom-6 right-4 flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg border border-gray-200 text-sm font-medium text-gray-700 z-10"
            >
                <List size={16} />
                목록 보기
            </button>
        </div>
    );
});
