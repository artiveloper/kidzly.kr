// places 테이블 행을 지도용 도메인 모델로 변환한다
import type { PlaceRow } from '@workspace/supabase/types';
import type { PlaceAgeGroup, PlaceMapItem } from '../types';
import {
    PLACE_INDOOR_OUTDOOR_LABELS,
    PLACE_TYPE_LABELS,
    isPlaceAgeGroup,
    isPlaceIndoorOutdoor,
    isPlaceType,
} from '../types';

/**
 * DB의 CHECK 제약이 값을 보장하지만 타입 시스템은 그것을 모른다.
 * 제약 밖의 값이 들어온 행은 라벨을 만들 수 없으므로 지도에서 제외한다.
 */
export function toPlaceMapItem(row: PlaceRow): PlaceMapItem | null {
    if (!isPlaceType(row.place_type)) return null;
    if (!isPlaceIndoorOutdoor(row.indoor_outdoor)) return null;

    return {
        id: String(row.id),
        name: row.name,
        summary: row.summary,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        placeType: row.place_type,
        placeTypeLabel: PLACE_TYPE_LABELS[row.place_type],
        ageGroups: row.age_groups.filter((age): age is PlaceAgeGroup => isPlaceAgeGroup(age)),
        indoorOutdoor: row.indoor_outdoor,
        indoorOutdoorLabel: PLACE_INDOOR_OUTDOOR_LABELS[row.indoor_outdoor],
        isFree: row.is_free,
        hasParking: row.has_parking,
        rating: row.rating,
        openingHours: row.opening_hours,
        closedDays: row.closed_days,
        priceDetail: row.price_detail,
        parkingDetail: row.parking_detail,
        hasNursingRoom: row.has_nursing_room,
        hasDiaperTable: row.has_diaper_table,
        thumbnailUrl: row.thumbnail_url,
        lastVerifiedAt: row.last_verified_at,
    };
}
