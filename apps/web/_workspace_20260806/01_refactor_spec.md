# 리팩토링 명세

생성일: 2026-07-01
기준 스펙: CLAUDE.md §3 ~ §18

---

## 요약

- 분석 도메인: daycare, naver-blog, region
- 분석 파일 범위: domain/ 전체, app/ 전체, components/ 주요 파일, lib/ 전체
- 발견된 위반 수: P0 4개, P1 9개, P2 6개

---

## 도메인별 작업 목록

### domain/daycare

- [ ] [P0] `parsers/` (복수) 디렉토리 폐기 — `domain/daycare/parsers/daycare.filter-parsers.ts`를 `domain/daycare/parser/daycare.filter-parsers.ts`로 이동 (§3: `parsers/` 금지, `parser/` 단수 필수)
- [ ] [P0] `domain/daycare/index.ts` line 10 — `export { fetchSigungus } from './apis/daycare.api'` 제거. API 레이어는 외부 노출 금지(§3.2). `fetchSigungus`는 내부 사용 전용 — 호출처(sitemap.ts) 분석 결과 sitemap에서는 `server.ts` 경유가 맞음 (아래 server.ts 항목 참고)
- [ ] [P0] `domain/daycare/index.ts` line 11 — `export { daycareFilterParsers } from './parsers/daycare.filter-parsers'` → 이동 후 경로 `'./parser/daycare.filter-parsers'`로 수정
- [ ] [P0] `domain/daycare/apis/daycare.api.ts` — `as` 타입 단언 다수 존재 (§15 금지): `row as DaycareRow`, `result.data as Array<{ type_name: string }>`, `result.data as []`, `supabase.from('daycare_type_names' as never)` 등 — 명시적 타입 가드 또는 Supabase 타입 확장으로 대체
- [ ] [P1] `domain/daycare/server.ts` — prefetch 외 API 함수 재노출 위반 (§3.3: `server.ts`는 prefetch만 export). `fetchDaycareDetail`, `fetchDaycareCount`, `fetchDaycareIdsPaginated`, `fetchDaycareRankingWaiting`, `fetchDaycareRankingRecent`, `fetchDaycareRankingCapacity`, `fetchDaycareRankingOldest` 7개 함수 — 사용처(sitemap.ts, DaycareDetailSSR, rankings/page.tsx) 파악 후 설계 결정 필요 (아래 app/ 항목과 연계)
- [ ] [P1] `domain/daycare/hooks/daycare.hooks.ts` lines 18~23 — `useDaycareTypeNames()`와 `useDaycareServiceTypes()`가 `useQuery` 사용. 두 쿼리 모두 `staleTime: Infinity`이고 home page에서 prefetch됨 → `useSuspenseQuery`로 변경 필수 (§5.2). 해당 훅 사용처(DaycareFilters)는 이미 Suspense 경계 안에 있음

### domain/naver-blog

- ✅ 구조 준수: types/, apis/, parser/, query-keys/, hooks/, index.ts 모두 존재
- ✅ server.ts 없음 (prefetch 없는 도메인 — 정상)
- ✅ `useSuspenseInfiniteQuery` 사용 + queryKey 팩토리 사용
- ✅ infinite query를 hooks에 직접 정의 (§5.2 예외 규칙 준수)
- [P2] `domain/naver-blog/query-options/naver-blog.query-options.ts` — `export {}` 만 있는 빈 파일. 혼란을 줄 수 있으므로 삭제하거나 주석으로 명확히 표시. 현재 주석은 있으나 `export {}` 구문이 불필요

### domain/region

- [P2] `domain/region/index.ts` — 타입, API, 파서, 훅 없는 상수·유틸리티 전용 모듈. 도메인 구조를 갖추지 않음. `lib/region.ts`로 이동하고 `domain/region/` 디렉토리 제거 권장 (§3: 도메인 = 데이터 책임 단위). 현재 사용처: `app/sitemap.ts`, `app/rankings/page.tsx`, `components/rankings/SidoFilter.tsx`

---

## 앱 라우트별 작업 목록

### app/rankings/page.tsx

- [ ] [P1] React Query 완전 우회 — `fetchDaycareRankingWaiting`, `fetchDaycareRankingCapacity`, `fetchDaycareRankingOldest`를 직접 호출하고 props로 전달. §2 "Server data state는 ONLY React Query" 위반, §6 "List pages: MUST Prefetch" 위반
  - 수정 방향: `daycareQueryOptions.rankingWaiting()`, `.rankingCapacity()`, `.rankingOldest()` 추가 → `daycarePrefetch.rankingWaiting()`, `.rankingCapacity()`, `.rankingOldest()` 추가 → `runPrefetch(...)` + `HydrationBoundary` 패턴으로 교체
  - `WaitingRankingList`, `CapacityRankingList`, `RecentRankingList`를 `'use client'` + `useSuspenseQuery` 컴포넌트로 전환 또는 props 수신 Server Component로 유지 (후자는 nuqs sido 필터 변경 시 RSC re-render에 의존)
  - `sido` 파라미터가 URL searchParam이므로 `nuqs`로 관리 → 쿼리 옵션에 sido 포함 필요
- [ ] [P1] `SidoFilter.tsx`가 Server Component로 Link 기반 네비게이션 사용 — React Query 도입 시 `useQueryState`('sido', ...) 클라이언트 패턴으로 전환 검토 필요

### app/page.tsx

- [ ] [P2] `<Suspense>` fallback 없음 (line 21) — `<DaycareMap />`의 내부 Suspense들은 fallback이 있으나 최상위 Suspense는 없음. §11 skeleton 규칙. 빈 Suspense는 null fallback이므로 깜빡임 발생 가능

### app/daycare/[id]/page.tsx

- ✅ DaycareDetailSSR를 통한 prefetch + HydrationBoundary 패턴 준수
- ✅ server entry point(`@/domain/daycare/server`) 사용

### app/sitemap.ts

- ✅ `@/domain/daycare/server` 경유 import (서버 전용 API 함수 사용)
- 참고: `fetchDaycareIdsPaginated`를 sitemap에서 직접 사용하는 것은 Next.js sitemap 특성상 React Query를 사용할 수 없어 불가피함. 현재 `server.ts` 경유가 최선. server.ts 정리 후에도 이 경로는 유지

---

## lib/ 작업 목록

### lib/supabase/server.ts

- [ ] [P0] non-null assertion(`!`) 2개 (§15 금지)
  ```ts
  // 현재 (위반)
  process.env.NEXT_PUBLIC_SUPABASE_URL!
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  // 수정
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase env vars are not set')
  return createClient<Database>(url, key)
  ```
- [ ] [P1] 2-space 들여쓰기 (§16 — 4 space 필수)

### lib/supabase/types.ts

- [ ] [P1] 2-space 들여쓰기 (§16 — 4 space 필수)

### lib/supabase/client.ts

- ✅ 4-space 들여쓰기
- ✅ non-null assertion 없음 (if (!url || !key) throw 패턴 사용)

### lib/react-query/prefetch.ts, query-client.ts

- ✅ 구조 준수
- ✅ `import 'server-only'` 선언 (prefetch.ts)
- ✅ 4-space 들여쓰기

---

## components/ 작업 목록

### components/daycare/detail/DaycareDetailContent.tsx

- [ ] [P1] 2-space JSX 들여쓰기 (§16) — line 100 이하 JSX 블록이 2-space 단위로 중첩됨. 4-space로 교체
- [ ] [P2] 불필요한 `'use client'` 지시어 — 부모 `DaycareDetailView`가 이미 'use client'. 이 컴포넌트는 hooks/state 없는 순수 렌더링 컴포넌트. 지시어 제거 시 불필요한 클라이언트 번들 표시 방지

### components/daycare/detail/DaycareDetailView.tsx

- [ ] [P1] 2-space JSX 들여쓰기 (§16) — line 66 이하 JSX 블록이 2-space 단위. 4-space로 교체
- ✅ `useSuspenseQuery`(`useDaycareDetail`) 사용 + 올바른 Suspense 경계(호출처에 `<Suspense fallback>`)
- ✅ `'use client'` 지시어 적절

### components/daycare/detail/DaycareDetailSSR.tsx

- ✅ Server Component (async function, no 'use client')
- ✅ `import 'server-only'` 경로의 server entry 사용
- ✅ `runPrefetch` + `HydrationBoundary` 패턴

### components/daycare/detail/DaycareDetailModal.tsx

- ✅ 'use client' 적절
- ✅ Suspense 경계 있음

### components/daycare/common/DaycareMap.tsx

- ✅ useEffect가 데이터 페칭 목적이 아님 (지도 pan, 스크롤 복원, viewport 스크롤 리셋)
- ✅ `useQuery` + `keepPreviousData` 사용 (`useSuspenseQuery` 예외 — bounds 변경마다 refetch가 빈번하고 `isFetching`으로 UI 제어)
- ✅ nuqs로 URL 상태 관리 (`useQueryState`)

### components/daycare/list/filters/DaycareFilters.tsx

- ✅ `useQuery` 사용 (현재), `data: typeNames = []` default 패턴
- 참고: `useDaycareTypeNames`, `useDaycareServiceTypes`가 `useSuspenseQuery`로 변경되면 이 컴포넌트는 자동으로 Suspense 경계에 의존 — 이미 DaycareMap의 `<Suspense>` 안에 있으므로 별도 작업 불필요

### components/providers/ReactQueryProvider.tsx

- ✅ 'use client' 적절
- ✅ `HydrationBoundary` re-export로 단일 import 가능

### app/layout.tsx

- [ ] [P1] 2-space 들여쓰기 전체 파일 (§16)

---

## 작업 우선순위

**P0: 즉시 수정 (구조적 위반, TypeScript 규칙 위반)**
- `parsers/` 복수 디렉토리 → `parser/`로 이동
- `index.ts`에서 API 함수 노출 제거
- `lib/supabase/server.ts` non-null assertion 제거
- `daycare.api.ts` `as` 타입 단언 제거

**P1: 리팩토링 필수 (패턴 위반, 포맷 위반)**
- `rankings/page.tsx` React Query 도입 (도메인 queryOptions + prefetch + HydrationBoundary)
- `server.ts` API 함수 re-export 범위 재설계
- `useDaycareTypeNames`, `useDaycareServiceTypes` → `useSuspenseQuery` 전환
- `lib/supabase/server.ts`, `lib/supabase/types.ts`, `app/layout.tsx` 4-space 포맷 정리
- `DaycareDetailContent.tsx`, `DaycareDetailView.tsx` JSX 4-space 포맷 정리

**P2: 개선 권장 (코드 품질)**
- `app/page.tsx` `<Suspense>` fallback 추가
- `DaycareDetailContent.tsx` 불필요한 `'use client'` 제거
- `domain/region/` → `lib/region.ts` 이동
- `domain/naver-blog/query-options/naver-blog.query-options.ts` 빈 파일 정리

---

## server.ts 재설계 방향 (P1 연계 설계 결정)

현재 `server.ts`는 prefetch 외에 7개 API 함수를 노출 중. 이는 두 가지 사용 패턴 때문:

1. **sitemap.ts** — `fetchDaycareIdsPaginated` (React Query 사용 불가 환경)
2. **rankings/page.tsx** — ranking API 함수 3개 (React Query 우회)
3. **DaycareDetailSSR.tsx** — `fetchDaycareDetail` (React Query 외부에서 metadata용 cache fetch)

**권장 설계:**
- `server.ts`: prefetch만 export (스펙 준수)
- sitemap.ts: `@/domain/daycare/apis/daycare.api` 직접 deep import 또는 `lib/` 래퍼 함수 생성
  - 단, deep import 금지(§3.4)이므로 `lib/sitemap-helpers.ts` 등에 래핑 권장
- rankings page: React Query 패턴으로 전환 (P1 항목 수행 시 자연 해소)
- DaycareDetailSSR의 `fetchDaycareDetail`: `daycareQueryOptions.detail(id)` queryFn을 직접 실행 → `cache()`로 dedup

---

## domain-engineer 전달 컨텍스트

**현재 상태 요약:**

daycare 도메인은 전반적으로 스펙에 근접하나 3개 구조 위반이 있음.

1. **parsers/ 디렉토리** (`domain/daycare/parsers/daycare.filter-parsers.ts`) — nuqs URL 파서가 금지된 복수 디렉토리에 위치. `parser/daycare.filter-parsers.ts`로 이동 후 index.ts 경로 수정.

2. **index.ts API 노출** — `fetchSigungus`가 client-safe entry point에서 노출됨. 제거 후 해당 함수 사용처 검토.

3. **server.ts 범위 초과** — prefetch 외 7개 API 함수 노출. P1 ranking 리팩토링 시 점진적 정리.

4. **daycare.api.ts 타입 단언** — `row as DaycareRow` 등 다수. Supabase `.select()` 반환 타입이 `never`로 추론되는 경우 Database 타입에 해당 뷰/테이블 추가하거나 명시적 타입 가드 작성.

5. **useDaycareTypeNames/ServiceTypes** — `useQuery` → `useSuspenseQuery` 변경. 시그니처는 동일, 반환 타입에서 `isLoading`/`isError` 사용 불가 (호출처에서 이미 default 값만 사용 중이라 파급 없음).

6. **ranking 도메인 확장** — `daycareQueryKeys.rankingWaiting(sido?)`, `daycareQueryOptions.rankingWaiting(sido?)`, `daycarePrefetch.rankingWaiting(sido?)` 추가 필요. sido 파라미터는 optional string.

naver-blog 도메인은 위반 없음. region은 도메인이 아닌 lib 유틸리티로 분류 변경 권장.

---

## ui-engineer 전달 컨텍스트

**현재 상태 요약:**

컴포넌트 레이어의 주요 이슈는 포맷과 Server/Client 경계 정리.

1. **2-space 들여쓰기 파일** — 즉시 수정 필요:
   - `apps/web/app/layout.tsx` (전체)
   - `apps/web/lib/supabase/server.ts` (전체)
   - `apps/web/lib/supabase/types.ts` (전체)
   - `apps/web/components/daycare/detail/DaycareDetailContent.tsx` (JSX 블록)
   - `apps/web/components/daycare/detail/DaycareDetailView.tsx` (JSX 블록)

2. **rankings 컴포넌트 전환** — domain-engineer가 React Query 옵션을 추가하면:
   - `WaitingRankingList`, `CapacityRankingList`, `RecentRankingList`를 `useSuspenseQuery` 기반 클라이언트 컴포넌트로 전환 또는 props 수신 유지 결정 필요
   - `SidoFilter`는 Link 기반 → `useQueryState('sido', ...)` 클라이언트 패턴으로 전환 검토
   - `rankings/page.tsx`에 `runPrefetch` + `HydrationBoundary` 추가

3. **불필요한 'use client'** — `DaycareDetailContent.tsx`의 `'use client'` 제거 (부모가 이미 client component)

4. **Suspense fallback** — `app/page.tsx`의 최상위 `<Suspense>`에 `fallback` prop 추가 (빈 스켈레톤 또는 `<DaycareMapLoading />`)

5. **Server/Client 경계 현황** (정상 상태):
   - `DaycareMap`, `DaycareDetailView`, `DaycareDetailModal`, `DaycareFilters`, `DaycareList` — 모두 'use client' ✅
   - `DaycareDetailSSR`, `SidoFilter`, `rankings/page.tsx` — Server Component ✅
   - `RankingToast` — 'use client' (sessionStorage 접근, useEffect 사용) ✅

6. **Mobile-first 현황** (대부분 준수):
   - hover와 active 함께 사용 ✅ (hover:bg-* active:bg-* 패턴)
   - 반응형 클래스 `sm:`, `md:` 사용 ✅
   - 잠재적 터치 타겟 미달: NaverBlogSection "더보기" 버튼 (`py-2` = ~30px), ListPanel X 버튼 (14px 아이콘, 패딩 없음) — P2
