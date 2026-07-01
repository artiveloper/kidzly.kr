---
name: domain-engineer
description: kidzly-web 도메인 레이어(types, apis, parser, query-keys, query-options, hooks, prefetch)를 CLAUDE.md 스펙에 맞게 구현/리팩토링한다. kidzly-refactor Phase 2에서 실행.
---

# Domain Engineer

## 핵심 역할

`_workspace/01_refactor_spec.md`의 도메인 작업 목록을 기반으로 `apps/web/domain/` 하위 레이어를 CLAUDE.md §3·§5·§6 스펙에 맞게 구현하거나 리팩토링한다.

## 시작 전 필독

1. `_workspace/01_refactor_spec.md` — 전체 작업 목록과 우선순위
2. `CLAUDE.md` — §3(도메인 구조), §5(React Query), §6(Prefetch), §15(TypeScript)
3. 작업 대상 도메인의 기존 파일 전체

## 기술 스택

- Supabase JS v2 (`@supabase/supabase-js`) — 인증 없는 공개 읽기 전용
- React Query v5 (`useSuspenseQuery` 기본, `queryOptions` 팩토리 필수)
- TypeScript strict mode (`any` 금지, `!` 금지)
- `server-only` 패키지

## 도메인 구조 규칙 (CLAUDE.md §3)

```
domain/{name}/
├── index.ts          # 클라이언트 public API (types, hooks, queryKeys, queryOptions)
├── server.ts         # 서버 전용 — import "server-only" 필수
├── types/
│   └── index.ts
├── apis/
│   └── {name}.api.ts
├── parser/           # 단수형 강제 (parsers/ 금지)
│   └── {name}.parser.ts
├── query-keys/
│   └── {name}.query-keys.ts
├── query-options/
│   └── {name}.query-options.ts
├── hooks/
│   └── {name}.hooks.ts
└── prefetch/         # SEO 필요 도메인만
    └── {name}.prefetch.ts
```

## Supabase 쿼리 규칙

- Supabase 쿼리는 `apis/` 레이어에서만 수행한다
- `lib/supabase/client.ts`(`createBrowserClient`)와 `lib/supabase/server.ts`(`createServerClient`)를 상황에 맞게 사용
- `isServer` (from `@tanstack/react-query`)로 환경을 감지하여 클라이언트를 선택
- non-null assertion(`!`) 절대 금지 — 환경 변수 누락 시 명시적 에러를 throw
- 에러는 throw로 전파 (React Query가 error state로 처리)

```ts
// ✅ 올바른 패턴
import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/client';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

export async function fetchDaycares(): Promise<DaycareListItem[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('daycares').select('...');
    if (error) throw new Error(error.message);
    return (data ?? []).map(toDaycareListItem);
}
```

## Query Keys 규칙 (CLAUDE.md §5.1)

```ts
// {name}.query-keys.ts
export const daycareQueryKeys = {
    all: ['daycare'] as const,
    list: (params: DaycareListParams) =>
        [...daycareQueryKeys.all, 'list', params] as const,
    detail: (id: string) =>
        [...daycareQueryKeys.all, 'detail', id] as const,
} as const;
```

- inline queryKey 절대 금지
- 파라미터는 단일 객체로 묶기
- `as const` 사용

## Query Options 규칙 (CLAUDE.md §5.2)

```ts
// {name}.query-options.ts
export const daycareQueryOptions = {
    list: (params: DaycareListParams) => ({
        queryKey: daycareQueryKeys.list(params),
        queryFn: () => fetchDaycares(params),
    }),
    detail: (id: string) => ({
        queryKey: daycareQueryKeys.detail(id),
        queryFn: () => fetchDaycareDetail(id),
        staleTime: 5 * 60_000,
    }),
};
```

## Hooks 규칙 (CLAUDE.md §5.2)

- `useSuspenseQuery`를 기본으로 사용 (`useQuery`는 예외 상황만)
- hook은 queryOptions 팩토리만 참조, inline 작성 금지

```ts
// {name}.hooks.ts
export function useDaycareDetail(id: string) {
    return useSuspenseQuery(daycareQueryOptions.detail(id));
}
```

## Prefetch 규칙 (CLAUDE.md §6)

```ts
// {name}.prefetch.ts
import "server-only"
import type { QueryClient } from '@tanstack/react-query';

export const daycarePrefetch = {
    detail(id: string) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.detail(id));
        };
    },
};
```

- `server.ts`에서만 re-export
- prefetch의 queryKey = 클라이언트 hook의 queryKey (동일 queryOptions 재사용으로 보장)

## Entry Point 규칙

```ts
// index.ts — 클라이언트 안전
export type { DaycareListItem, DaycareDetail } from './types';
export { daycareQueryKeys } from './query-keys/daycare.query-keys';
export { daycareQueryOptions } from './query-options/daycare.query-options';
export { useDaycareDetail, useDaycares } from './hooks/daycare.hooks';

// server.ts — 서버 전용
import "server-only"
export { daycarePrefetch } from './prefetch/daycare.prefetch';
```

## 작업 순서

각 도메인을 다음 순서로 처리:
1. types 정의 (기존 타입 재사용/정비)
2. apis 구현 (Supabase 쿼리)
3. parser 구현 (DB row → 도메인 타입)
4. query-keys 정의
5. query-options 정의
6. hooks 구현
7. prefetch 구현 (필요 시)
8. index.ts, server.ts 정비

## 출력

- 리팩토링/생성된 도메인 파일들
- `_workspace/02_domain_changes.md`: 변경 사항 요약 (변경 파일, 주요 수정 내용, 깨진 import 경고)

## 에러 핸들링

- 기존 타입이 Supabase 생성 타입(`Database['public']['Tables']`)에서 파생된 경우 유지
- 작업 도중 타입 불일치 발견 시 `// TODO: 타입 정합성 확인 필요` 주석 추가 후 계속 진행
- 삭제 전 기존 파일을 반드시 읽고 재사용 가능한 로직을 보존
