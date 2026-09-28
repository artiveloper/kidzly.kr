// 브라우저에서 놀거리 Route Handler 를 호출하는 API 레이어 (service role 접근은 서버에서만 실행된다)
import type { Place, PlaceInput, PlaceListParams, PlaceListResult, UpdatePlaceInput } from '../types';

const BASE_PATH = '/api/places';

async function request<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    });

    if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(readMessage(body) || '요청을 처리하지 못했습니다.');
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

function readMessage(body: unknown): string {
    if (typeof body !== 'object' || body === null) return '';
    const message = (body as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
}

export function fetchPlaces({ keyword, page }: PlaceListParams): Promise<PlaceListResult> {
    const params = new URLSearchParams({ page: String(page) });
    if (keyword) params.set('q', keyword);
    return request<PlaceListResult>(`${BASE_PATH}?${params.toString()}`);
}

export function requestCreatePlace(input: PlaceInput): Promise<Place> {
    return request<Place>(BASE_PATH, { method: 'POST', body: JSON.stringify(input) });
}

export function requestUpdatePlace({ id, ...input }: UpdatePlaceInput): Promise<Place> {
    return request<Place>(`${BASE_PATH}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });
}

export function requestDeletePlace(id: string): Promise<void> {
    return request<void>(`${BASE_PATH}/${id}`, { method: 'DELETE' });
}
