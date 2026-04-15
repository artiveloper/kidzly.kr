'use client';

import Script from 'next/script';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { List } from 'lucide-react';
import type { DaycareListItem, MapBounds } from '@/domain/daycare';
import { DEFAULT_BOUNDS } from '@/domain/daycare';

export type NaverMapViewHandle = {
    panTo: (lat: number, lng: number) => void;
    getCurrentBounds: () => MapBounds | null;
};

interface NaverMapViewProps {
  daycares: DaycareListItem[];
  selectedId: string | null;
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

function markerHtml(name: string, selected: boolean, showName: boolean): string {
  if (selected) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="
          width:38px;height:38px;border-radius:50%;
          background:#10b981;border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px rgba(16,185,129,0.5);
        ">
          <div style="width:10px;height:10px;border-radius:50%;background:#fff;"></div>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #10b981;margin-top:-2px;"></div>
        <div style="
          margin-top:3px;background:#111827;color:#fff;
          font-size:11px;font-weight:600;padding:3px 8px;border-radius:5px;
          white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;
          font-family:-apple-system,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${name}</div>
      </div>`;
  }

  const dot = `
    <div style="
      width:28px;height:28px;border-radius:50%;
      background:#fff;border:2.5px solid #10b981;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.18);
    ">
      <div style="width:8px;height:8px;border-radius:50%;background:#10b981;"></div>
    </div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #10b981;margin-top:-1px;"></div>`;

  if (showName) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        ${dot}
        <div style="
          margin-top:2px;background:rgba(255,255,255,0.95);color:#111827;
          font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;
          white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;
          font-family:-apple-system,sans-serif;
          box-shadow:0 1px 4px rgba(0,0,0,0.15);border:1px solid rgba(16,185,129,0.25);
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

export const NaverMapView = forwardRef<NaverMapViewHandle, NaverMapViewProps>(function NaverMapView({
  daycares,
  selectedId,
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

  // onBoundsChange를 ref로 유지해 idle 리스너 재등록 없이 최신 함수 호출
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  // 지도 초기화
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || mapRef.current) return;

    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: 16,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: true,
      logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
    });

    mapRef.current = map;

    // 초기화 시 idle이 한 번 자동 발생하므로 건너뜀
    let isFirstIdle = true;

    // idle: 지도 이동/줌 완료 후 발생 (programmatic panTo는 무시)
    naver.maps.Event.addListener(map, 'idle', () => {
      if (isFirstIdle) {
        isFirstIdle = false;
        return;
      }
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }
      setZoom(map.getZoom());
      onBoundsChangeRef.current(getBounds(map));
    });

    // 초기 bounds는 DEFAULT_BOUNDS로 고정 → prefetch cache key와 일치
    onBoundsChangeRef.current(DEFAULT_BOUNDS);
  }, [scriptLoaded]);

  // 마커 동기화
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;
    const nextIds = new Set(daycares.map((d) => d.id));

    // 사라진 마커 제거
    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        existing.delete(id);
      }
    }

    // 추가/업데이트
    for (const daycare of daycares) {
      if (!daycare.latitude || !daycare.longitude) continue;

      const isSelected = daycare.id === selectedId;
      const showName = zoom >= NAME_MIN_ZOOM;
      const html = markerHtml(daycare.name, isSelected, showName);
      const anchor = isSelected
        ? new naver.maps.Point(19, 60)
        : new naver.maps.Point(14, 41);

      if (existing.has(daycare.id)) {
        existing.get(daycare.id)!.setIcon({ content: html, anchor });
      } else {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(daycare.latitude, daycare.longitude),
          map,
          icon: { content: html, anchor },
          title: daycare.name,
        });
        naver.maps.Event.addListener(marker, 'click', () =>
          onSelectDaycare(daycare.id),
        );
        existing.set(daycare.id, marker);
      }
    }
  }, [scriptLoaded, daycares, selectedId, onSelectDaycare, zoom]);


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
