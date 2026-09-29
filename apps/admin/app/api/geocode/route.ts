// 주소를 네이버 지오코딩 REST API로 위경도로 변환하는 엔드포인트 — admin 세션 확인 후 서버 자격증명으로 호출한다
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { errorResponse, guardResponse } from '@/lib/api/route-error';

// 네이버 클라우드 플랫폼 → Maps → Geocoding. 구 naveropenapi 호스트에서 이 호스트로 이관됐다.
const GEOCODE_URL = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';

// 네이버가 늦어질 때 등록 폼을 붙잡아 두지 않는다
const GEOCODE_TIMEOUT_MS = 5000;

// x는 경도(longitude), y는 위도(latitude) — 지오코딩 응답의 좌표 필드다
type NaverGeocodeAddress = {
    roadAddress: string;
    jibunAddress: string;
    x: string;
    y: string;
};

type NaverGeocodeResponse = {
    status: string;
    addresses?: NaverGeocodeAddress[];
    errorMessage?: string;
};

export async function GET(request: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guardResponse(guard.status);

    const query = request.nextUrl.searchParams.get('query')?.trim();
    if (!query) return errorResponse(400, '변환할 주소를 입력하세요.');

    const clientId = process.env.NAVER_MAP_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('[geocode] NAVER_MAP_CLIENT_ID / NAVER_MAP_CLIENT_SECRET 미설정');
        return errorResponse(500, '지오코딩 자격증명이 설정되지 않았습니다.');
    }

    let response: Response;
    try {
        response = await fetch(`${GEOCODE_URL}?query=${encodeURIComponent(query)}`, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': clientId,
                'X-NCP-APIGW-API-KEY': clientSecret,
            },
            signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
        });
    } catch (error) {
        console.error('[geocode]', error);
        return errorResponse(502, '지오코딩 요청이 실패했습니다. 잠시 후 다시 시도하세요.');
    }

    if (!response.ok) {
        console.error('[geocode] upstream', response.status);
        return errorResponse(502, '지오코딩 요청이 실패했습니다. 잠시 후 다시 시도하세요.');
    }

    const data: NaverGeocodeResponse = await response.json();
    const first = data.addresses?.[0];
    if (!first) {
        return errorResponse(404, '주소로 좌표를 찾지 못했습니다. 주소를 다시 확인하세요.');
    }

    return NextResponse.json({
        roadAddress: first.roadAddress,
        jibunAddress: first.jibunAddress,
        latitude: Number(first.y),
        longitude: Number(first.x),
    });
}
