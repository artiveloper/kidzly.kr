export type { SigunguEntry } from './types'

// 시도 목록의 진실 소스는 sigungus 테이블이다 (domain/region/server.ts의 fetchSidoNames).
// 이 상수는 DB에 없는 두 가지만 책임진다 — 짧은 표시 라벨과 노출 순서(행정 순).
// 키 순서가 곧 정렬 기준이므로 임의로 재배열하지 말 것.
// DB에만 있는 새 시도(행정구역 개편 등)는 목록에 자동으로 포함되며,
// 라벨이 없으면 getSidoShort가 전체 이름으로 폴백하고 정렬에서는 뒤에 붙는다.
export const SIDO_SHORT = {
    '서울특별시': '서울',
    '부산광역시': '부산',
    '대구광역시': '대구',
    '인천광역시': '인천',
    '광주광역시': '광주',
    '대전광역시': '대전',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '경기도': '경기',
    '강원특별자치도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전북특별자치도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주',
} as const;

export type Sido = keyof typeof SIDO_SHORT;

export function getSidoShort(sido: string): string {
    return SIDO_SHORT[sido as Sido] ?? sido;
}

export function formatLocation(sidoName: string | null, sigunguName: string | null): string {
    const deduped = sigunguName === sidoName ? null : sigunguName;
    const short = sidoName ? getSidoShort(sidoName) : null;
    return [short, deduped].filter(Boolean).join(' ');
}

// SIDO_SHORT의 키 순서(행정 순)로 정렬한다. 라벨이 없는 시도는 알려진 시도 뒤에
// 한글 정렬로 붙여, DB에 새 시도가 생겨도 기존 순서가 흔들리지 않게 한다.
export function sortSido(names: string[]): string[] {
    const order = Object.keys(SIDO_SHORT);
    return [...names].sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b, 'ko');
    });
}
