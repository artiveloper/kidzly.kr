# 코드 리뷰 보고서 — "같은 지역 다른 어린이집" (nearby) 기능

> 범위: `domain/daycare/*` nearby 관련 변경분(8개), `components/daycare/detail/DaycareNearbySection.tsx`,
> `DaycareNearbySectionSkeleton.tsx`, `DaycareNearbySectionError.tsx`, `DaycareDetailSSR.tsx`, `DaycareDetailView.tsx`.
> `_workspace/04_qa_report.md`가 이미 보고한 항목(섹션 타이틀 `<p>` vs `<h2>` 시맨틱 갭)은 중복 기재하지 않음.

## 요약

P0: 0개 | P1: 2개 | P2: 5개

전반적으로 스펙(`01_refactor_spec.md`) 대비 편차 없이 기존 `ranking*`/`NaverBlogSection` 패턴을 충실히 복제했고, prefetch↔hook `queryKey` 일치·에러 격리·`throw` 에러 패턴·select 컬럼 최소화 등 핵심 아키텍처 요구사항은 모두 준수한다. 다만 새로 작성된 UI 텍스트 색상이 WCAG AA 명암비를 만족하지 못하는 부분과, 새로 추가된 `ErrorBoundary` 블록이 `QueryErrorResetBoundary`와 연결되지 않아 에러 후 재시도 경로가 없다는 점은 CLAUDE.md §11/§18 요구사항 대비 갭으로, QA 검증 항목에 포함되지 않았던 만큼 코드 리뷰에서 보완 권고한다.

## P0 이슈 (즉시 수정)

없음.

---

## P1 이슈 (권고)

### [P1] WCAG AA 본문 명암비 미달 — `text-gray-400`
**파일:**
- `apps/web/components/daycare/detail/DaycareNearbySection.tsx:23-25` (빈 상태 안내문), `:43` (주소 `text-xs text-gray-400`)
- `apps/web/components/daycare/detail/DaycareNearbySectionError.tsx:7` (에러 안내문)

**이유:** Tailwind `gray-400`(`#9ca3af`)를 흰 배경(`bg-white`) 위에 사용하면 실측 명암비가 약 2.5:1로, WCAG AA 본문 기준(4.5:1)은 물론 큰 텍스트 기준(3:1)에도 못 미친다. 특히 주소 텍스트는 `text-xs`(12px)로 렌더링되는 실질 콘텐츠(장식 텍스트 아님)이므로 저시력 사용자에게 가독성 문제가 된다.

**참고:** `WaitingRankingList.tsx`, `NaverBlogSectionError.tsx` 등 기존 컴포넌트에도 동일한 `text-gray-400` 패턴이 이미 존재하므로 이번 기능이 새로 만든 회귀는 아니다. 다만 이번에 신규로 작성된 3개 파일에도 그대로 답습되었으므로, 최소한 이번 기능 범위에서는 `text-gray-500`(`#6b7280`, 흰 배경 대비 약 4.6:1으로 AA 통과) 이상으로 교체할 것을 권고한다. 레포 전역 통일은 별도 개선 과제로 분리 권장(QA가 보고한 `<p>`/`<h2>` 갭과 같은 성격).

**수정:** `text-gray-400` → `text-gray-500` (또는 그 이상 명도 대비 확보 색상)로 교체.

---

### [P1] 신규 `ErrorBoundary`가 `QueryErrorResetBoundary`와 미연결
**파일:** `apps/web/components/daycare/detail/DaycareDetailView.tsx:109-113`

**이유:** CLAUDE.md §11은 "`QueryErrorResetBoundary` + `ErrorBoundary` 연결 필수"를 명시한다. 현재 `ErrorBoundary`(`components/common/ErrorBoundary.tsx`)는 `getDerivedStateFromError`로 `hasError`를 한 번 세팅하면 리셋 메커니즘이 전혀 없는 순수 `Component` 기반 클래스다. `useDaycareNearby`(`useSuspenseQuery`)가 에러를 던져 이 바운더리가 열리면, 사용자가 이후 같은 세션에서 페이지를 다시 방문하지 않는 한 `DaycareNearbySectionError` 폴백이 영구적으로 고정되며 React Query 쪽 에러 상태를 리셋하고 재시도할 방법이 없다.

**참고:** `NaverBlogSection`도 동일한 `ErrorBoundary`를 동일한 방식(리셋 연결 없이)으로 사용하고 있어 이번에 새로 만든 회귀는 아니다. 다만 이번 기능이 신규로 추가한 블록이므로, 최소한 이 블록에서라도 `QueryErrorResetBoundary`를 도입하거나(또는 공통 `ErrorBoundary`에 `onReset`/`resetKeys` 지원을 추가) 스펙 요구사항을 충족시키는 편이 바람직하다. 전면 리팩토링이 부담스럽다면 최소한 `<ErrorBoundary key={sigunguCode}>`처럼 상위 상태 변화 시 리마운트되는 안전장치라도 검토 권장.

**수정:** `QueryErrorResetBoundary`로 감싸고 `onReset`을 `ErrorBoundary`에 연결(또는 공통 `ErrorBoundary`에 리셋 API 추가). 레포 전역 적용은 별도 과제로 분리 가능.

---

## P2 이슈 (제안)

### [P2] `DaycareDetailView.tsx` 200줄 초과
**파일:** `apps/web/components/daycare/detail/DaycareDetailView.tsx` (전체 207줄)

이번 변경으로 import 3줄 + `ErrorBoundary`/`Suspense` 블록 6줄이 추가되며 CLAUDE.md §17 "200줄 초과 시 분리" 임계값을 넘겼다(변경 전 약 199줄 추정). "함께 보면 좋은 글" 섹션이나 "랭킹 바로가기" 카드 등 독립적인 하위 섹션을 별도 컴포넌트로 분리하면 임계값 아래로 낮출 수 있다. 당장 기능에 영향은 없으므로 제안 수준.

---

### [P2] `nearby` prefetch의 `.catch(() => null)`이 주요 실패 경로에서 사실상 도달 불가
**파일:** `apps/web/components/daycare/detail/DaycareDetailSSR.tsx:46-49`

`queryClient.prefetchQuery()`는 TanStack Query v5에서 내부적으로 에러를 흡수하고 캐시에 `status: 'error'`로만 기록할 뿐, 호출자에게 reject하여 던지지 않는다(`fetchQuery`와 달리). 또한 `lib/react-query/query-client.ts`의 커스텀 `shouldDehydrateQuery`는 `defaultShouldDehydrateQuery(query) || status === 'pending'` 조건이라 `status === 'error'`인 쿼리는 애초에 dehydrate 대상에서 제외된다. 즉 `fetchDaycareNearby`가 `throw`해도 `runPrefetch(...)` 자체는 정상적으로 resolve하며 `nearbyState = { queries: [], mutations: [] }`가 되어 `.catch(() => null)`이 실행될 일이 거의 없다. 결과적으로 "페이지 전체 404 방지"라는 격리 목표는 달성되지만(우연히 같은 결론에 도달), 그 메커니즘은 코드/주석이 암시하는 것과 다르다. `runPrefetch`/`dehydrate` 자체가 던지는 상위 레벨 예외(예: 직렬화 실패)에 대한 방어로서만 실질적 의미가 있다.

**제안:** 주석을 "React Query의 `prefetchQuery`는 쿼리 레벨 에러를 흡수하므로 이 `.catch`는 `runPrefetch`/`dehydrate` 자체의 예외적 실패에 대한 방어용"으로 정정하거나, 굳이 유지할 필요가 없다면 제거해도 동작은 동일하다.

---

### [P2] `nearby` prefetch의 `sigunguCode` 출처가 클라이언트로 hydrate되는 `detail` 쿼리와 다른 DB 조회 결과
**파일:** `apps/web/components/daycare/detail/DaycareDetailSSR.tsx:41-49`

`daycarePrefetch.nearby({ sigunguCode: daycare.sigunguCode, ... })`의 `daycare`는 `getCachedDaycareDetail(id)`(=`cache()`로 래핑된 `fetchDaycareDetail`)의 결과다. 반면 클라이언트에서 hydrate되어 `useDaycareDetail(id)`가 읽는 `detail.sigunguCode`는 별도로 `runPrefetch(daycarePrefetch.detail(id))`가 호출하는, 래핑되지 않은 원본 `fetchDaycareDetail(id)`의 결과다. 두 값은 사실상 항상 동일한 DB row를 두 번 독립적으로 읽은 결과이므로(이 앱은 공개 읽기 전용, 동시 쓰기 없음) 실무적으로 문제될 가능성은 극히 낮지만, 이론적으로 두 조회 사이에 값이 달라지면 SSR에서 prefetch한 `nearby` 쿼리의 키(`sigunguCode` 포함)가 클라이언트가 실제로 요청하는 키와 어긋나 캐시 미스가 발생하고 SSR prefetch 이점이 무효화된다(폴백 자체 fetch로 여전히 동작은 하므로 사용자 체감 오류는 없음).

이는 `01_refactor_spec.md`에 이미 "기존부터 존재하던 이슈이며 이번 기능과 무관, 손대지 않음"으로 명시된 `DaycareDetailSSR`의 이중 fetch(`runPrefetch(daycarePrefetch.detail(id))` vs `getCachedDaycareDetail(id)`) 구조에서 파생되는 부수 효과다. 이번 기능 자체의 결함이라기보다 기존 이슈가 `nearby`의 키 파생 경로에 새로 노출된 것이므로, 향후 이중 fetch 통합 작업 시 함께 해소 권장.

---

### [P2] `fetchDaycareNearby`의 `as DaycareNearbyRow` 캐스트에 설명 주석 누락
**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:137`

같은 파일의 `fetchDaycareRankingWaiting`/`Recent`/`Oldest`/`Capacity`는 `row as DaycareRankingRow` 캐스트 직전에 `// Supabase JS가 string-typed select에서 열을 추론하지 못하므로 DaycareRankingRow(Pick)로 단언` 주석을 남겨 왜 단언이 필요한지 명시한다. `fetchDaycareNearby`(L137)에는 동일 패턴의 캐스트가 있지만 이 주석이 빠져 있어 일관성이 떨어진다. 사소하지만 향후 유지보수 시 "왜 단언했는지" 파악을 돕기 위해 동일 주석 추가 권장.

---

### [P2] `sigungu_code` 빈 문자열 edge case 미방어
**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:116-138`

`sigungu_code`는 DB 스키마상 `NOT NULL`이지만 이는 빈 문자열(`''`)까지 배제하지는 않는다. 만약 데이터 동기화 과정에서 `sigungu_code`가 `''`인 어린이집이 존재한다면, `fetchDaycareNearby('', excludeId, ...)`가 `.eq('sigungu_code', '')`로 실행되어 실제로는 "같은 지역"이 아닌, 단지 `sigungu_code`가 비어 있는 다른 어린이집들을 "같은 지역"으로 잘못 노출할 수 있다. 현재 운영 데이터에서 이런 케이스가 없다면 당장 문제는 아니나, `DaycareNearbySection` 호출 전(또는 API 함수 내부) `sigunguCode` 공백 체크 후 빈 배열 반환하는 가드를 추가하면 더 안전하다.

---

## 잘된 부분

- 도메인 8개 파일 모두 기존 `ranking*` 4종 세트 패턴(타입·query-key·query-options·hooks·prefetch)을 정확히 복제해 CLAUDE.md §3 구조를 그대로 유지했다.
- `queryOptions` 팩토리 재사용으로 SSR prefetch(`daycarePrefetch.nearby`)와 클라이언트 훅(`useDaycareNearby`)의 `queryKey`가 정확히 일치한다(핵심 P0 리스크 없음, 실제 검증 완료).
- `nearby` 실패가 `notFound()` 판정 로직과 물리적으로 분리된 별도 `Promise.all`/`.catch()` 체인에 있어, 상세 페이지 핵심 렌더링과 완전히 격리된다.
- `fetchDaycareNearby`가 `limit()`을 강제하고, `NEARBY_COLUMNS`로 카드 렌더링에 필요한 4개 컬럼만 select하며, `throw` 에러 패턴을 CLAUDE.md §4에 맞게 신규 적용했다(기존 catch-and-return `[]` 함수들과 혼재하지 않고 신규 함수만 throw로 통일).
- `any`, non-null assertion(`!`) 전면 미사용, 4공백 들여쓰기 일관 유지.
- `<Link>`를 `'use client'` 컴포넌트에서 조건부 렌더링 없이 최초 렌더에 직접 반환해 SSR HTML에 실제 `<a href>`가 포함되도록 구현한 점이 이번 기능의 핵심 목표(내부링크망 형성)를 정확히 달성한다.
- 터치 타겟 `min-h-11`(44px), hover 전용이 아닌 `active:` 탭 피드백 등 모바일 퍼스트 원칙 준수.
- 빈 상태를 에러와 분리된 안내 문구로 명시적으로 처리(CLAUDE.md §12).
