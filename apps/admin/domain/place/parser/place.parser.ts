// places 테이블 행을 어드민 화면에서 쓰는 Place 로 변환한다
import type { PlaceRow } from '@workspace/supabase/types';
import {
    PLACE_AGE_GROUPS,
    PLACE_INDOOR_OUTDOORS,
    PLACE_TYPES,
    type Place,
    type PlaceAgeGroup,
    type PlaceIndoorOutdoor,
    type PlaceType,
} from '../types';

/**
 * DB 의 CHECK 제약이 값을 보장하지만 타입 시스템은 그것을 모른다.
 * 어드민은 빠뜨리지 않고 보여줘야 하는 화면이라, 제약 밖의 값이 오면 행을 버리지 않고 첫 값으로 떨어뜨린다.
 */
function toPlaceType(value: string): PlaceType {
    return (PLACE_TYPES as readonly string[]).includes(value)
        ? (value as PlaceType)
        : PLACE_TYPES[0];
}

function toIndoorOutdoor(value: string): PlaceIndoorOutdoor {
    return (PLACE_INDOOR_OUTDOORS as readonly string[]).includes(value)
        ? (value as PlaceIndoorOutdoor)
        : PLACE_INDOOR_OUTDOORS[0];
}

function toAgeGroups(values: string[]): PlaceAgeGroup[] {
    return values.filter((value): value is PlaceAgeGroup =>
        (PLACE_AGE_GROUPS as readonly string[]).includes(value)
    );
}

export function parsePlace(row: PlaceRow): Place {
    return {
        id: String(row.id),
        name: row.name,
        summary: row.summary,
        rating: row.rating,
        placeType: toPlaceType(row.place_type),
        ageGroups: toAgeGroups(row.age_groups),
        indoorOutdoor: toIndoorOutdoor(row.indoor_outdoor),
        isFree: row.is_free,
        hasParking: row.has_parking,
        openingHours: row.opening_hours,
        closedDays: row.closed_days,
        priceDetail: row.price_detail,
        parkingDetail: row.parking_detail,
        hasNursingRoom: row.has_nursing_room,
        hasDiaperTable: row.has_diaper_table,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        thumbnailUrl: row.thumbnail_url,
        lastVerifiedAt: row.last_verified_at,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
