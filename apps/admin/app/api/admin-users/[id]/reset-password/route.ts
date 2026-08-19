// 관리자 계정의 비밀번호를 초기값으로 되돌리는 엔드포인트
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { guardResponse, toErrorResponse } from '@/lib/api/route-error';
import { resetAdminUserPassword } from '@/domain/admin-user/server';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const { id } = await params;

    try {
        return NextResponse.json(await resetAdminUserPassword(id));
    } catch (error) {
        return toErrorResponse(error);
    }
}
