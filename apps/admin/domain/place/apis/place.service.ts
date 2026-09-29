import 'server-only';
// places 테이블을 조회·생성·수정·삭제하는 서버 전용 레이어
// RLS 정책이 미발행 행을 가리므로, 어드민은 정책을 우회하는 service role 클라이언트로만 접근한다
import type { PlaceInsert, PlaceUpdate } from '@workspace/supabase/types';
import { createSupabaseAdminApiClient } from '@/lib/supabase/admin-api';
import { parsePlace } from '../parser/place.parser';
import {
    PLACE_PAGE_SIZE,
    type Place,
    type PlaceInput,
    type PlaceListParams,
    type PlaceListResult,
    type UpdatePlaceInput,
} from '../types';

/** 호출자에게 그대로 보여줄 수 있는 실패. status 를 그대로 응답 코드로 쓴다. */
export class PlaceServiceError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'PlaceServiceError';
        this.status = status;
    }
}

// PostgREST 의 or() 필터는 쉼표·괄호·따옴표를 구문으로 해석한다. ilike 와일드카드와 함께 제거한다.
function sanitizeKeyword(keyword: string): string {
    return keyword.replace(/[,()"\\%_*]/g, ' ').trim();
}

/** 화면·URL 은 id 를 문자열로 다루지만 places.id 는 BIGSERIAL 이라 숫자로 넘겨야 한다 */
function toRowId(id: string): number {
    const rowId = Number(id);
    if (!Number.isInteger(rowId) || rowId <= 0) {
        throw new PlaceServiceError(400, '올바르지 않은 놀거리 번호입니다.');
    }
    return rowId;
}

function toRowValues(input: PlaceInput) {
    return {
        name: input.name,
        summary: input.summary,
        rating: input.rating,
        place_type: input.placeType,
        age_groups: input.ageGroups,
        indoor_outdoor: input.indoorOutdoor,
        is_free: input.isFree,
        has_parking: input.hasParking,
        opening_hours: input.openingHours,
        closed_days: input.closedDays,
        price_detail: input.priceDetail,
        parking_detail: input.parkingDetail,
        has_nursing_room: input.hasNursingRoom,
        has_diaper_table: input.hasDiaperTable,
        address: input.address,
        address_detail: input.addressDetail,
        latitude: input.latitude,
        longitude: input.longitude,
        thumbnail_url: input.thumbnailUrl,
        last_verified_at: input.lastVerifiedAt,
        is_published: input.isPublished,
    };
}

export async function listPlaces({ keyword, page }: PlaceListParams): Promise<PlaceListResult> {
    const supabase = createSupabaseAdminApiClient();
    const from = (page - 1) * PLACE_PAGE_SIZE;

    let query = supabase
        .from('places')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, from + PLACE_PAGE_SIZE - 1);

    const safeKeyword = sanitizeKeyword(keyword);
    if (safeKeyword) {
        query = query.or(`name.ilike.%${safeKeyword}%,address.ilike.%${safeKeyword}%`);
    }

    const { data, error, count } = await query;
    if (error) {
        console.error('[listPlaces]', error.message);
        throw new PlaceServiceError(502, '놀거리 목록을 불러오지 못했습니다.');
    }

    return {
        items: (data ?? []).map(parsePlace),
        totalCount: count ?? 0,
    };
}

export async function createPlace(input: PlaceInput): Promise<Place> {
    const supabase = createSupabaseAdminApiClient();
    const values: PlaceInsert = toRowValues(input);

    const { data, error } = await supabase.from('places').insert(values).select('*').single();
    if (error) {
        console.error('[createPlace]', error.message);
        throw new PlaceServiceError(502, '놀거리를 등록하지 못했습니다.');
    }

    return parsePlace(data);
}

export async function updatePlace({ id, ...input }: UpdatePlaceInput): Promise<Place> {
    const supabase = createSupabaseAdminApiClient();
    // updated_at 은 DB 기본값이 INSERT 시점에만 걸리므로 수정할 때마다 직접 올린다
    const values: PlaceUpdate = { ...toRowValues(input), updated_at: new Date().toISOString() };

    const { data, error } = await supabase
        .from('places')
        .update(values)
        .eq('id', toRowId(id))
        .select('*')
        .maybeSingle();
    if (error) {
        console.error('[updatePlace]', error.message);
        throw new PlaceServiceError(502, '놀거리를 수정하지 못했습니다.');
    }
    if (!data) throw new PlaceServiceError(404, '놀거리를 찾을 수 없습니다.');

    return parsePlace(data);
}

export async function deletePlace(id: string): Promise<void> {
    const supabase = createSupabaseAdminApiClient();
    const { error } = await supabase.from('places').delete().eq('id', toRowId(id));
    if (error) {
        console.error('[deletePlace]', error.message);
        throw new PlaceServiceError(502, '놀거리를 삭제하지 못했습니다.');
    }
}
