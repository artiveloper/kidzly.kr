// 놀거리 지도 필터의 URL 상태 정의 — 정의서가 정한 5개 축을 그대로 옮긴다
import { parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs/server';
import type { PlaceAgeGroup, PlaceFilters, PlaceIndoorOutdoor, PlaceType } from '../types';
import { isPlaceAgeGroup, isPlaceIndoorOutdoor, isPlaceType } from '../types';

export const placeFilterParsers = {
    ptype: parseAsArrayOf(parseAsString).withDefault([]),
    page: parseAsArrayOf(parseAsString).withDefault([]),
    io: parseAsArrayOf(parseAsString).withDefault([]),
    free: parseAsBoolean.withDefault(false),
    parking: parseAsBoolean.withDefault(false),
};

export type PlaceFilterValues = {
    ptype: string[];
    page: string[];
    io: string[];
    free: boolean;
    parking: boolean;
};

/**
 * URL 문자열을 조회에 쓰는 필터로 좁힌다.
 * 주소창은 손으로 고칠 수 있으므로 정의된 코드가 아닌 값은 버린다.
 */
export function toPlaceFilters(values: PlaceFilterValues): PlaceFilters {
    return {
        types: values.ptype.filter((value): value is PlaceType => isPlaceType(value)),
        ages: values.page.filter((value): value is PlaceAgeGroup => isPlaceAgeGroup(value)),
        indoorOutdoors: values.io.filter((value): value is PlaceIndoorOutdoor =>
            isPlaceIndoorOutdoor(value)
        ),
        freeOnly: values.free,
        parkingOnly: values.parking,
    };
}
