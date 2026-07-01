# React Query 패턴 — kidzly-web SSoT

> CLAUDE.md §5~11 기반. domain-engineer, ui-engineer, qa-engineer가 참조.

## 목차
1. [Query Keys 팩토리](#1-query-keys-팩토리)
2. [Query Options 팩토리](#2-query-options-팩토리)
3. [Hooks 패턴](#3-hooks-패턴)
4. [Prefetch 패턴](#4-prefetch-패턴)
5. [Page 패턴 (SSR + Hydration)](#5-page-패턴-ssr--hydration)
6. [Mutation 패턴](#6-mutation-패턴)
7. [nuqs + React Query 연동](#7-nuqs--react-query-연동)
8. [Suspense & Error 경계](#8-suspense--error-경계)
9. [Skeleton · 로딩 패턴](#9-skeleton--로딩-패턴)
10. [캐시 레이어 역할](#10-캐시-레이어-역할)
11. [금지 패턴](#11-금지-패턴)

---

## 1. Query Keys 팩토리

```ts
// domain/daycare/query-keys/daycare.query-keys.ts
export const daycareQueryKeys = {
    all: ['daycare'] as const,

    list: (params: DaycareListParams) =>
        [...daycareQueryKeys.all, 'list', params] as const,

    detail: (id: string) =>
        [...daycareQueryKeys.all, 'detail', id] as const,

    ranking: (type: string, sido?: string) =>
        [...daycareQueryKeys.all, 'ranking', { type, sido }] as const,
} as const;
```

**규칙:**
- 항상 배열
- stable & serializable (undefined 제거, enum 기본값 명시)
- inline 직접 작성 절대 금지

---

## 2. Query Options 팩토리

```ts
// domain/daycare/query-options/daycare.query-options.ts
import { queryOptions } from '@tanstack/react-query';

export const daycareQueryOptions = {
    // 기본: global staleTime/gcTime 사용 (생략)
    list: (params: DaycareListParams) =>
        queryOptions({
            queryKey: daycareQueryKeys.list(params),
            queryFn: () => fetchDaycares(params),
        }),

    // 정적 데이터: 긴 staleTime
    detail: (id: string) =>
        queryOptions({
            queryKey: daycareQueryKeys.detail(id),
            queryFn: () => fetchDaycareDetail(id),
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
        }),
};
```

**staleTime override 기준:**
- ✅ 정적 데이터 (긴 staleTime)
- ✅ 실시간 데이터 (짧은 staleTime)
- ❌ 일반 리스트/상세 (global 설정 사용)

---

## 3. Hooks 패턴

### useSuspenseQuery (기본)

```ts
// domain/daycare/hooks/daycare.hooks.ts
import { useSuspenseQuery } from '@tanstack/react-query';

export function useDaycareDetail(id: string) {
    return useSuspenseQuery(daycareQueryOptions.detail(id));
    // data는 항상 defined — isLoading 분기 불필요
}

export function useDaycares(params: DaycareListParams) {
    return useSuspenseQuery(daycareQueryOptions.list(params));
}
```

```tsx
// 사용 컴포넌트 — 반드시 Suspense 내부
'use client';
export function DaycareDetail({ id }: { id: string }) {
    const { data } = useDaycareDetail(id); // isLoading 체크 없음, data 항상 정의
    return <div>{data.name}</div>;
}
```

### useQuery (예외)

```ts
// Suspense 경계를 둘 수 없는 경우만
export function useDaycareCount() {
    return useQuery(daycareQueryOptions.count());
    // isLoading, isPending 직접 처리
}
```

### useInfiniteQuery (hooks에 직접 정의)

```ts
// queryOptions 팩토리 불가 — hooks에 직접 정의, queryKey는 팩토리 사용
export function useDaycaresInfinite(filters: DaycareListParams = {}) {
    return useInfiniteQuery({
        queryKey: daycareQueryKeys.list(filters),
        queryFn: ({ pageParam }) => fetchDaycares({ ...filters, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    });
}
```

---

## 4. Prefetch 패턴

```ts
// domain/daycare/prefetch/daycare.prefetch.ts
import 'server-only';
import type { QueryClient } from '@tanstack/react-query';

export const daycarePrefetch = {
    // 일반 쿼리
    detail(id: string) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.detail(id));
        };
    },

    // 무한 쿼리 첫 페이지
    list(params: DaycareListParams) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchInfiniteQuery({
                queryKey: daycareQueryKeys.list(params),
                queryFn: ({ pageParam }) => fetchDaycares({ ...params, page: pageParam }),
                initialPageParam: 1,
            });
        };
    },
};
```

```ts
// domain/daycare/server.ts
import 'server-only';
export { daycarePrefetch } from './prefetch/daycare.prefetch';
```

**prefetch 대상:**

| 대상 | 여부 |
|------|------|
| 리스트·상세 페이지 (SEO, LCP) | ✅ 필수 |
| 무한 스크롤 첫 페이지 | ✅ 필수 |
| 무한 스크롤 이후 페이지 | ❌ 금지 |
| 모달 전용 데이터 | ❌ 금지 |

---

## 5. Page 패턴 (SSR + Hydration)

```ts
// lib/react-query/prefetch.ts
export async function runPrefetch(
    ...prefetchers: Array<(qc: QueryClient) => Promise<void>>
) {
    const qc = getQueryClient();
    await Promise.all(prefetchers.map((fn) => fn(qc)));
    return dehydrate(qc);
}
```

```tsx
// app/(main)/daycare/[id]/page.tsx — Server Component
import { HydrationBoundary } from '@tanstack/react-query';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';

export default async function DaycareDetailPage({ params }: { params: { id: string } }) {
    const state = await runPrefetch(daycarePrefetch.detail(params.id));

    return (
        <HydrationBoundary state={state}>
            <Suspense fallback={<DaycareDetailSkeleton />}>
                <DaycareDetailView id={params.id} />
            </Suspense>
        </HydrationBoundary>
    );
}
```

복수 prefetch (병렬):
```ts
const state = await runPrefetch(
    daycarePrefetch.detail(params.id),
    regionPrefetch.list(),
);
```

---

## 6. Mutation 패턴

### 기본 Mutation

```ts
export function useCreateSomething() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateInput) => createSomething(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: daycareQueryKeys.all });
        },
        onError: (err) => {
            // 사용자 친화 메시지 — 원본 Error 노출 금지
            console.error(err.message);
        },
    });
}
```

### 낙관적 업데이트

```ts
export function useOptimisticUpdate(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newValue: string) => updateSomething(id, newValue),
        onMutate: async (newValue) => {
            await queryClient.cancelQueries({ queryKey: daycareQueryKeys.detail(id) });
            const previous = queryClient.getQueryData(daycareQueryKeys.detail(id));
            queryClient.setQueryData(daycareQueryKeys.detail(id), (old: DaycareDetail) => ({
                ...old,
                name: newValue,
            }));
            return { previous };
        },
        onError: (_err, _newValue, context) => {
            queryClient.setQueryData(daycareQueryKeys.detail(id), context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: daycareQueryKeys.detail(id) });
        },
    });
}
```

---

## 7. nuqs + React Query 연동

```tsx
// components/daycare/daycare-list.tsx
'use client';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export function DaycareListClient() {
    // URL 상태 — 공유·새로고침·뒤로가기 보존
    const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [sido, setSido] = useQueryState('sido', parseAsString);

    // nuqs 값을 queryOptions 파라미터로 전달 → queryKey에 자동 포함
    const { data } = useDaycares({ query, page, sido: sido ?? undefined });

    return <DaycareTable data={data} onPageChange={setPage} />;
}
```

```tsx
// app/(main)/daycare/page.tsx — Server Component
export default async function DaycarePage({ searchParams }: { searchParams: Record<string, string> }) {
    // searchParams로 초기값 읽어 prefetch에 반영
    const state = await runPrefetch(
        daycarePrefetch.list({
            query: searchParams.q ?? '',
            page: Number(searchParams.page ?? 1),
            sido: searchParams.sido,
        }),
    );
    return (
        <HydrationBoundary state={state}>
            <Suspense fallback={<DaycareListSkeleton />}>
                <DaycareListClient />
            </Suspense>
        </HydrationBoundary>
    );
}
```

**검색 디바운스:**
```ts
const [inputValue, setInputValue] = useState('');
const [, setQuery] = useQueryState('q', parseAsString.withDefault(''));

// 300ms 디바운스 — 매 키 입력마다 리패치 금지
useEffect(() => {
    const timer = setTimeout(() => setQuery(inputValue || null), 300);
    return () => clearTimeout(timer);
}, [inputValue, setQuery]);
```

---

## 8. Suspense & Error 경계

### 라우트 레벨 (loading.tsx)

```tsx
// app/(main)/daycare/loading.tsx
import { DaycareListSkeleton, PageHeaderSkeleton } from '@/components/common/skeletons';

export default function DaycareLoading() {
    return (
        <div>
            <PageHeaderSkeleton />
            <DaycareListSkeleton />
        </div>
    );
}
```

### 컴포넌트 레벨 (ErrorBoundary + Suspense)

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

// 독립 데이터 영역마다 — 한 영역 실패가 전체 페이지를 비우면 안 됨
<QueryErrorResetBoundary>
    {({ reset }) => (
        <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
                <ErrorCard onRetry={resetErrorBoundary} />
            )}
        >
            <Suspense fallback={<DaycareDetailSkeleton />}>
                <DaycareDetailView id={id} />
            </Suspense>
        </ErrorBoundary>
    )}
</QueryErrorResetBoundary>
```

### error.tsx (라우트 세그먼트)

```tsx
// app/(main)/daycare/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div>
            <p>어린이집 정보를 불러오지 못했습니다.</p>
            <button onClick={reset}>다시 시도</button>
        </div>
    );
}
```

**원칙:**
- 예상된 실패(폼·mutation 비즈니스 에러) → `isError`/`ActionResult` 인라인
- 예상 못 한 실패만 ErrorBoundary
- `throwOnError: true`는 바운더리로 던질 쿼리만

---

## 9. Skeleton · 로딩 패턴

```tsx
// components/common/skeletons.tsx — 공유 Skeleton 컴포넌트
export function DaycareListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
        </div>
    );
}

export function PageHeaderSkeleton() {
    return <div className="h-10 w-48 animate-pulse rounded bg-muted" />;
}
```

**규칙:**
- 로딩 텍스트(`"불러오는 중..."`) 절대 금지 → Skeleton 사용
- Skeleton 크기 = 최종 레이아웃 크기 (CLS 방지)
- `useSuspenseQuery` → `loading.tsx` or `<Suspense fallback={<Skeleton/>}>`
- `useQuery` → `isLoading`/`isPending` 분기 + Skeleton

---

## 10. 캐시 레이어 역할

| 레이어 | 도구 | 역할 |
|--------|------|------|
| L0 | Next.js fetch cache | ISR, revalidateTag (cross-request) |
| L1 | React `cache()` | RSC 렌더 내 중복 fetch 제거 |
| L2 | React Query | UI 상태 single source of truth |

서버 데이터는 React Query hydration 후에만 fresh로 간주.

---

## 11. 금지 패턴

```ts
// ❌ inline queryKey
useQuery({ queryKey: ['daycare', id], queryFn: ... })

// ❌ useEffect fetch
useEffect(() => { fetch('/api/...').then(setData) }, [])

// ❌ router.refresh() 데이터 갱신
router.refresh()

// ❌ deep import
import { useDaycareDetail } from '@/domain/daycare/hooks/daycare.hooks'

// ❌ export *
export * from './hooks/daycare.hooks'

// ❌ isLoading 분기 with useSuspenseQuery
const { data, isLoading } = useSuspenseQuery(...) // isLoading 항상 false

// ❌ useQuery + suspense: true (v5 제거)
useQuery({ ..., suspense: true })

// ❌ URL 상태를 useState로 관리
const [filter, setFilter] = useState('') // → useQueryState 사용

// ❌ 로딩 텍스트
if (isLoading) return <p>불러오는 중...</p> // → Skeleton 사용
```
