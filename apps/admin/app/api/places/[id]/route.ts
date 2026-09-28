// 놀거리 단건 수정·삭제 엔드포인트
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { guardResponse, errorResponse, toErrorResponse } from '@/lib/api/route-error';
import { readJsonBody } from '@/lib/api/request';
import { deletePlace, readPlaceInput, updatePlace } from '@/domain/place/server';

type RouteContext = { params: Promise<{ id: string }> };

/** places.id 는 BIGSERIAL 이라 숫자 문자열만 유효하다 */
function readId(id: string): string | null {
    return /^\d+$/.test(id) ? id : null;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const id = readId((await params).id);
    if (!id) return errorResponse(400, '올바르지 않은 놀거리 번호입니다.');

    try {
        const input = readPlaceInput(await readJsonBody(request));
        return NextResponse.json(await updatePlace({ id, ...input }));
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const id = readId((await params).id);
    if (!id) return errorResponse(400, '올바르지 않은 놀거리 번호입니다.');

    try {
        await deletePlace(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
