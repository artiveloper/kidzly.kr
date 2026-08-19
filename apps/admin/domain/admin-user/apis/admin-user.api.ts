// 브라우저에서 관리자 계정 Route Handler 를 호출하는 API 레이어 (Auth Admin API 는 서버에서만 실행된다)
import type { AdminUser, CreateAdminUserInput, UpdateAdminUserInput } from '../types';

const BASE_PATH = '/api/admin-users';

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

export function fetchAdminUsers(): Promise<AdminUser[]> {
    return request<AdminUser[]>(BASE_PATH);
}

export function requestCreateAdminUser(input: CreateAdminUserInput): Promise<AdminUser> {
    return request<AdminUser>(BASE_PATH, { method: 'POST', body: JSON.stringify(input) });
}

export function requestUpdateAdminUser({ id, name }: UpdateAdminUserInput): Promise<AdminUser> {
    return request<AdminUser>(`${BASE_PATH}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
}

export function requestResetAdminUserPassword(id: string): Promise<AdminUser> {
    return request<AdminUser>(`${BASE_PATH}/${id}/reset-password`, { method: 'POST' });
}

export function requestDeleteAdminUser(id: string): Promise<void> {
    return request<void>(`${BASE_PATH}/${id}`, { method: 'DELETE' });
}
