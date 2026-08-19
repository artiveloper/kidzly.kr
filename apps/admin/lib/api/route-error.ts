import 'server-only';
// Route Handler 에서 도메인 실패를 일관된 JSON 응답으로 바꾼다
import { NextResponse } from 'next/server';
import { AdminUserServiceError } from '@/domain/admin-user/server';

const GUARD_MESSAGE: Record<number, string> = {
    401: '로그인이 필요합니다.',
    403: '관리자 권한이 없습니다.',
};

export function errorResponse(status: number, message: string) {
    return NextResponse.json({ message }, { status });
}

export function guardResponse(status: 401 | 403) {
    return errorResponse(status, GUARD_MESSAGE[status] ?? '요청을 처리할 수 없습니다.');
}

export function toErrorResponse(error: unknown) {
    if (error instanceof AdminUserServiceError) {
        return errorResponse(error.status, error.message);
    }
    // 예상하지 못한 실패는 원문을 노출하지 않는다
    console.error('[admin-users]', error);
    return errorResponse(500, '요청을 처리하지 못했습니다.');
}
