import type { SigunguEntry } from './types';

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

// ── URL 경로 ─────────────────────────────────────────────────────────────────
// 지역 목록은 쿼리스트링(?arcode=11680)이 아니라 경로(/daycares/서울특별시/강남구)로 표현한다.
// 지역마다 제목·설명·canonical이 다른 개별 색인 대상이므로 /rankings/[sido]와 같은 규칙을 쓴다.

/**
 * 지역 이름을 URL 경로 세그먼트로 바꾼다 — 공백만 하이픈으로 치환하고 나머지는 원문을 유지한다.
 * "서구(구)"처럼 데이터에 그대로 남아 있는 행정 명칭을 가공하면 원래 이름으로 되돌릴 수 없다.
 * 시군구 277건 전수 확인 결과 이 규칙으로 (시도, 시군구) 슬러그가 겹치는 지역은 없다.
 */
export function toRegionSlug(name: string): string {
    return name.replace(/\s+/g, '-');
}

/**
 * 경로 세그먼트를 슬러그 비교용 문자열로 되돌린다.
 * URL 파라미터는 percent-encoded·NFD로 들어올 수 있어 디코드 후 NFC로 정규화한다.
 * 단독 '%'처럼 잘못 인코딩된 값은 디코드가 실패하므로 null로 떨어뜨려 호출부가 404를 내게 한다.
 */
function parseRegionSlug(segment: string): string | null {
    try {
        return decodeURIComponent(segment).normalize('NFC');
    } catch {
        return null;
    }
}

/** 지역 목록 URL을 만든다 — 시도만 주면 시도 페이지, 둘 다 주면 시군구 페이지 */
export function buildRegionPath(sido?: string | null, sigungu?: string | null): string {
    const segments = [sido, sigungu]
        .filter((name): name is string => Boolean(name))
        .map((name) => encodeURIComponent(toRegionSlug(name)));
    return ['/daycares', ...segments].join('/');
}

/**
 * 슬러그 비교용 키 — 공백과 하이픈을 지운 형태.
 * 표준 슬러그는 공백을 하이픈으로 바꾼 형태지만, 폐지된 /region 시절 URL은 공백을 그대로
 * 인코딩(%20)해 두 표기가 함께 유입된다. 같은 지역으로 인식한 뒤 표준 형태로 301 시키려고
 * 두 표기를 한 키로 모은다. 시군구 277건에 이 규칙으로 겹치는 지역이 없음을 확인했다.
 */
function toRegionKey(name: string): string {
    return name.replace(/[\s-]+/g, '');
}

export type RegionSelection =
    | { kind: 'index' }
    | { kind: 'sido'; sido: string }
    | { kind: 'sigungu'; sido: string; entry: SigunguEntry };

export type RegionResolution = {
    selection: RegionSelection;
    /** 표준 슬러그가 아닌 형태로 들어왔을 때 301로 보낼 표준 경로 — 표준 형태면 null */
    redirectTo: string | null;
};

/**
 * /daycares 이하 경로 세그먼트를 지역 선택 상태로 해석한다.
 * 세그먼트 값은 사용자 입력이므로 반드시 entries와 대조한다 — 맞는 지역이 없으면 null을
 * 돌려주고, 호출부가 notFound()로 404를 응답한다(soft 200과 중복 색인 방지).
 * 지역은 맞지만 표기가 표준 슬러그와 다르면 redirectTo로 표준 경로를 돌려준다 —
 * 같은 목록이 여러 URL로 갈라지지 않도록 호출부가 301로 넘긴다.
 */
export function resolveRegionSegments(
    segments: string[] | undefined,
    entries: SigunguEntry[],
): RegionResolution | null {
    if (!segments || segments.length === 0) return { selection: { kind: 'index' }, redirectTo: null };
    if (segments.length > 2) return null;

    const [sidoSegment, sigunguSegment] = segments;
    const sidoInput = sidoSegment ? parseRegionSlug(sidoSegment) : null;
    if (!sidoInput) return null;

    const sido = entries.find((entry) => toRegionKey(entry.sido) === toRegionKey(sidoInput))?.sido;
    if (!sido) return null;

    if (!sigunguSegment) {
        const canonical = sidoInput === toRegionSlug(sido);
        return {
            selection: { kind: 'sido', sido },
            redirectTo: canonical ? null : buildRegionPath(sido),
        };
    }

    const sigunguInput = parseRegionSlug(sigunguSegment);
    if (!sigunguInput) return null;

    const entry = entries.find(
        (candidate) =>
            candidate.sido === sido && toRegionKey(candidate.sigungu) === toRegionKey(sigunguInput),
    );
    if (!entry) return null;

    const canonical =
        sidoInput === toRegionSlug(sido) && sigunguInput === toRegionSlug(entry.sigungu);
    return {
        selection: { kind: 'sigungu', sido, entry },
        redirectTo: canonical ? null : buildRegionPath(sido, entry.sigungu),
    };
}
