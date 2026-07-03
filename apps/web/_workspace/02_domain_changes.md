# 도메인 변경사항 요약

생성일: 2026-07-01
담당: domain-engineer
기준: 01_refactor_spec.md P0·P1 항목

---

## 완료된 작업

### P0-1 — parsers/ → parser/ 디렉토리 통합 ✅

- **생성**: `domain/daycare/parser/daycare.filter-parsers.ts` (실제 구현체)
- **변경**: `domain/daycare/parsers/daycare.filter-parsers.ts` → `parser/daycare.filter-parsers`로의 re-export 래퍼로 교체 (기존 deep import 안전 처리)
- **변경**: `domain/daycare/index.ts` — import 경로 `'./parsers/...'` → `'./parser/...'`로 수정

### P0-2 — index.ts fetchSigungus export 제거 ✅

- **변경**: `domain/daycare/index.ts` — `export { fetchSigungus }` 라인 삭제
- 파급: `fetchSigungus`는 어떤 외부 소비자도 `@/domain/daycare`를 통해 import하지 않음 (검증 완료)

### P0-3 — lib/supabase/server.ts non-null assertion 제거 ✅

- **변경**: `lib/supabase/server.ts`
  - `process.env.NEXT_PUBLIC_SUPABASE_URL!` → 명시적 null 체크 + throw
  - `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!` → 동일 처리
  - 2-space → 4-space 들여쓰기 동시 수정 (P1 포맷 위반 병행 해소)

### P0-4 — daycare.api.ts as 타입 단언 제거 ✅

- **변경**: `lib/supabase/types.ts`
  - `daycare_type_names` 뷰 타입 추가 (`Row: { type_name: string }`)
  - `daycare_service_types` 뷰 타입 추가 (`Row: { service_name: string }`)
  - 2-space → 4-space 들여쓰기 동시 수정 (P1 포맷 위반 병행 해소)
- **변경**: `domain/daycare/apis/daycare.api.ts`
  - `supabase.from('daycare_type_names' as never)` → `as never` 제거 (타입 추가로 해소)
  - `result.data as Array<{ type_name: string }>` → 타입 추론으로 대체
  - `supabase.from('daycare_service_types' as never)` → 동일 처리
  - `result.data as Array<{ service_name: string }>` → 타입 추론으로 대체
  - `(data ?? []) as Pick<DaycareRow, ...>[]` → 불필요한 단언 제거 (fetchDaycareIdsPaginated)
  - 랭킹 함수 4개: `createServerClient()` → `createSupabaseClient()` 전환 (클라이언트/서버 양쪽 동작 보장)
  - 남은 `row as DaycareRow` 패턴: `// TODO: 타입 정합성 확인 필요` 주석 추가 (파서 시그니처 변경은 별도 리팩토링 필요)

### P1-1 — rankings용 queryOptions, prefetch, hooks 추가 ✅

- **변경**: `domain/daycare/query-keys/daycare.query-keys.ts`
  - `DaycareRankingParams` 타입 추가 (`{ limit?: number; sido?: string }`)
  - `rankingWaiting`, `rankingCapacity`, `rankingOldest`, `rankingRecent` 키 팩토리 추가

- **변경**: `domain/daycare/query-options/daycare.query-options.ts`
  - `rankingWaiting`, `rankingCapacity`, `rankingOldest`, `rankingRecent` queryOptions 추가
  - `staleTime: 60 * 60 * 1000` (랭킹 데이터 1시간 캐시)

- **변경**: `domain/daycare/prefetch/daycare.prefetch.ts`
  - `rankingWaiting`, `rankingCapacity`, `rankingOldest`, `rankingRecent` prefetch 추가
  - queryOptions 재사용 → prefetch↔hook queryKey 일치 보장

- **변경**: `domain/daycare/hooks/daycare.hooks.ts`
  - `useDaycareRankingWaiting`, `useDaycareRankingCapacity`, `useDaycareRankingOldest`, `useDaycareRankingRecent` hooks 추가

- **변경**: `domain/daycare/server.ts`
  - 랭킹 API 함수 4개 (`fetchDaycareRankingWaiting/Capacity/Oldest/Recent`) export 제거
  - `daycarePrefetch` 유지, `fetchDaycareIdsPaginated`·`fetchDaycareDetail`·`fetchDaycareCount` 임시 유지 (sitemap/DaycareDetailSSR 마이그레이션 전)

- **변경**: `domain/daycare/index.ts`
  - ranking hooks 4개 추가 export
  - `DaycareRankingParams` 타입 추가 export

### P1-2 — useDaycareTypeNames/ServiceTypes → useSuspenseQuery 전환 ✅

- **변경**: `domain/daycare/hooks/daycare.hooks.ts`
  - `useDaycareTypeNames`: `useQuery` → `useSuspenseQuery`
  - `useDaycareServiceTypes`: `useQuery` → `useSuspenseQuery`
  - 호출처(`DaycareFilters.tsx`)는 이미 `<Suspense>` 경계 내에 위치하므로 파급 없음

---

## 변경 파일 목록

| 파일 | 변경 유형 | 이유 |
|------|-----------|------|
| `lib/supabase/server.ts` | 수정 | P0-3: non-null assertion 제거, P1: 4-space 포맷 |
| `lib/supabase/types.ts` | 수정 | P0-4: 뷰 타입 추가, P1: 4-space 포맷 |
| `domain/daycare/parser/daycare.filter-parsers.ts` | 생성 | P0-1: parsers/→parser/ 이동 |
| `domain/daycare/parsers/daycare.filter-parsers.ts` | 수정 | P0-1: re-export 래퍼로 교체 |
| `domain/daycare/apis/daycare.api.ts` | 수정 | P0-4: as 단언 제거, 랭킹 클라이언트 전환 |
| `domain/daycare/query-keys/daycare.query-keys.ts` | 수정 | P1-1: ranking keys + DaycareRankingParams 추가 |
| `domain/daycare/query-options/daycare.query-options.ts` | 수정 | P1-1: ranking queryOptions 추가 |
| `domain/daycare/hooks/daycare.hooks.ts` | 수정 | P1-1: ranking hooks, P1-2: useSuspenseQuery 전환 |
| `domain/daycare/prefetch/daycare.prefetch.ts` | 수정 | P1-1: ranking prefetch 추가 |
| `domain/daycare/index.ts` | 수정 | P0-2: fetchSigungus 제거, P0-1: 경로 수정, P1-1: hooks export |
| `domain/daycare/server.ts` | 수정 | P1-1: ranking API export 제거 |

---

## 깨진 Import 경고

### app/rankings/page.tsx — 빌드 오류 예상

```ts
// 현재 (제거된 export)
import { fetchDaycareRankingWaiting, fetchDaycareRankingCapacity, fetchDaycareRankingOldest }
    from '@/domain/daycare/server';
```

**ui-engineer 작업 필요**: rankings/page.tsx를 `runPrefetch` + `HydrationBoundary` + `useSuspenseQuery` 패턴으로 전환해야 함.
사용 가능한 도메인 API:
- `daycarePrefetch.rankingWaiting({ sido })` (server.ts 경유)
- `useDaycareRankingWaiting({ sido })` (index.ts 경유)

### 잔존 TODO 항목

- `domain/daycare/apis/daycare.api.ts` — `row as DaycareRow` 패턴 4개: 파서 시그니처를 Partial 타입으로 좁히는 별도 리팩토링 필요
- `domain/daycare/server.ts` — `fetchDaycareIdsPaginated`: sitemap 전용으로 `lib/sitemap-helpers.ts` 이동 권장 (§3.4 deep import 금지)
- `domain/daycare/server.ts` — `fetchDaycareDetail/fetchDaycareCount`: DaycareDetailSSR를 queryOptions.detail(id).queryFn + cache() 패턴으로 전환 후 제거 권장
