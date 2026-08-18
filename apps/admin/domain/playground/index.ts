// playgrounds 도메인의 클라이언트 공개 API
export type { Playground, PlaygroundListParams, PlaygroundListResult } from './types';
export { PLAYGROUND_PAGE_SIZE } from './apis/playground.api';
export { playgroundKeys } from './query-keys/playground.query-keys';
export { playgroundSearchParsers } from './search-params/playground.search-params';
export { playgroundListOptions } from './query-options/playground.query-options';
export { usePlaygroundList } from './hooks/playground.hooks';

// safemap IF_0007 코드값 라벨. 설치장소코드(A001~A093)는 공개된 매핑표가 없어 원본 코드를 그대로 보여준다.
export const OWNERSHIP_LABEL: Record<string, string> = {
    C001: '민간',
    C002: '공공',
};

export const INDOOR_OUTDOOR_LABEL: Record<string, string> = {
    O001: '실내',
    O002: '실외',
};

export const OPERATION_LABEL: Record<string, string> = {
    B001: '운영',
    B003: '이용금지',
};

/** 코드에 대응하는 라벨이 없으면 코드를 그대로 보여준다 — 임의로 지어내지 않는다. */
export function formatCode(labels: Record<string, string>, code: string | null): string {
    if (!code) return '-';
    return labels[code] ?? code;
}
