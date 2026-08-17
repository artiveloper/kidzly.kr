// 정적 sigungus 참조 테이블 기반 — daycares 전량 스캔 없이 이름만 필요한 곳(/daycares 지역별 탭)에서 사용
export type SigunguEntry = {
    sido: string;
    sigungu: string;
    /** sigungus.arcode — daycares.sigungu_code와 동일한 값 공간(둘 다 varchar), 지역별 목록 조회 키 */
    arcode: string;
};
