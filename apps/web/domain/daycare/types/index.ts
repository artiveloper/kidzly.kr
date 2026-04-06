export type DaycareType =
    | 'national'
    | 'public'
    | 'private'
    | 'home'
    | 'workplace'
    | 'cooperative';

export type Daycare = {
    id: string;
    name: string;
    address: string;
    phone: string;
    type: DaycareType;
    typeName: string;
    status: string;
    capacity: number | null;
    currentChildCount: number | null;
    latitude: number | null;
    longitude: number | null;
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
