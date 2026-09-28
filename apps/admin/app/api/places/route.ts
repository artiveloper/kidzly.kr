// 놀거리 목록 조회·등록 엔드포인트 — 호출자의 admin 세션을 확인한 뒤 service role 조회로 넘긴다
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { guardResponse, toErrorResponse } from '@/lib/api/route-error';
import { readJsonBody } from '@/lib/api/request';
import { createPlace, listPlaces, readPlaceInput } from '@/domain/place/server';

export async function GET(request: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const keyword = request.nextUrl.searchParams.get('q') ?? '';
    const rawPage = Number(request.nextUrl.searchParams.get('page'));
    // 페이지 번호는 URL에서 오므로 음수·NaN이 들어올 수 있다
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    try {
        return NextResponse.json(await listPlaces({ keyword, page }));
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    try {
        const input = readPlaceInput(await readJsonBody(request));
        return NextResponse.json(await createPlace(input), { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
