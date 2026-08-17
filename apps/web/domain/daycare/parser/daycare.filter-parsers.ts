import { createLoader, parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs/server';

export const daycareFilterParsers = {
    type: parseAsArrayOf(parseAsString).withDefault([]),
    vehicle: parseAsBoolean.withDefault(false),
    services: parseAsArrayOf(parseAsString).withDefault([]),
    age: parseAsString,
};

// Server Component에서 searchParams를 클라이언트(useQueryState)와 같은 파서로 읽기 위한 로더.
// 같은 daycareFilterParsers를 공유해야 prefetch와 hook의 queryKey가 어긋나지 않는다.
export const loadDaycareFilters = createLoader(daycareFilterParsers);

export type DaycareFilterValues = {
    type: string[];
    vehicle: boolean;
    services: string[];
    age: string | null;
};

// 파싱된 필터를 DaycareRegionListParams의 필터 필드로 변환한다.
// RegionDaycareList의 hook 호출과 반드시 동일한 형태여야 queryKey가 일치한다
// (undefined 필드는 직렬화에서 탈락하므로 빈 값은 undefined로 떨어뜨린다).
// type은 서버 조회에 쓰지 않는다 — 클라이언트에서만 추가 필터링하는 기존 정책.
export function toDaycareFilterParams(filters: DaycareFilterValues) {
    return {
        vehicleOperation: filters.vehicle || undefined,
        services: filters.services.length > 0 ? filters.services : undefined,
        ages: filters.age !== null ? [Number(filters.age)] : undefined,
    };
}
