// 어린이집(daycares) 도메인에서 주고받는 타입 정의
export type Daycare = {
    daycareCode: string;
    sigunguCode: string;
    sidoName: string | null;
    sigunguName: string | null;
    name: string;
    typeName: string | null;
    status: string | null;
    zipCode: string | null;
    address: string | null;
    phone: string | null;
    fax: string | null;
    homepage: string | null;
    /** 원본이 문자열 컬럼이라 숫자로 바꾸지 않고 그대로 보여준다 */
    latitude: string | null;
    longitude: string | null;
    capacity: number | null;
    currentChildCount: number | null;
    nurseryRoomCount: number | null;
    nurseryRoomSize: number | null;
    playgroundCount: number | null;
    cctvCount: number | null;
    childcareStaffCount: number | null;
    /** 0세부터 5세까지 6칸 배열 */
    classCountByAge: (number | null)[];
    classCountTotal: number | null;
    classCountInfantMixed: number | null;
    classCountChildMixed: number | null;
    classCountSpecial: number | null;
    childCountByAge: (number | null)[];
    childCountTotal: number | null;
    childCountInfantMixed: number | null;
    childCountChildMixed: number | null;
    childCountSpecial: number | null;
    waitingChildByAge: (number | null)[];
    waitingChildTotal: number | null;
    staffTotal: number | null;
    staffDirectorCount: number | null;
    staffTeacherCount: number | null;
    staffSpecialTeacherCount: number | null;
    staffTherapistCount: number | null;
    staffNutritionistCount: number | null;
    staffNurseCount: number | null;
    staffNursingAssistantCount: number | null;
    staffCookCount: number | null;
    staffOfficeCount: number | null;
    staffTenureUnder1y: number | null;
    staffTenure1yTo2y: number | null;
    staffTenure2yTo4y: number | null;
    staffTenure4yTo6y: number | null;
    staffTenureOver6y: number | null;
    representativeName: string | null;
    certifiedDate: string | null;
    abolishedDate: string | null;
    pauseStartDate: string | null;
    pauseEndDate: string | null;
    dataStandardDate: string | null;
    vehicleOperation: string | null;
    services: string | null;
    syncedAt: string;
};

export type DaycareListParams = {
    /** 어린이집명·주소 부분 일치 검색어 */
    keyword: string;
    /** 1부터 시작하는 페이지 번호 */
    page: number;
};

/** 목록 표에 필요한 최소 컬럼만 담는다. 상세는 열 때 따로 조회한다. */
export type DaycareListItem = {
    daycareCode: string;
    name: string;
    typeName: string | null;
    status: string | null;
    address: string | null;
};

export type DaycareListResult = {
    items: DaycareListItem[];
    /** 총 건수는 세지 않는다 — 짧은 검색어에서 전체 스캔이 되어 statement timeout 이 난다. */
    hasNext: boolean;
};
