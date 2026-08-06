# QA 검증 보고서 — "같은 지역 다른 어린이집" (nearby) 기능

## 요약

검증 일시: 2026-08-06
검증 범위: `domain/daycare/*`(nearby 관련 변경분), `components/daycare/detail/DaycareNearbySection.tsx`, `DaycareNearbySectionSkeleton.tsx`, `DaycareNearbySectionError.tsx`, `DaycareDetailSSR.tsx`, `DaycareDetailView.tsx`
통과: 24 | 실패: 0 | 갭: 1
**상태**: 🟢 통과

Ground truth: `_workspace/01_refactor_spec.md`, `02_domain_changes.md`, `03_ui_changes.md`, `CLAUDE.md`

---

## 검증 축별 매트릭스

| 검증 항목 | 결과 | 주요 이슈 |
|----------|------|----------|
| `next tsc --noEmit` 통과 | ✅ | scope 파일 에러 0건 (기존 blog/mdx/velite 무관 에러만 잔존) |
| SEO: SSR HTML에 링크 포함 (prefetch→Hydration→Suspense) | ✅ | `<Link>` 실사용, prefetch merge 구조 정합 |
| 에러 격리 (nearby 실패 시 전체 404 방지) | ✅ | `.catch(() => null)`로 분리, 별도 `Promise.all` 아님 |
| 도메인 구조 (§3) | ✅ | 8개 파일 모두 스펙대로 수정, `server.ts` 무변경 유지 |
| React Query 패턴 (§5) | ✅ | queryOptions 팩토리, `useSuspenseQuery`, inline queryKey 없음 |
| Prefetch 정합성 (§6) | ✅ | `server-only` 양쪽 존재, queryOptions 재사용으로 key 일치 |
| Suspense/에러경계 (§11) | ✅ | ErrorBoundary+Suspense 2계층, `NaverBlogSection`과 동일 패턴 |
| 빈 상태 (§12) | ✅ | 에러 UI와 분리된 안내 문구 |
| 4공백 들여쓰기 (§15) | ✅ | 탭 문자 없음 확인 |
| Mobile-first (§16) | ✅ | `min-h-11`, hover 아닌 `active:` 탭 대안 존재 |
| 컴포넌트 규칙 (§17) | ✅ | 파일당 1개 컴포넌트, default export, 관심사 분리 |
| API↔Hook 타입 교차 | ✅ | `DaycareNearbyItem` 일관 사용, DB Row 미노출 |
| Supabase 쿼리 품질 | ✅ | `limit()` 강제, N+1 없음, 최소 컬럼 select |
| `any` / non-null assertion(`!`) | ✅ | grep 결과 0건 |
| 시맨틱 헤딩 (§18, 보조) | ⚠️ | 섹션 타이틀이 `<p>`(기존 `NaverBlogSection` 패턴과 동일, 신규 회귀 아님) |

---

## 검증 축 1 — 도메인 구조 (AAA)

**1-1. 타입 확장**
- Arrange: `domain/daycare/types/index.ts` 를 읽음
- Act: `DaycareDetail` 정의 확인
- Assert: `sigunguCode: string`(non-null) L26에 존재, `DaycareNearbyItem`(id/name/typeName/address) L127-132에 존재 → ✅ 스펙 일치

**1-2. API 함수**
- Arrange: `apis/daycare.api.ts` L109-138 `fetchDaycareNearby`
- Act: select/eq/eq/neq/limit 체인 확인
- Assert: `NEARBY_COLUMNS`(daycare_code,name,type_name,address) → `.eq('sigungu_code', sigunguCode)` → `.eq('status','정상')` → `.neq('daycare_code', excludeId)` → `.limit(limit)`, 에러 시 `throw new Error(...)` → ✅ 스펙 시그니처·필터·에러패턴 완전 일치

**1-3. Parser**
- Arrange: `parser/daycare.parser.ts`
- Act: `DaycareNearbyRow`(Pick), `toDaycareNearbyItem`, `toDaycareDetail`의 `sigunguCode: row.sigungu_code` 매핑 확인
- Assert: L17-22, L116-123, L135 모두 존재. `row.sigungu_code`는 `lib/supabase/types.ts` L7에서 `string`(not null)이므로 non-null assertion 불필요 — 직접 할당 확인(단언 없음) → ✅

**1-4. query-keys / query-options / hooks / prefetch**
- Arrange: 4개 파일 각각 읽음
- Act: `DaycareNearbyParams` 타입, `daycareQueryKeys.nearby`, `daycareQueryOptions.nearby`(queryKey+queryFn+staleTime 1h), `useDaycareNearby`(useSuspenseQuery), `daycarePrefetch.nearby`(server-only 파일 내) 확인
- Assert: 모두 스펙과 1:1 일치 → ✅

**1-5. index.ts / server.ts**
- Arrange: `domain/daycare/index.ts`, `server.ts`
- Act: export 목록 확인
- Assert: `DaycareNearbyItem`, `DaycareNearbyParams`, `useDaycareNearby` export 추가됨(L1,8,19). `server.ts`는 `daycarePrefetch` 객체 전체 re-export이므로 `nearby` 자동 포함, 실제로 무변경 상태 확인(git status에 미포함) → ✅

---

## 검증 축 2 — SEO 핵심 포인트 (SSR 링크 노출)

**2-1. 실제 `<a>` 태그로 렌더링되는지**
- Arrange: `DaycareNearbySection.tsx` L30-33
- Act: `next/link`의 `<Link href={\`/daycare/${item.id}\`}>` 사용 확인 (조건부 클라이언트 전용 렌더링 아님, `useEffect` 뒤 렌더링 아님)
- Assert: `'use client'` 컴포넌트이지만 최초 렌더 시점(SSR 트리 내 Suspense 하위)에 곧바로 `<Link>` JSX 반환 → RSC/SSR 단계에서 `<a href="/daycare/{id}">`로 직렬화됨 → ✅ 크롤링 가능 구조

**2-2. Prefetch → HydrationBoundary → Suspense 경로**
- Arrange: `DaycareDetailSSR.tsx` L40-53, `DaycareDetailView.tsx` L109-113
- Act: `runPrefetch(daycarePrefetch.nearby({ sigunguCode: daycare.sigunguCode, excludeId: id, limit: 10 }))` 실행 후 `state.queries`와 `nearbyState.queries`를 병합한 `hydrationState`를 `<HydrationBoundary state={hydrationState}>`에 전달, 그 하위 `DaycareDetailView` → `DaycareNearbySection`이 `<ErrorBoundary><Suspense>` 안에서 `useDaycareNearby`(=`useSuspenseQuery`) 사용
- Assert: `getQueryClient()`(`lib/react-query/query-client.ts` L20-23)는 `isServer`일 때 매 호출마다 새 `QueryClient` 인스턴스를 생성 — 즉 `runPrefetch`를 두 번 호출하면 서로 다른 dehydrated state가 나오므로 `queries` 배열 병합이 실제로 필요하고 정확함(스펙 근거와 일치, 중복 키 없음: `detail` 상태와 `nearby` 상태는 서로 다른 QueryClient에서 왔으므로 병합 시 충돌 없음) → ✅ prefetch된 데이터가 hydrate되어 `useSuspenseQuery`가 서버에서 즉시 resolve, 클라이언트 JS 실행 전 SSR HTML에 링크 포함

**2-3. queryKey 일치 (prefetch ↔ hook)**
- Arrange: prefetch 호출 `{ sigunguCode: daycare.sigunguCode, excludeId: id, limit: 10 }` vs hook 호출 `{ sigunguCode, excludeId, limit: 10 }`(`DaycareNearbySection` props에서 옴, `detail.sigunguCode`/`id`는 동일 요청 내 동일 값)
- Act: 두 호출 모두 `daycareQueryOptions.nearby(params)` 팩토리 통해 `daycareQueryKeys.nearby(params)` 생성
- Assert: TanStack Query의 `hashKey`는 객체 키 순서에 무관하게 정규화하므로 값이 동일하면 키 해시 일치 → hydration이 정확히 해당 캐시 엔트리를 채움 → ✅

---

## 검증 축 3 — 에러 격리 (404 미유발)

- Arrange: `DaycareDetailSSR.tsx` L41-49
- Act: 상세 데이터(`detail`)는 `Promise.all([...]).catch(() => notFound())`로 처리, `nearby`는 그 아래 **별도** `runPrefetch(...).catch(() => null)`로 처리(같은 `Promise.all`에 편입되지 않음)
- Assert: `fetchDaycareNearby`가 throw하더라도 `notFound()`가 호출되는 코드 경로에 도달하지 않음(별개의 catch) → 페이지는 200으로 계속 렌더링되고 `nearbyState`가 `null`이 되어 `hydrationState = state`(기존 detail 상태만)로 fallback → 클라이언트에서 `DaycareNearbySection`이 prefetch 없이 자체 `useSuspenseQuery` 재시도, 그마저 실패하면 `<ErrorBoundary fallback={<DaycareNearbySectionError />}>`가 흡수 → 상세페이지 본문(제목·주소·JSON-LD 등)은 영향 없음 → ✅ 격리 확인

---

## 검증 축 4 — CLAUDE.md 섹션별

| 섹션 | 확인 내용 | 결과 |
|---|---|---|
| §3 도메인 구조 | 8개 파일(server.ts 제외) 전부 스펙대로 수정, deep import/export * 없음 | ✅ |
| §5 React Query | inline queryKey/queryFn 없음, `useSuspenseQuery` 사용, queryOptions 팩토리만 참조 | ✅ |
| §6 Prefetch | `prefetch/daycare.prefetch.ts` L1 `import 'server-only'`, `server.ts` L1 `import 'server-only'`, queryOptions 재사용으로 key 일치, `DaycareDetailSSR`는 `runPrefetch` 사용(직접 QueryClient 조작 없음) | ✅ |
| §11 Suspense/에러경계 | `DaycareNearbySection`(useSuspenseQuery)이 `<ErrorBoundary><Suspense>` 안에 위치(`DaycareDetailView.tsx` L109-113) | ✅ |
| §12 빈 상태 | `items.length === 0`일 때 안내 문구, 에러 문구와 분리(`DaycareNearbySection.tsx` L22-25) | ✅ |
| §15 4공백 | 스코프 파일 tab 문자 grep 0건 | ✅ |
| §16 Mobile-first | `min-h-11`(44px) 터치 타겟, `active:bg-gray-50` 탭 피드백, hover는 보조 신호 | ✅ |
| §17 컴포넌트 규칙 | 파일당 컴포넌트 1개, default export, 데이터(`useDaycareNearby`)/렌더 분리 | ✅ |

---

## 검증 축 5 — Supabase 쿼리 품질 / TypeScript

- `.limit(limit)` 호출 확인(`daycare.api.ts` L130) → ✅
- N+1 없음 — 단일 쿼리로 목록 조회 → ✅
- select 컬럼 최소화 — `NEARBY_COLUMNS = 'daycare_code, name, type_name, address'`(L19), 상세 4개 필드만 → ✅
- `any` 사용: 스코프 파일 grep 0건 → ✅
- non-null assertion(`!`): 스코프 파일 grep 0건. `row.sigungu_code`(not null 컬럼) 직접 할당, 단언 불필요 확인 → ✅
- UI에서 DB Row 타입 직접 사용 금지: `DaycareNearbySection`은 `DaycareNearbyItem`(parser 통과 타입)만 사용, `DaycareNearbyRow`/`DaycareRow` 미노출 → ✅

---

## 통과 항목 요약

- `next tsc --noEmit` 스코프 파일 에러 0건 (잔존 에러는 blog/mdx/velite 관련 기존 이슈, 이번 기능과 무관 — `app/contents/[slug]/page.tsx`, `components/blog/mdx-components.tsx`, `lib/blog.ts`, `velite.config.ts`)
- `git status` 기준 변경 파일이 스펙에 명시된 파일 목록과 정확히 일치(신규 3, 수정 10, `server.ts` 무변경) — 스코프 외 변경 없음
- SSR HTML에 실제 `<a href="/daycare/{id}">` 링크가 포함되는 구조(prefetch→merge→HydrationBoundary→Suspense) 확인
- nearby 조회 실패가 상세페이지 전체 `notFound()`를 유발하지 않는 격리 구조 확인
- Supabase 쿼리 품질(limit 강제, 최소 select, N+1 없음, throw 에러 패턴) 확인
- `any`/non-null assertion 미사용, 4공백 들여쓰기 확인

## 갭 (P2, 개선 권장— 이번 기능 신규 회귀 아님)

| # | 파일 | 문제 | 심각도 | 비고 |
|---|------|------|--------|------|
| 1 | `DaycareNearbySection.tsx` L18, `DaycareNearbySectionError.tsx` L4 | 섹션 타이틀이 `<h2>` 등 헤딩 태그가 아닌 `<p>`로 렌더링(WCAG 시맨틱 구조 권장사항) | P2 | `NaverBlogSection`/`NaverBlogSectionError`의 기존 패턴을 그대로 재사용한 것으로, 이번 기능이 새로 만든 회귀가 아님. 페이지 전체(예: `NaverBlogSection` 등)에 일괄 적용할 별도 개선 과제로 분리 권장 |

## 재검증 요청

없음 — P0/P1 실패 없음. 재작업 불필요.
