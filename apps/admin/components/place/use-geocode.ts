'use client';
// 주소를 서버 지오코딩 라우트로 보내 위경도를 받아오는 mutation 훅
import { useMutation } from '@tanstack/react-query';

export type GeocodeResult = {
    roadAddress: string;
    jibunAddress: string;
    latitude: number;
    longitude: number;
};

function readMessage(body: unknown): string {
    if (typeof body !== 'object' || body === null) return '';
    const message = (body as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
}

async function requestGeocode(query: string): Promise<GeocodeResult> {
    const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(readMessage(body) || '좌표를 변환하지 못했습니다.');
    }

    return (await response.json()) as GeocodeResult;
}

export function useGeocode() {
    return useMutation({ mutationFn: requestGeocode });
}
