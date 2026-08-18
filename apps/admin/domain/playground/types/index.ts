// 어린이놀이시설(playgrounds) 도메인에서 주고받는 타입 정의
export type Playground = {
    facilityId: string;
    facilitySerialNo: string | null;
    sidoCode: string | null;
    sigunguCode: string | null;
    emdCode: string | null;
    name: string;
    address: string | null;
    /** EPSG:3857 Web Mercator — 위경도가 아니다 */
    coordX: number | null;
    coordY: number | null;
    /** YYYYMMDD 문자열 */
    installDate: string | null;
    facilityCode1: string | null;
    facilityCode2: string | null;
    installPlaceCode: string | null;
    ownershipCode: string | null;
    indoorOutdoorCode: string | null;
    operationCode: string | null;
    accidentYn: string | null;
    deletedYn: string | null;
    syncedAt: string;
};

export type PlaygroundListParams = {
    /** 시설명·주소 부분 일치 검색어 */
    keyword: string;
    /** 1부터 시작하는 페이지 번호 */
    page: number;
};

export type PlaygroundListResult = {
    items: Playground[];
    totalCount: number;
};
