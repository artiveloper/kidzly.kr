# QA 검증 보고서

## 요약

검증 일시: 2026-07-02
통과: 34 | 실패: 3 | 갭: 6
**상태**: 🟡 일부 수정 필요

---

## 검증 축별 매트릭스

| 검증 항목 | 결과 | 주요 이슈 |
|----------|------|----------|
| 도메인 구조 | ⚠️ | server.ts에 prefetch 외 API 함수 3개 잔존 |
| React Query 패턴 | ✅ | 전체 패턴 준수 |
| API↔Hook 타입 교차 | ❌ | row as DaycareRow 단언 4개 잔존 |
| Prefetch 정합성 | ✅ | queryKey 완전 일치 확인 |
| Server/Client 경계 | ⚠️ | loading.tsx 없음, Suspense fallback 누락 |
| Supabase 쿼리 품질 | ❌ | row as DaycareRow 단언(Axis 3 연동) |
| TypeScript·코드 품질 | ✅ | any/! 없음, 4-space 전환 완료 |

---

## 실패 시나리오 상세

| # | 파일 | 문제 | 심각도 | 수정 방향 |
|---|------|------|--------|----------|
| 1 | `domain/daycare/apis/daycare.api.ts` L193 | `row as DaycareRow` 타입 단언 — RANKING_COLUMNS 부분 select 결과를 전체 Row 타입으로 단언. 런타임에 undefined 필드 접근 가능 | P0 | `fetchDaycareRankingWaiting/Capacity/Oldest/Recent` 반환 타입에 맞는 부분 타입 선언 (`Pick<DaycareRow, keyof typeof RANKING_COLUMNS>`) 또는 parser 시그니처 수정 |
| 2 | `domain/daycare/apis/daycare.api.ts` L216 | 동일: `fetchDaycareRankingRecent`에서 `row as DaycareRow` | P0 | 위 동일 |
| 3 | `domain/daycare/apis/daycare.api.ts` L239 | 동일: `fetchDaycareRankingOldest`에서 `row as DaycareRow` | P0 | 위 동일 |
| 4 | `domain/daycare/apis/daycare.api.ts` L263 | 동일: `fetchDaycareRankingCapacity`에서 `row as DaycareRow` | P0 | 위 동일 |
| 5 | `domain/daycare/server.ts` L5, L8 | `fetchDaycareIdsPaginated`, `fetchDaycareDetail`, `fetchDaycareCount` export — 스펙 §3: server.ts는 prefetch만 re-export | P1 | `lib/sitemap-helpers.ts`로 `fetchDaycareIdsPaginated` 이동, `DaycareDetailSSR`를 `daycareQueryOptions.detail(id).queryFn + cache()` 패턴으로 전환 후 server.ts 정리 |
| 6 | `domain/naver-blog/query-options/naver-blog.query-options.ts` | `export {}` 만 있는 빈 파일 — 혼란 유발 (P2) | P2 | 파일 삭제 또는 주석으로 이유 명기 |

---

## AAA 기반 핵심 시나리오 검증

### S-01: Prefetch queryKey ↔ Hook queryKey 일치 (rankingWaiting)

**Arrange**: `rankings/page.tsx`에서 `daycarePrefetch.rankingWaiting({ sido: validSido })` 호출  
**Act**: `RankingsContent.tsx`에서 `useDaycareRankingWaiting({ sido })` 호출 (sido = validSido)  
**Assert**: 양쪽 모두 `daycareQueryOptions.rankingWaiting(params)`를 거쳐 `daycareQueryKeys.rankingWaiting(params)` 생성 → `['daycare', 'ranking', 'waiting', { sido: validSido }]` 동일 ✅

경계값: `validSido = undefined` 시 양쪽 `{ sido: undefined }` 전달 → 동일 키 ✅

### S-02: server-only 경계 (rankings page)

**Arrange**: `app/rankings/page.tsx` — Server Component (async, no 'use client')  
**Act**: `@/domain/daycare/server` import  
**Assert**: `server.ts` L1: `import 'server-only'` ✅, Client에서 import 불가 ✅  
`RankingsContent.tsx`는 `@/domain/daycare` (index.ts) entry만 사용 ✅

### S-03: row as DaycareRow 타입 안전성 위험

**Arrange**: `fetchDaycareRankingWaiting`가 `RANKING_COLUMNS`로 부분 select (certified_date, waiting_child_total 등 14개 컬럼만)  
**Act**: `.map((row, i) => toDaycareRankingItem(row as DaycareRow, i + 1))`  
**Assert**: `DaycareRow`는 80+ 컬럼을 가진 전체 Row 타입. 파서 `toDaycareRankingItem`이 `row.sido_name`, `row.sigungu_name`, `row.waiting_child_total` 등을 접근 — 이들은 RANKING_COLUMNS에 포함되어 런타임 오류는 없으나 TypeScript 단언이 타입 시스템 보호를 우회 ❌ (P0)

### S-04: useSuspenseQuery 컴포넌트가 Suspense 안에 위치

**Arrange**: `RankingsContent.tsx` — `useSuspenseQuery × 3`  
**Act**: `rankings/page.tsx` L177: `<Suspense fallback={<div className="animate-pulse...">}>` 내부에 `<RankingsContent />` 배치  
**Assert**: Suspense 경계 있음 ✅, `HydrationBoundary` 바깥에 Suspense 있음 ✅ (올바른 순서)

### S-05: DaycareDetailView useSuspenseQuery Suspense 경계

**Arrange**: `DaycareDetailView.tsx` — `useDaycareDetail(id)` (`useSuspenseQuery`)  
**Act**: `app/daycare/[id]/page.tsx` L57: `<Suspense fallback={<DaycareDetailLoading />}>`로 `<DaycareDetailSSR id={id} />` 감싸기  
**Assert**: Suspense 경계 올바름 ✅, skeleton fallback 제공 ✅

---

## 통과 항목

**도메인 구조:**
- daycare 전체 필수 파일 존재 (types/, apis/, parser/, query-keys/, query-options/, hooks/, index.ts, server.ts, prefetch/) ✅
- `parsers/` (복수형 금지) 디렉토리 완전 제거 ✅
- `parser/daycare.filter-parsers.ts` 및 `parser/daycare.parser.ts` 단수형 위치 ✅
- naver-blog 전체 파일 존재, server.ts 없음 (prefetch 없는 도메인) ✅
- 모든 Client Component가 `@/domain/daycare` (index.ts) entry만 사용 ✅
- 서버 라우트(`rankings/page.tsx`, `app/page.tsx`, `sitemap.ts`)가 `@/domain/daycare/server` entry 사용 ✅
- deep import 없음 (`@/domain/daycare/hooks/...` 패턴 미검출) ✅
- `export *` 없음 ✅
- `fetchSigungus` index.ts에서 제거 완료 (P0-2 ✅)
- ranking API 함수 4개 server.ts에서 제거 완료 ✅

**React Query 패턴:**
- 모든 queryKey 팩토리 함수 사용 (inline string 없음) ✅
- `useEffect` 내 fetch 없음 (DaycareMap의 useEffect는 지도 pan/scroll 목적) ✅
- `router.refresh()` 데이터 갱신 목적 사용 없음 ✅
- `useQuery + suspense: true` v5 제거 패턴 없음 ✅
- URL 상태를 `useState`로 관리하는 패턴 없음 ✅
- `useDaycareTypeNames`, `useDaycareServiceTypes` → `useSuspenseQuery` 전환 완료 (P1-2 ✅)
- 신규 ranking hooks 4개 모두 `useSuspenseQuery` 사용 ✅
- ranking queryOptions 4개 모두 `queryKey + queryFn` 포함 ✅

**API↔Hook 타입:**
- Supabase Row → parser → 도메인 타입 변환 경로 정상 (`daycare.parser.ts` 경유) ✅
- UI에서 DB Row 타입 직접 사용 없음 (모두 파서 통과) ✅
- hooks 반환 타입과 queryFn 반환 타입 일치 ✅

**Prefetch 정합성:**
- `daycare.prefetch.ts` L1: `import 'server-only'` ✅
- `daycare.server.ts` L1: `import 'server-only'` ✅
- ranking 4종 prefetch 모두 `daycareQueryOptions.*` 재사용 → prefetch↔hook queryKey 동일 보장 ✅
- `runPrefetch` 사용, page에서 QueryClient 직접 다루지 않음 ✅

**Server/Client 경계:**
- `RankingsContent.tsx`: `'use client'` 선언 ✅, `<Suspense>` 경계 내 위치 ✅
- `DaycareDetailView.tsx`: `'use client'` 선언 ✅, `<Suspense fallback>` 경계 내 위치 ✅
- `DaycareDetailSSR.tsx`: Server Component (async, 'use client' 없음) ✅
- `daycarePrefetch`, `fetchDaycareDetail` import는 server.ts entry 사용 ✅
- Server Component에서 Client-only hook 사용 없음 ✅

**Supabase 쿼리 품질:**
- `lib/supabase/server.ts` non-null assertion 제거, `if (!url || !key) throw` 패턴 적용 ✅
- 랭킹 함수: `if (error) throw new Error(error.message)` 패턴 ✅
- fetchDaycareDetail: error throw 패턴 ✅
- `limit()` 사용: `fetchDaycaresInBounds`, `fetchDaycareRankingWaiting/Capacity/Oldest/Recent`, `fetchDaycareIdsPaginated` 모두 ✅
- N+1 쿼리 없음 ✅
- `lib/supabase/types.ts`에 `daycare_type_names`, `daycare_service_types` 뷰 타입 추가 → `as never` 단언 제거 ✅

**TypeScript·코드 품질:**
- `any` 타입 미검출 ✅
- `!` non-null assertion 미검출 ✅
- 4-space 들여쓰기: `app/layout.tsx`, `DaycareDetailContent.tsx`, `DaycareDetailView.tsx`, `lib/supabase/server.ts`, `lib/supabase/types.ts` 모두 확인 ✅
- `formatDate` / `formatDateTime`: `DaycareDetailView.tsx`, `DaycareDetailContent.tsx`, `DaycareDetailSSR.tsx` 모두 `lib/format.ts` 사용 ✅
- `<img>` 태그 미검출 (`next/image` 사용) ✅
- hover + active 병용 패턴 (`hover:bg-* active:bg-*`) ✅

---

## 갭 항목 (P2 — 재검증 불필요)

| # | 항목 | 설명 |
|---|------|------|
| G-1 | `naver-blog/query-options/naver-blog.query-options.ts` | `export {}` 만 있는 빈 파일 (P2) |
| G-2 | `domain/region/index.ts` | lib/ 유틸리티로 이동 권장 (P2) |
| G-3 | `app/page.tsx` L21 | `<Suspense>` fallback 없음 (P2) |
| G-4 | `loading.tsx` 없음 | `/rankings`, `/daycare/[id]` 라우트 loading.tsx 없음 (P2) |
| G-5 | `DaycareDetailContent.tsx` L1 | 불필요한 `'use client'` — 부모가 이미 client (P2) |
| G-6 | `fetchDaycareTypeNames/ServiceTypes` | error 시 `return []` (throw 미사용) — 필터 UX 의도적 결정 |

---

## 재검증 요청

**P0 실패(4건)** — domain-engineer 재호출 필요:

`domain/daycare/apis/daycare.api.ts` 의 ranking API 함수 4개에서 `row as DaycareRow` 타입 단언이 해소되지 않았습니다.

```
fetchDaycareRankingWaiting  L193: (data ?? []).map((row, i) => toDaycareRankingItem(row as DaycareRow, i + 1))
fetchDaycareRankingRecent   L216: (data ?? []).map((row, i) => toDaycareRecentItem(row as DaycareRow, i + 1))
fetchDaycareRankingOldest   L239: (data ?? []).map((row, i) => toDaycareRecentItem(row as DaycareRow, i + 1))
fetchDaycareRankingCapacity L263: (data ?? []).map((row, i) => toDaycareCapacityItem(row as DaycareRow, i + 1))
```

수정 방향: RANKING_COLUMNS에 포함된 컬럼만을 포함하는 부분 타입을 `lib/supabase/types.ts`에 추가하거나, parser 함수 시그니처를 partial row 타입으로 변경.

**P1 실패(1건)** — domain-engineer 재호출 필요:

`domain/daycare/server.ts`가 `fetchDaycareIdsPaginated`, `fetchDaycareDetail`, `fetchDaycareCount`를 여전히 export함. 스펙 §3: server.ts는 prefetch만 re-export.

수정 방향:
1. `fetchDaycareIdsPaginated` → `lib/sitemap-helpers.ts`로 이동, `app/sitemap.ts` import 경로 변경
2. `fetchDaycareDetail` → `DaycareDetailSSR.tsx`에서 `daycareQueryOptions.detail(id).queryFn`을 `cache()`로 감싸 대체
3. `fetchDaycareCount` → 사용처 확인 후 제거 또는 lib/ 이동
