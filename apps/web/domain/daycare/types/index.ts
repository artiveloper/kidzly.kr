export type DaycareType =
    | 'national'
    | 'public'
    | 'private'
    | 'home'
    | 'workplace'
    | 'cooperative';

export type DaycareServiceType =
    | '24시간'
    | '방과후 전담'
    | '방과후통합'
    | '시간제보육'
    | '야간연장형'
    | '영아전담'
    | '일반'
    | '장애아전문'
    | '장애아통합'
    | '휴일보육';

export type Daycare = {
    id: string;
    name: string;
    address: string;
    phone: string;
    fax: string | null;
    type: DaycareType;
    typeName: string;
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
    waitingChildByAge: (number | null)[];
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

export const DAYCARE_TYPE_LABELS: Record<DaycareType | 'all', string> = {
    all: '전체',
    national: '국공립',
    public: '공립',
    private: '민간',
    home: '가정',
    workplace: '직장',
    cooperative: '부모협동',
};

export const DAYCARE_SERVICE_LABELS: Record<DaycareServiceType, string> = {
    '24시간': '🕐 24시간',
    '방과후 전담': '📚 방과후전담',
    '방과후통합': '🎒 방과후통합',
    '시간제보육': '⏱️ 시간제',
    '야간연장형': '🌙 야간연장',
    '영아전담': '👶 영아전담',
    '일반': '⭐ 일반',
    '장애아전문': '💙 장애아전문',
    '장애아통합': '🤝 장애아통합',
    '휴일보육': '📅 휴일보육',
};

export const DAYCARE_SERVICE_TYPES: DaycareServiceType[] = [
    '24시간', '방과후 전담', '방과후통합', '시간제보육',
    '야간연장형', '영아전담', '일반', '장애아전문', '장애아통합', '휴일보육',
];

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
