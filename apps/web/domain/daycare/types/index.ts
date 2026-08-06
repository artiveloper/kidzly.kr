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

/** 시군구 허브 페이지 카드 상한 — 중앙값(47)을 여유 있게 커버, 2열 그리드 나눗값도 깔끔 */
export const DEFAULT_REGION_LIST_LIMIT = 72;

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
