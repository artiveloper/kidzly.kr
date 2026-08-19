// 관리자 계정 목록 조회·생성 엔드포인트 — 호출자의 admin 세션을 확인한 뒤 Auth Admin API 로 넘긴다
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { guardResponse, errorResponse, toErrorResponse } from '@/lib/api/route-error';
import { readJsonBody, readString } from '@/lib/api/request';
import { createAdminUser, listAdminUsers } from '@/domain/admin-user/server';

export async function GET() {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    try {
        return NextResponse.json(await listAdminUsers());
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const body = await readJsonBody(request);
    const email = readString(body, 'email');
    const name = readString(body, 'name');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return errorResponse(400, '올바른 이메일을 입력하세요.');
    }
    if (!name) {
        return errorResponse(400, '이름을 입력하세요.');
    }

    try {
        return NextResponse.json(await createAdminUser({ email, name }), { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

