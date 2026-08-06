export type DaycareListItem = {
    id: string;
    name: string;
    address: string;
    phone: string;
    typeName: string;
    latitude: number | null;
    longitude: number | null;
    capacity: number | null;
    currentChildCount: number | null;
    services: string | null;
    vehicleOperation: string | null;
    ageRange: { min: number; max: number } | null;
    waitingChildByAge: (number | null)[];
};

export type DaycareDetail = {
    id: string;
    name: string;
    address: string;
    phone: string;
    fax: string | null;
    typeName: string;
    sidoName: string | null;
    sigunguName: string | null;
    sigunguCode: string;
    status: string;
    representativeName: string | null;
    capacity: number | null;
    currentChildCount: number | null;
    nurseryRoomCount: number | null;
    nurseryRoomSize: number | null;
    playgroundCount: number | null;
    cctvCount: number | null;
    childcareStaffCount: number | null;
    ageRange: { min: number; max: number } | null;
    latitude: number | null;
    longitude: number | null;
    services: string | null;
    vehicleOperation: string | null;
    certifiedDate: string | null;
    dataStandardDate: string | null;
    syncedAt: string | null;
    classCountByAge: (number | null)[];
    classCountInfantMixed: number | null;
    classCountChildMixed: number | null;
    classCountSpecial: number | null;
    childCountByAge: (number | null)[];
    waitingChildByAge: (number | null)[];
    childCountInfantMixed: number | null;
    childCountChildMixed: number | null;
    childCountSpecial: number | null;
    staffDirectorCount: number | null;
    staffTeacherCount: number | null;
    staffSpecialTeacherCount: number | null;
    staffTherapistCount: number | null;
    staffNutritionistCount: number | null;
    staffNurseCount: number | null;
    staffNursingAssistantCount: number | null;
    staffCookCount: number | null;
    staffOfficeCount: number | null;
    staffTenure: {
        under1y: number | null;
        y1to2: number | null;
        y2to4: number | null;
        y4to6: number | null;
        over6y: number | null;
    } | null;
    aiAnalysisSummary: string | null;
};

export type MapBounds = {
    south: number;
    north: number;
    west: number;
    east: number;
};

/** 노원구 중계동 일대 — 서울 영유아 인구 밀집 지역 (zoom 16 기준) */
export const DEFAULT_BOUNDS: MapBounds = {
    south: 37.630,
    north: 37.650,
    west: 127.060,
    east: 127.080,
};


export type DaycareRankingItem = {
    id: string;
    rank: number;
    name: string;
    sidoName: string | null;
    sigunguName: string | null;
    typeName: string;
    address: string;
    waitingChildTotal: number;
    capacity: number | null;
    currentChildCount: number | null;
};

export type DaycareRecentItem = {
    id: string;
    rank: number;
    name: string;
    sidoName: string | null;
    sigunguName: string | null;
    typeName: string;
    address: string;
    certifiedDate: string;
    capacity: number | null;
    currentChildCount: number | null;
};

export type DaycareCapacityItem = {
    id: string;
    rank: number;
    name: string;
    sidoName: string | null;
    sigunguName: string | null;
    typeName: string;
    address: string;
    capacity: number;
    currentChildCount: number | null;
    waitingChildTotal: number | null;
};

export type DaycareNearbyItem = {
    id: string;
    name: string;
    typeName: string;
    address: string;
    /** 기준 좌표(origin) 대비 직선 거리(km). origin이 없거나 좌표 결측 시 null */
    distanceKm: number | null;
};

export type DaycareRegionListItem = {
    id: string;
    name: string;
    typeName: string;
    address: string;
};

export type DaycareRegionListResult = {
    items: DaycareRegionListItem[];
    totalCount: number;
};

/**
 * 시군구 허브 페이지 카드 상한 — SEO 목적상 지역 내 전체 어린이집을 링크하는 게 원칙이라
 * 실질적인 컷은 없음. 실측 최대치(779건, 경기 화성시 동탄구)를 여유 있게 웃도는 값으로,
 * 이상 데이터로 무한정 늘어나는 것만 막는 안전장치용 상한이다.
 */
export const DEFAULT_REGION_LIST_LIMIT = 1000;

export type DaycareAgeFilter = 0 | 1 | 2 | 3 | 4 | 5;

export const DAYCARE_AGE_FILTERS: DaycareAgeFilter[] = [0, 1, 2, 3, 4, 5];

export const DAYCARE_AGE_LABELS: Record<DaycareAgeFilter, string> = {
    0: '만0세',
    1: '만1세',
    2: '만2세',
    3: '만3세',
    4: '만4세',
    5: '만5세',
};
