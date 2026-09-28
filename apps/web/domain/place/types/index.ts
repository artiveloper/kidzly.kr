// 놀거리(places) 도메인 타입과 코드·라벨 정의 — DB의 CHECK 제약과 같은 값을 쓴다
export const PLACE_TYPES = [
    'kids_cafe',
    'park',
    'indoor_playground',
    'museum',
    'zoo',
    'library',
    'cafe',
] as const;

export type PlaceType = (typeof PLACE_TYPES)[number];

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
    kids_cafe: '키즈카페',
    park: '공원',
    indoor_playground: '실내놀이터',
    museum: '체험관·박물관',
    zoo: '동물원·수목원',
    library: '도서관',
    cafe: '카페',
};

export const PLACE_AGE_GROUPS = ['infant', 'toddler', 'preschool', 'elementary'] as const;

export type PlaceAgeGroup = (typeof PLACE_AGE_GROUPS)[number];

export const PLACE_AGE_GROUP_LABELS: Record<PlaceAgeGroup, string> = {
    infant: '영아',
    toddler: '걸음마',
    preschool: '유아',
    elementary: '초등',
};

export const PLACE_INDOOR_OUTDOORS = ['indoor', 'outdoor', 'mixed'] as const;

export type PlaceIndoorOutdoor = (typeof PLACE_INDOOR_OUTDOORS)[number];

export const PLACE_INDOOR_OUTDOOR_LABELS: Record<PlaceIndoorOutdoor, string> = {
    indoor: '실내',
    outdoor: '실외',
    mixed: '혼합',
};

/** 지도 핀과 목록에 쓰는 형태 */
export type PlaceMapItem = {
    id: string;
    name: string;
    summary: string;
    address: string;
    latitude: number;
    longitude: number;
    placeType: PlaceType;
    placeTypeLabel: string;
    ageGroups: PlaceAgeGroup[];
    indoorOutdoor: PlaceIndoorOutdoor;
    indoorOutdoorLabel: string;
    isFree: boolean;
    /** null 은 아직 확인 안 됨 */
    hasParking: boolean | null;
    rating: number | null;
    openingHours: string;
    closedDays: string;
    priceDetail: string | null;
    parkingDetail: string | null;
    hasNursingRoom: boolean | null;
    hasDiaperTable: boolean | null;
    thumbnailUrl: string | null;
    /** YYYY-MM-DD */
    lastVerifiedAt: string;
};

/** 지도 영역 안에서 한 번에 가져올 최대 놀거리 수 */
export const PLACE_BOUNDS_LIMIT = 300;

/** 지도 필터 — 값이 비어 있으면 그 축은 거르지 않는다 */
export type PlaceFilters = {
    types: PlaceType[];
    ages: PlaceAgeGroup[];
    indoorOutdoors: PlaceIndoorOutdoor[];
    /** true 면 무료만 */
    freeOnly: boolean;
    /** true 면 주차 가능만. 미확인(null)은 제외된다 */
    parkingOnly: boolean;
};

export const EMPTY_PLACE_FILTERS: PlaceFilters = {
    types: [],
    ages: [],
    indoorOutdoors: [],
    freeOnly: false,
    parkingOnly: false,
};

export function isPlaceType(value: string): value is PlaceType {
    return (PLACE_TYPES as readonly string[]).includes(value);
}

export function isPlaceAgeGroup(value: string): value is PlaceAgeGroup {
    return (PLACE_AGE_GROUPS as readonly string[]).includes(value);
}

export function isPlaceIndoorOutdoor(value: string): value is PlaceIndoorOutdoor {
    return (PLACE_INDOOR_OUTDOORS as readonly string[]).includes(value);
}
