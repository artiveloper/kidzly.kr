// 어린이놀이시설(playgrounds) 도메인 타입 — 지도 표시에 필요한 최소 형태만 둔다
export type PlaygroundMapItem = {
    /** playgrounds.facility_id */
    id: string;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    /** 실내 / 실외 — indoor_outdoor_code 변환값 */
    indoorOutdoor: string | null;
    /** 설치장소 유형 — install_place_code 변환값 (미등록 코드는 null) */
    installPlace: string | null;
};

/** 지도 bbox 한 번에 가져올 최대 놀이시설 수 — 어린이집 지도와 동일 기준 */
export const PLAYGROUND_BOUNDS_LIMIT = 300;

/** 운영 중인 시설 (B003=이용금지는 지도에 노출하지 않는다) */
export const PLAYGROUND_OPERATING_CODE = 'B001';

export const PLAYGROUND_INDOOR_OUTDOOR_LABELS: Record<string, string> = {
    O001: '실내',
    O002: '실외',
};

/**
 * 설치장소코드(fclty_cd4) 라벨.
 * 연속 범위가 아니며 실사용 코드는 22개다 — 출처는 어린이놀이시설 안전관리시스템(cpf.go.kr) 검색 필터.
 */
export const PLAYGROUND_INSTALL_PLACE_LABELS: Record<string, string> = {
    A001: '목욕장업소',
    A002: '도로휴게시설',
    A003: '도시공원',
    A004: '식품접객업소',
    A005: '아동복지시설',
    A006: '어린이집',
    A007: '유치원',
    A008: '대규모점포',
    A009: '의료기관',
    A010: '주택단지',
    A011: '학교',
    A012: '학원',
    A013: '놀이제공영업소',
    A020: '주상복합',
    A022: '박물관',
    A023: '종교시설',
    A030: '자연휴양림',
    A031: '하천',
    A032: '야영장',
    A033: '공공도서관',
    A092: '육아종합지원센터',
    A093: '유아교육진흥원',
};
