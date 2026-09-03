// 지도 레이어(어린이집 / 놀이시설) URL 상태 파서
// 서버 로더는 두지 않는다 — page에서 searchParams를 읽으면 /map이 정적 렌더링을 잃는다.
import { parseAsStringLiteral } from 'nuqs';

export const MAP_LAYERS = ['daycare', 'playground'] as const;

export type MapLayer = (typeof MAP_LAYERS)[number];

export const mapLayerParsers = {
    layer: parseAsStringLiteral(MAP_LAYERS).withDefault('daycare'),
};

/**
 * 레이어 전환 탭 노출 여부. 놀이시설 레이어 공개 전까지 헤더·지도의 탭을 숨긴다.
 * 공개할 때 true로 바꾸면 된다 — 레이어 로직 자체는 그대로 살아 있다.
 * 숨긴 상태에서도 `?layer=playground` 로 직접 들어가면 동작을 확인할 수 있다.
 * 타입을 boolean으로 명시해야 false 리터럴로 좁혀져 반대편 분기가 죽는 것을 막는다.
 */
export const MAP_LAYER_TABS_ENABLED: boolean = false;
