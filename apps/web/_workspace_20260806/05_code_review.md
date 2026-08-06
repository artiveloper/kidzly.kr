# 코드 리뷰 보고서

검증 일시: 2026-07-03

## 요약

P0: 0개 | P1: 3개 | P2: 5개

전체적으로 React Query 패턴, server-only 경계, prefetch↔hook queryKey 일치 등 핵심 구조는 올바르게 구현되어 있다. QA 보고서의 P0 이슈(`row as DaycareRow`)는 실제 코드에서 `DaycareRankingRow`(Pick 타입)로 수정 완료 — P0 잔존 이슈 없음.

---

## P0 이슈 (즉시 수정)

**P0 이슈 없음.**

QA 보고서가 P0로 보고한 `row as DaycareRow` 단언 4건은 실제 코드에 존재하지 않는다. 현재 코드는 `row as DaycareRankingRow`를 사용하며, `DaycareRankingRow`는 `Pick<DaycareRow, 'daycare_code' | 'name' | ... 10개 컬럼>`으로 `RANKING_COLUMNS`와 정확히 일치한다. 파서 함수 시그니처도 `DaycareRankingRow`를 받도록 업데이트되어 있다.

---

## P1 이슈 (권고)

### [P1-1] server.ts — prefetch 외 함수 export

**파일:** `apps/web/domain/daycare/server.ts:4-6`

**이유:** CLAUDE.md §3 "server.ts: prefetch만 re-export" 위반. `fetchDaycareIdsPaginated`(sitemap.ts용), `fetchDaycareDetail`(generateMetadata용) 두 함수가 export됨.

**특별 판단:** 두 케이스 모두 React Query 없는 서버 전용 컨텍스트로 합당한 이유가 있으나, 점진적으로 server.ts가 서버 유틸리티 집합소로 변질될 위험이 있다.

**권고 대안:**
- `fetchDaycareIdsPaginated` → `apps/web/lib/sitemap-helpers.ts`로 이동
- `fetchDaycareDetail` → `daycareQueryOptions.detail(id).queryFn`을 `cache()`로 감싸서 사용

---

### [P1-2] rankings/page.tsx — Suspense fallback Skeleton 미사용 (CLS 위험)

**파일:** `apps/web/app/rankings/page.tsx:176-186`

**이유:** CLAUDE.md §12 "Skeleton 컴포넌트 사용, Skeleton은 최종 레이아웃 크기와 일치 (CLS 방지)". 현재 fallback은 실제 레이아웃(필터 탭 + 랭킹 카드 3섹션)을 반영하지 않는 단순 블록이다. CLS 발생 가능성 있음.

**수정:** `components/rankings/RankingsSkeleton.tsx` 생성 후 교체.

---

### [P1-3] fetchDaycareIdsPaginated — 에러 시 빈 배열 반환 (SEO 영향)

**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:159-161`

**이유:** sitemap 생성 중 에러 발생 시 빈 배열을 반환하면 sitemap.xml이 비어 전체 URL 인덱싱이 중단됨. CLAUDE.md §4 "에러 → throw" 원칙과도 불일치.

**수정:** `return []` → `throw new Error(error.message)`.

---

## P2 이슈 (제안)

### [P2-1] row as DaycareRankingRow — 타입 단언 잔존 (Supabase JS 한계)

**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:194, 217, 240, 264`

현재 단언은 정확한 Pick 타입으로 실질적 위험 없음. Supabase JS의 컬럼 추론 한계로 불가피.

---

### [P2-2] fetchSigungus — limit() 없음

**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:267-281`

CLAUDE.md §19 위반. 시군구 전체 행 수(~250개)는 낮으나 정책 위반. `.limit(300)` 추가 권장.

---

### [P2-3] fetchDaycareCount, fetchSigungus — dead export

두 함수 모두 export됐으나 코드베이스 전체에서 import 없음. 사용처 확인 후 제거 또는 re-export 경로 정립 권장.

---

### [P2-4] RankingsContent — `RecentRankingList`에 oldest 데이터 전달 (이름 불일치)

**파일:** `apps/web/components/rankings/RankingsContent.tsx:74`

`RecentRankingList` 컴포넌트에 "가장 오래된" 데이터를 전달. 타입 수준은 일치하나 코드 독자에게 혼란. `HistoryRankingList`로 컴포넌트명 변경 권장.

---

### [P2-5] QA 보고서 갭 항목

QA 보고서 G-1~G-6 항목 참조:
- `naver-blog/query-options/naver-blog.query-options.ts` 빈 파일
- `domain/region/` → `lib/region.ts` 이동 권장
- `/rankings`, `/daycare/[id]` 라우트 `loading.tsx` 없음
- `DaycareDetailContent.tsx` 불필요한 `'use client'` 잔존

---

## 잘된 부분

**구조적 완성도:**
- `server.ts`, `prefetch.ts` 모두 `import 'server-only'` L1 적용
- `daycareQueryOptions.*` 재사용으로 prefetch↔hook queryKey 완전 일치 보장
- `DaycareRankingRow = Pick<DaycareRow, ...>` 부분 타입이 `RANKING_COLUMNS`와 정확히 대응 — 파서 시그니처까지 정합성 유지

**Supabase 쿼리 품질:**
- `lib/supabase/server.ts` non-null assertion 완전 제거
- ranking 함수 4개 모두 `if (error) throw new Error(error.message)` 패턴
- `LIST_COLUMNS`, `DETAIL_COLUMNS`, `RANKING_COLUMNS` 상수로 컬럼 관리

**React Query 패턴:**
- `useSuspenseQuery` 기본 적용, `queryOptions` 팩토리 패턴 철저 준수
- `useEffect` 내 fetch 없음, inline queryKey 없음

**모바일 & 접근성:**
- `hover:bg-* active:bg-*` 병용으로 터치 인터랙션 대응
- `next/image` 사용 일관, `<img>` 태그 없음
- JSON-LD + OpenGraph + Breadcrumb 구조화 데이터 완비

**TypeScript:**
- `any` 타입, non-null assertion(`!`) 미검출
- 4공백 들여쓰기 전 파일 일관 적용
