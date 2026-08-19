// 관리자 계정 개별 수정·삭제 엔드포인트
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { guardResponse, errorResponse, toErrorResponse } from '@/lib/api/route-error';
import { readJsonBody, readString } from '@/lib/api/request';
import { deleteAdminUser, updateAdminUser } from '@/domain/admin-user/server';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const { id } = await params;
    const name = readString(await readJsonBody(request), 'name');
    if (!name) return errorResponse(400, '이름을 입력하세요.');

    try {
        return NextResponse.json(await updateAdminUser({ id, name }));
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function DELETE(_request: Request, { params }: Context) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const { id } = await params;
    // 자기 계정을 지우면 즉시 로그인 불가 상태가 되므로 막는다
    if (guard.user.id === id) {
        return errorResponse(400, '자기 계정은 삭제할 수 없습니다.');
    }

    try {
        await deleteAdminUser(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
