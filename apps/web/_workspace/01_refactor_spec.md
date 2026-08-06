# 리팩토링 명세 — 어린이집 상세페이지 "같은 지역 다른 어린이집" 섹션

> **범위 한정**: 이번 작업은 전체 코드베이스 리팩토링이 아니라 GSC 색인 이슈(개별 상세페이지 24,592건이 sitemap.xml에만 의존, 페이지 간 내부링크 부재) 해결을 위한 **신규 기능 스펙**이다. `domain/daycare`와 `components/daycare/detail/*` 범위로 한정하며, 다른 도메인/컴포넌트는 분석하지 않았다.

## 배경 요약

- 문제: `/daycare/[id]` 상세페이지(전국 24,592건)가 sitemap.xml에만 의존 → 크롤링 우선순위 신호 약함
- rankings 페이지는 지역당 TOP10만 링크 → 전체의 ~2%만 강한 내부링크 보유
- 해결: 상세페이지에 같은 시군구(`sigungu_code`) 내 다른 어린이집 5~10개를 SSR로 렌더링되는 `<Link>`로 노출 → 상세페이지 간 상호 링크망 형성

## 기존 구조 확인 결과 (읽기 완료)

- `domain/daycare/` 전 레이어 확인 완료 — types, apis, parser, query-keys, query-options, hooks, prefetch, index.ts, server.ts 모두 CLAUDE.md §3 구조 **✅ 준수** 상태 (단수형 `parser/`, 레이어 분리, entry point 분리 모두 정상)
- `daycares` 테이블에 `sigungu_code varchar(10) not null` 컬럼 존재, `idx_daycares_sigungu_code` 인덱스 존재 (schema.sql L4-9, L232-233) — 시군구 필터링에 바로 사용 가능
- `DaycareDetail` 타입(`domain/daycare/types/index.ts`)에는 `sigunguName`은 있으나 **`sigunguCode`가 없음** → 신규 추가 필요 (아래 상세)
- `DaycareDetailSSR.tsx`는 `Promise.all([runPrefetch(daycarePrefetch.detail(id)), getCachedDaycareDetail(id)]).catch(() => notFound())` 패턴으로 detail을 병렬 prefetch + cache() dedup 처리 중
- `DaycareDetailView.tsx`는 client component, `useDaycareDetail(id)`로 detail을 읽고 `NaverBlogSection`을 `<ErrorBoundary>` + `<Suspense>`로 감싸는 기존 패턴 보유 — 이 패턴을 그대로 재사용
- `components/rankings/TypeBadge.tsx`는 `{ typeName: string }` prop만 받는 범용 컴포넌트로, `daycare` 도메인에 특화되어 있지 않음 → 신규 섹션에서 그대로 재사용 권장 (중복 구현 금지)
- API 레이어는 두 가지 에러 처리 패턴이 혼재: `fetchDaycares`/`fetchDaycareTypeNames` 등은 catch 후 `[]` 반환, `fetchDaycareDetail`/`fetchDaycareRanking*`는 throw. CLAUDE.md §4("에러 → throw")에 맞춰 신규 함수는 **throw 패턴을 따른다** (기존 catch-and-return 함수들은 이번 범위 밖이므로 수정하지 않음)

---

## 신규/수정 파일 목록

| 파일 | 종류 | 역할 |
|---|---|---|
| `domain/daycare/types/index.ts` | 수정 | `DaycareDetail`에 `sigunguCode: string` 필드 추가, `DaycareNearbyItem` 타입 신규 추가 |
| `domain/daycare/apis/daycare.api.ts` | 수정 | `DETAIL_COLUMNS`에 `sigungu_code` 추가, `fetchDaycareNearby` 함수 신규 추가 |
| `domain/daycare/parser/daycare.parser.ts` | 수정 | `toDaycareDetail`에 `sigunguCode` 매핑 추가, `toDaycareNearbyItem` 함수 + `DaycareNearbyRow` 타입 신규 추가 |
| `domain/daycare/query-keys/daycare.query-keys.ts` | 수정 | `DaycareNearbyParams` 타입, `nearby` 키 팩토리 추가 |
| `domain/daycare/query-options/daycare.query-options.ts` | 수정 | `nearby` queryOptions 추가 |
| `domain/daycare/hooks/daycare.hooks.ts` | 수정 | `useDaycareNearby` 훅 추가 |
| `domain/daycare/prefetch/daycare.prefetch.ts` | 수정 | `nearby` prefetcher 추가 |
| `domain/daycare/index.ts` | 수정 | `DaycareNearbyItem`, `DaycareNearbyParams`, `useDaycareNearby` export 추가 |
| `domain/daycare/server.ts` | 변경 없음 | `daycarePrefetch` 전체를 이미 re-export 중이므로 `nearby` 자동 포함 — 수정 불필요 |
| `components/daycare/detail/DaycareNearbySection.tsx` | 신규 | 실제 리스트 UI (client component, `useDaycareNearby` 사용, `<Link>` 렌더링) |
| `components/daycare/detail/DaycareNearbySectionSkeleton.tsx` | 신규 | Suspense fallback skeleton |
| `components/daycare/detail/DaycareNearbySectionError.tsx` | 신규 | ErrorBoundary fallback (NaverBlogSectionError와 동일 패턴) |
| `components/daycare/detail/DaycareDetailSSR.tsx` | 수정 | nearby prefetch 통합 (아래 "Prefetch 통합 방식" 참고) |
| `components/daycare/detail/DaycareDetailView.tsx` | 수정 | `DaycareNearbySection`을 `<ErrorBoundary>` + `<Suspense>`로 삽입 |

---

## 타입 정의

### `domain/daycare/types/index.ts`

```ts
// DaycareDetail에 필드 1개 추가 (sigunguName 필드 바로 아래 삽입 권장)
export type DaycareDetail = {
    id: string;
    name: string;
    address: string;
    phone: string;
    fax: string | null;
    typeName: string;
    sidoName: string | null;
    sigunguName: string | null;
    sigunguCode: string;   // ← 신규: 같은 지역 다른 어린이집 조회 기준
    status: string;
    // ...(이하 기존 필드 동일, 변경 없음)
};

// 신규 타입
export type DaycareNearbyItem = {
    id: string;
    name: string;
    typeName: string;
    address: string;
};
```

---

## API 함수 시그니처

### `domain/daycare/apis/daycare.api.ts`

```ts
// DETAIL_COLUMNS 문자열에 'sigungu_code' 추가 (sido_name 다음, sigungu_name 앞 또는 뒤 — 순서 무관)
const DETAIL_COLUMNS =
    'daycare_code, name, sido_name, sigungu_code, sigungu_name, type_name, status, ...'; // 기존 컬럼 유지

const NEARBY_COLUMNS = 'daycare_code, name, type_name, address';

/**
 * 같은 시군구(sigungu_code) 내 다른 정상 운영 어린이집 조회.
 * - 현재 상세페이지의 id는 제외
 * - status='정상'만 포함
 * - limit 필수 (기본 10)
 * - 필요한 컬럼만 select (daycare_code, name, type_name, address)
 */
export async function fetchDaycareNearby(
    sigunguCode: string,
    excludeId: string,
    options: { limit?: number } = {}
): Promise<DaycareNearbyItem[]> {
    const { limit = 10 } = options;
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(NEARBY_COLUMNS)
        .eq('sigungu_code', sigunguCode)
        .eq('status', '정상')
        .neq('daycare_code', excludeId)
        .limit(limit);

    if (error) {
        console.error('[fetchDaycareNearby]', error.message);
        throw new Error(error.message);
    }

    return (data ?? []).map((row) => toDaycareNearbyItem(row as DaycareNearbyRow));
}
```

- 파라미터: `sigunguCode: string`(필수, `DaycareDetail.sigunguCode`에서 전달), `excludeId: string`(현재 어린이집 id), `options.limit`(기본 10, 5~10 범위 내에서 호출부가 조정)
- 반환 타입: `Promise<DaycareNearbyItem[]>`
- select 컬럼: `daycare_code, name, type_name, address` (카드형 리스트에 필요한 최소 컬럼만 — CLAUDE.md §19 N+1/select 최소화 원칙 준수)
- 필터 조건: `sigungu_code = :sigunguCode`, `status = '정상'`, `daycare_code != :excludeId`
- `createSupabaseClient()`(파일 상단 기존 헬퍼, server/browser 겸용)를 그대로 사용 — client에서도 폴백 재조회 가능하도록 (Suspense 중 refetch·invalidate 대응)
- 에러 처리: throw (CLAUDE.md §4, 기존 `fetchDaycareDetail`/`fetchDaycareRanking*`와 동일 패턴) — React Query가 error state로 처리, DaycareDetailView 쪽에서 `<ErrorBoundary>`로 흡수

### `domain/daycare/parser/daycare.parser.ts`

```ts
export type DaycareNearbyRow = Pick<DaycareRow,
    | 'daycare_code'
    | 'name'
    | 'type_name'
    | 'address'
>;

export function toDaycareNearbyItem(row: DaycareNearbyRow): DaycareNearbyItem {
    return {
        id: row.daycare_code,
        name: row.name,
        typeName: row.type_name ?? '',
        address: row.address ?? '',
    };
}
```

`toDaycareDetail`에는 한 줄 추가:

```ts
sigunguCode: row.sigungu_code,
```

(`DaycareRow.sigungu_code`는 `lib/supabase/types.ts`상 `string`이며 not null — non-null assertion 불필요, 직접 할당 가능)

---

## queryKey / queryOptions 설계

### `domain/daycare/query-keys/daycare.query-keys.ts`

```ts
export type DaycareNearbyParams = {
    sigunguCode: string
    excludeId: string
    limit?: number
}

export const daycareQueryKeys = {
    // ...기존 키 유지
    nearby: (params: DaycareNearbyParams) =>
        [...daycareQueryKeys.all, 'nearby', params] as const,
}
```

### `domain/daycare/query-options/daycare.query-options.ts`

```ts
import { fetchDaycareNearby /* 기존 import에 추가 */ } from '../apis/daycare.api'

export const daycareQueryOptions = {
    // ...기존 옵션 유지
    nearby: (params: DaycareNearbyParams) => ({
        queryKey: daycareQueryKeys.nearby(params),
        queryFn: () => fetchDaycareNearby(params.sigunguCode, params.excludeId, { limit: params.limit ?? 10 }),
        // 정적에 가까운 데이터 — ranking* 쿼리와 동일하게 1시간 staleTime (CLAUDE.md §5: 일반 리스트는 global staleTime이 원칙이나,
        // 같은 어린이집 목록은 ranking*과 성격이 같은 준정적 리스트이므로 기존 ranking* 패턴을 그대로 따름)
        staleTime: 60 * 60 * 1000,
    }),
}
```

### `domain/daycare/hooks/daycare.hooks.ts`

```ts
export function useDaycareNearby(params: DaycareNearbyParams) {
    return useSuspenseQuery(daycareQueryOptions.nearby(params))
}
```

### `domain/daycare/prefetch/daycare.prefetch.ts`

```ts
export const daycarePrefetch = {
    // ...기존 프리페처 유지
    nearby(params: DaycareNearbyParams) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.nearby(params))
        }
    },
}
```

`DaycareRankingParams` import 옆에 `DaycareNearbyParams` import 추가 필요.

### `domain/daycare/index.ts`

```ts
export type { DaycareListItem, DaycareDetail, DaycareRankingItem, DaycareRecentItem, DaycareCapacityItem, DaycareNearbyItem, DaycareAgeFilter, MapBounds } from './types'
// ...
export type { DaycareRankingParams, DaycareNearbyParams } from './query-keys/daycare.query-keys'
// ...
export {
    useDaycaresInBounds,
    useDaycareDetail,
    useDaycareTypeNames,
    useDaycareServiceTypes,
    useDaycareRankingWaiting,
    useDaycareRankingCapacity,
    useDaycareRankingOldest,
    useDaycareRankingRecent,
    useDaycareNearby,
} from './hooks/daycare.hooks'
```

`server.ts`는 `export { daycarePrefetch } from './prefetch/daycare.prefetch'`로 객체 전체를 재노출하므로 `nearby` 키가 자동 포함됨 — **수정 불필요**.

---

## Prefetch 통합 방식 (`DaycareDetailSSR.tsx`)

현재 코드:

```ts
const [state, daycare] = await Promise.all([
    runPrefetch(daycarePrefetch.detail(id)),
    getCachedDaycareDetail(id),
]).catch(() => notFound());
```

**문제**: `nearby` prefetch는 `daycare.sigunguCode`(즉 `daycare` fetch 결과)에 의존하므로 위 `Promise.all`과 병렬로 묶을 수 없음. 또한 `nearby`는 페이지의 핵심 데이터가 아닌 보조 내부링크 섹션이므로, 이 쿼리가 실패했다고 해서 상세페이지 전체를 `notFound()` 처리하면 안 됨(기존 `.catch(() => notFound())`에 편입시키지 않는다).

**수정안**: 기존 Promise.all 블록은 그대로 유지하고, 그 직후에 `daycare.sigunguCode`를 사용해 `nearby`를 별도로 prefetch한 뒤 두 dehydrated state를 병합한다.

```ts
const [state, daycare] = await Promise.all([
    runPrefetch(daycarePrefetch.detail(id)),
    getCachedDaycareDetail(id),
]).catch(() => notFound());

// "같은 지역 다른 어린이집"은 보조 섹션 — 실패해도 페이지 전체를 404 처리하지 않음
const nearbyState = await runPrefetch(
    daycarePrefetch.nearby({ sigunguCode: daycare.sigunguCode, excludeId: id, limit: 10 })
).catch(() => null);

const hydrationState = nearbyState
    ? { queries: [...state.queries, ...nearbyState.queries], mutations: state.mutations }
    : state;
```

그리고 하단의 `<HydrationBoundary state={state}>`를 `<HydrationBoundary state={hydrationState}>`로 교체.

이유:
- `getQueryClient()`(`lib/react-query/query-client.ts`)는 서버에서 매 호출마다 새 `QueryClient`를 생성하므로, `runPrefetch`를 두 번 호출하면 서로 다른 dehydrated state가 나온다 → `HydrationBoundary`가 두 상태를 모두 인식하도록 `queries` 배열을 병합해 하나로 합친다.
- `nearby` 실패를 `.catch(() => null)`로 흡수해 핵심 상세 데이터 렌더링(및 `notFound()` 판정)에 영향을 주지 않는다. 이 경우 클라이언트에서 `DaycareNearbySection`이 prefetch 없이 `useSuspenseQuery`로 자체 fetch를 시도하며, 그마저 실패하면 `<ErrorBoundary>`가 흡수한다(SSR 크롤링 이점은 이 극히 드문 실패 케이스에서만 사라짐).

---

## UI 컴포넌트 구조

### 배치 위치 (`DaycareDetailView.tsx`)

`DaycareDetailContent`(기본정보·아동현황 등) 바로 다음, 기존 `NaverBlogSection` 앞에 삽입:

```tsx
<DaycareDetailContent daycare={detail} />

<ErrorBoundary fallback={<DaycareNearbySectionError />}>
    <Suspense fallback={<DaycareNearbySectionSkeleton />}>
        <DaycareNearbySection sigunguCode={detail.sigunguCode} excludeId={id} />
    </Suspense>
</ErrorBoundary>

<ErrorBoundary fallback={<NaverBlogSectionError />}>
    <Suspense fallback={<NaverBlogSectionSkeleton />}>
        <NaverBlogSection ... />
    </Suspense>
</ErrorBoundary>
```

기존 `NaverBlogSection`과 동일하게 `<ErrorBoundary>` + `<Suspense>` 2계층 구조(CLAUDE.md §11 컴포넌트 레벨 경계)를 그대로 재사용한다. `sigunguCode`, `excludeId`는 이미 `useDaycareDetail(id)`로 hydrate된 `detail` 객체와 `id` prop에서 바로 얻을 수 있으므로 추가 prop drilling이 없다.

### `DaycareNearbySection.tsx` (신규)

```tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useDaycareNearby } from '@/domain/daycare';
import TypeBadge from '@/components/rankings/TypeBadge';

type Props = {
    sigunguCode: string;
    excludeId: string;
};

export default function DaycareNearbySection({ sigunguCode, excludeId }: Props) {
    const { data: items } = useDaycareNearby({ sigunguCode, excludeId, limit: 10 });

    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3">
                같은 지역 다른 어린이집
            </p>

            {items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                    같은 지역에 등록된 다른 어린이집 정보가 없습니다.
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={`/daycare/${item.id}`}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all min-h-11"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="mb-0.5">
                                        <TypeBadge typeName={item.typeName} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400 truncate">
                                        {item.address}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="shrink-0 text-gray-300" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
```

체크리스트:
- 실제 `next/link` `<Link>` 사용 → SSR HTML에 `<a href="/daycare/{id}">` 그대로 출력되어 크롤링 가능 (요구사항 충족)
- mobile-first: 터치 타겟 `min-h-11`(44px) 확보, hover 클래스는 보조 신호일 뿐 `active:` 클래스로 탭 대안 제공 (CLAUDE.md §16)
- 빈 상태: 에러 아님 — "같은 지역에 다른 어린이집 정보가 없습니다" 안내 문구로 명시적 처리 (CLAUDE.md §12)
- `WaitingRankingList.tsx`와 동일한 카드형 리스트 톤(`rounded-xl border border-gray-100`, `TypeBadge` 재사용)을 따라 일관성 유지 — 단, rankings는 `target="_blank"`(외부 새 창)로 열지만, 상세페이지 내 "같은 지역 다른 어린이집"은 **동일 탭 이동**이 자연스러우므로 `target="_blank"` 미적용 (사용자가 상세→상세로 계속 탐색하는 흐름)

### `DaycareNearbySectionSkeleton.tsx` (신규)

```tsx
export default function DaycareNearbySectionSkeleton() {
    return (
        <section className="px-3 py-5 border-t-8 border-gray-100 animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200 mb-3" />
            <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <li
                        key={i}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 bg-white"
                    >
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="h-4 w-10 rounded bg-gray-100" />
                            <div className="h-4 w-3/5 rounded bg-gray-200" />
                            <div className="h-3 w-4/5 rounded bg-gray-100" />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
```

최종 렌더 카드와 높이/구조를 맞춰 CLS 방지(CLAUDE.md §12). `DetailSkeleton.tsx`/`RankingsSkeleton.tsx`의 `animate-pulse` + `bg-gray-100`/`bg-gray-200` 컨벤션과 동일하게 맞춤.

### `DaycareNearbySectionError.tsx` (신규)

```tsx
export default function DaycareNearbySectionError() {
    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3">
                같은 지역 다른 어린이집
            </p>
            <p className="text-sm text-gray-400">정보를 불러올 수 없습니다.</p>
        </section>
    );
}
```

`NaverBlogSectionError.tsx`와 동일 패턴.

---

## 검증 체크리스트 (domain-engineer / ui-engineer / qa-engineer 공통 참고)

- [ ] `DaycareDetail.sigunguCode` 추가 후 `DETAIL_COLUMNS`에 `sigungu_code`가 실제로 select 되는지 확인 (누락 시 parser에서 `undefined` 접근 런타임 에러)
- [ ] `fetchDaycareNearby`가 `limit()`을 반드시 호출하는지 (CLAUDE.md §19 목록 조회 limit 강제)
- [ ] `neq('daycare_code', excludeId)`로 현재 어린이집이 목록에서 제외되는지
- [ ] `useDaycareNearby`가 `useSuspenseQuery` 기반인지 (isLoading 분기 금지, CLAUDE.md §5)
- [ ] `DaycareNearbySection`이 `'use client'`이면서 `next/link`의 `<Link>`를 실제 `<a>`로 SSR 출력하는지(개발자도구 "페이지 소스 보기" 또는 `curl`로 확인 — hydration 전 HTML에 `href` 존재해야 크롤링 가능)
- [ ] `nearby` prefetch 실패가 상세페이지 전체를 `notFound()`로 만들지 않는지 (격리된 `.catch(() => null)` 확인)
- [ ] 빈 상태(같은 시군구에 다른 어린이집 0건)일 때 에러 UI가 아닌 안내 문구가 뜨는지
- [ ] 4공백 들여쓰기(CLAUDE.md §15), `any`/`!`/과도한 `as` 미사용(CLAUDE.md §14) 확인

---

## 이번 범위에 포함되지 않는 것

- `domain/daycare` 외 다른 도메인(`naver-blog`, `region` 등)의 구조 점검 — 미수행
- `components/rankings/*`, `components/daycare/detail/*` 외 컴포넌트 전수 점검 — 미수행
- 기존 API 함수들의 catch-and-return `[]` vs throw 패턴 불일치 정리 — 이번 범위 밖 (신규 함수만 throw 패턴 적용)
- `DaycareDetailSSR`의 기존 이중 fetch(`runPrefetch(daycarePrefetch.detail(id))`와 `getCachedDaycareDetail(id)`가 별도로 DB를 조회하는 구조) 최적화 — 기존부터 존재하던 이슈이며 이번 기능과 무관, 손대지 않음
- sitemap.xml 자체 개선, rankings 페이지의 TOP10 확장 — 이번 스펙은 상세페이지 내부링크 신설에 한정

## domain-engineer 전달 컨텍스트

`domain/daycare/`는 CLAUDE.md §3 구조를 이미 완전히 준수하는 상태이므로, 이번 작업은 기존 8개 파일에 "패턴을 그대로 복제"하는 추가 작업이다(신규 파일 없음, `server.ts` 제외 전 파일 수정). 참고할 기존 패턴은 `rankingWaiting`류(타입·query-key·query-options·hooks·prefetch 4종 세트 + `RankingParams` 타입)이며, `nearby`도 동일한 파라미터 객체 방식(`DaycareNearbyParams`)을 따른다. 주의할 유일한 포인트는 `DaycareDetail.sigunguCode` 필드 추가 시 `DETAIL_COLUMNS` select 문자열과 `toDaycareDetail` 매핑을 함께 업데이트해야 런타임 누락이 없다는 것.

## ui-engineer 전달 컨텍스트

`components/daycare/detail/`는 이미 `NaverBlogSection` + `NaverBlogSectionSkeleton` + `NaverBlogSectionError`의 3파일 세트로 "ErrorBoundary + Suspense" 패턴이 확립되어 있으므로, `DaycareNearbySection`도 동일한 3파일 세트로 구현한다. 리스트 아이템의 시각적 톤은 `components/rankings/WaitingRankingList.tsx`(카드형, `rounded-xl border border-gray-100`, `TypeBadge` 배지)를 그대로 참고하되, `target="_blank"` 없이 동일 탭 이동으로 구현한다(상세→상세 내부 탐색 흐름이므로). `DaycareDetailSSR.tsx`의 prefetch 병합 로직(`nearbyState` catch(null) + `queries` 배열 병합)은 도메인 엔지니어가 아닌 UI 엔지니어(SSR 컴포넌트 담당) 쪽에서 구현하는 것이 자연스럽다 — `runPrefetch`/`HydrationBoundary` 조합은 컴포넌트 레이어(`components/daycare/detail/DaycareDetailSSR.tsx`) 소관이기 때문.
