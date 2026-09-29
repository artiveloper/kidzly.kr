// 놀거리(places) 도메인에서 주고받는 타입과 코드·라벨 정의
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

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
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

export const PLACE_AGE_GROUP_LABEL: Record<PlaceAgeGroup, string> = {
    infant: '영아',
    toddler: '걸음마',
    preschool: '유아',
    elementary: '초등',
};

export const PLACE_INDOOR_OUTDOORS = ['indoor', 'outdoor', 'mixed'] as const;

export type PlaceIndoorOutdoor = (typeof PLACE_INDOOR_OUTDOORS)[number];

export const PLACE_INDOOR_OUTDOOR_LABEL: Record<PlaceIndoorOutdoor, string> = {
    indoor: '실내',
    outdoor: '실외',
    mixed: '혼합',
};

/**
 * 확인 안 된 항목(null)과 '없음'(false)을 구분해 입력받기 위한 3지 선택값.
 * 폼은 문자열만 다루므로 boolean | null 과 이 값 사이를 변환해 쓴다.
 */
export const PLACE_TRISTATES = ['unknown', 'yes', 'no'] as const;

export type PlaceTristate = (typeof PLACE_TRISTATES)[number];

export function toTristate(value: boolean | null): PlaceTristate {
    if (value === null) return 'unknown';
    return value ? 'yes' : 'no';
}

export function fromTristate(value: PlaceTristate): boolean | null {
    if (value === 'unknown') return null;
    return value === 'yes';
}

export type Place = {
    id: string;
    name: string;
    summary: string;
    rating: number | null;
    placeType: PlaceType;
    ageGroups: PlaceAgeGroup[];
    indoorOutdoor: PlaceIndoorOutdoor;
    isFree: boolean;
    /** null 은 아직 확인 안 됨 */
    hasParking: boolean | null;
    openingHours: string;
    closedDays: string;
    priceDetail: string | null;
    parkingDetail: string | null;
    hasNursingRoom: boolean | null;
    hasDiaperTable: boolean | null;
    address: string;
    /** 건물명·동·층·호수 등 상세 주소. 좌표 변환에는 쓰지 않는다 */
    addressDetail: string | null;
    latitude: number;
    longitude: number;
    thumbnailUrl: string | null;
    /** YYYY-MM-DD */
    lastVerifiedAt: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

/** 등록·수정 폼이 보내는 값. id 를 뺀 나머지는 등록과 수정이 동일하다. */
export type PlaceInput = {
    name: string;
    summary: string;
    rating: number | null;
    placeType: PlaceType;
    ageGroups: PlaceAgeGroup[];
    indoorOutdoor: PlaceIndoorOutdoor;
    isFree: boolean;
    hasParking: boolean | null;
    openingHours: string;
    closedDays: string;
    priceDetail: string | null;
    parkingDetail: string | null;
    hasNursingRoom: boolean | null;
    hasDiaperTable: boolean | null;
    address: string;
    addressDetail: string | null;
    latitude: number;
    longitude: number;
    thumbnailUrl: string | null;
    lastVerifiedAt: string;
    isPublished: boolean;
};

export type UpdatePlaceInput = PlaceInput & { id: string };

export type PlaceListParams = {
    /** 장소명·주소 부분 일치 검색어 */
    keyword: string;
    /** 1부터 시작하는 페이지 번호 */
    page: number;
};

export type PlaceListResult = {
    items: Place[];
    totalCount: number;
};

export const PLACE_PAGE_SIZE = 20;

/** 한국 영역 밖 좌표는 입력 실수다 — DB CHECK 제약과 같은 범위를 쓴다 */
export const PLACE_LATITUDE_RANGE = { min: 33, max: 39 } as const;
export const PLACE_LONGITUDE_RANGE = { min: 124, max: 132 } as const;

/** 정의서가 정한 한 줄 소개 길이 상한 */
export const PLACE_SUMMARY_MAX_LENGTH = 40;
