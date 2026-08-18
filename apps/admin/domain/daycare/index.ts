// daycares 도메인의 클라이언트 공개 API
export type { Daycare, DaycareListItem, DaycareListParams, DaycareListResult } from './types';
export { DAYCARE_PAGE_SIZE } from './apis/daycare.api';
export { daycareKeys } from './query-keys/daycare.query-keys';
export { daycareSearchParsers } from './search-params/daycare.search-params';
export { daycareDetailOptions, daycareListOptions } from './query-options/daycare.query-options';
export { useDaycareDetail, useDaycareList } from './hooks/daycare.hooks';

/** 연령별 컬럼 라벨. 0세부터 5세까지 배열 순서와 1:1로 맞춘다. */
export const AGE_LABELS = ['0세', '1세', '2세', '3세', '4세', '5세'];
