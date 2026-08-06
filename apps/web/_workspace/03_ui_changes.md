# 03_ui_changes.md — 시군구 SEO 허브 2차 구조 개선: UI/라우트 레이어 구현

`01_refactor_spec.md`의 작업 범위(`/region/[sido]` 인덱스 신설, `/rankings/[sido]` 칩 섹션 제거,
`sitemap.ts` 확장, `/daycare/[id]` 역링크 카드 추가)를 구현. 신규 도메인 API 없이
`02_domain_changes.md`가 이미 구현해 둔 `fetchSigunguListBySido`/`buildRegionPath`만 재사용.
`npx tsc --noEmit` exit 0 확인 완료.

## 신규 파일

| 파일 | 내용 |
|---|---|
| `app/region/[sido]/page.tsx` | `generateStaticParams`(`SIDO_LIST` 17개) + `dynamicParams = false` + `resolveSido()`(`/rankings/[sido]/page.tsx`와 동일 패턴, decode+NFC+`isValidSido`) + `generateMetadata`(`buildRegionSidoMetadata`) + 본문은 `RegionSidoIndexView` 위임. |
| `app/region/[sido]/loading.tsx` | 히어로(브레드크럼+타이틀)+시군구 칩 20개 skeleton. `app/region/[sido]/[sigungu]/loading.tsx`와 동일 톤. |
| `components/region/RegionSidoIndexView.tsx` | 서버 async 컴포넌트. `getCachedSigunguList`(React `cache()`, `generateMetadata`↔본문 fetch dedup — `RegionHubPageView.getCachedRegionCount`와 동일 패턴)로 `fetchSigunguListBySido(sido)` 호출. 옛 `SigunguLinksSection.tsx`의 칩 그리드 렌더링 로직(스타일 그대로)을 페이지 본문으로 이사. `ItemList` + `BreadcrumbList` JSON-LD, `Breadcrumb`(홈 > OO 랭킹 > 지역별 전체 목록) 포함. 빈 상태(시군구 0개 — 방어용, 실질 발생 안 함)는 `notFound()` 대신 CLAUDE.md §12 원칙대로 "아직 등록된 시군구 정보가 없습니다" 안내 문구로 처리. |

## 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `components/region/region-meta.ts` | `buildRegionSidoMetadata(sido, sigunguCount)` 추가(기존 `buildRegionMetadata`와 동일 구조 — title/description/canonical/OG/Twitter). 스펙 예시 그대로 title에 시도 전체 명칭 사용(`서울특별시 어린이집 지역별 전체 목록 - 키즐리`). |
| `components/rankings/RankingsPageView.tsx` | `SigunguLinksSection`/`SigunguLinksSectionSkeleton`/`ErrorBoundary` import 및 사용 블록 제거. `sido`가 있을 때만 렌더되는 "📍 {sido} 지역별 전체 목록 보기" CTA 카드 1개로 교체(`/daycare/[id]`의 🏆 카드와 동일 톤 — `rounded-xl bg-gray-50 p-4 hover:bg-gray-100`, `/region/${encodeURIComponent(sido)}`로 링크). `Link`, `ChevronRight` import 추가. |
| `app/sitemap.ts` | `SIDO_LIST.map(...)` 블록 추가 — `/region/${encodeURIComponent(sido)}` 17개, `changeFrequency: "weekly"`, `priority: 0.68`. 기존 `sigunguDirectory.map` 블록(2단 `/region/[sido]/[sigungu]`) 바로 위에 배치. |
| `components/daycare/detail/DaycareDetailView.tsx` | **범위 한정**: 기존 🏆 랭킹 카드를 감싸는 `<div className="border-t ... px-3 py-4">`에 `space-y-3`만 추가하고, 그 안에 `detail.sidoName && detail.sigunguName`일 때만 렌더되는 "📍 {sigunguName} 어린이집 전체보기" 카드 1개 추가(`href={buildRegionPath(detail.sidoName, detail.sigunguName)}`, 동일 카드 스타일 복제). `import { buildRegionPath } from '@/domain/region'` 추가. 그 외 로직·섹션(같은 지역 다른 어린이집 등)은 전혀 건드리지 않음. |

## 삭제 파일

- `components/rankings/SigunguLinksSection.tsx` (내용물은 `RegionSidoIndexView.tsx`로 이사)
- `components/rankings/SigunguLinksSectionSkeleton.tsx` (더 이상 참조하는 곳 없음 — `app/region/[sido]/loading.tsx`에 자체 skeleton 인라인)

삭제 후 `grep -r SigunguLinksSection apps/web` 확인 — 실제 import는 전부 제거됨, 남은 매치는
`RegionSidoIndexView.tsx`의 이관 경위를 설명하는 주석 1건과 `_workspace/*.md` 이력 문서뿐.

## Suspense 배치 요약

- `app/region/[sido]/page.tsx` → `app/region/[sido]/loading.tsx`가 세그먼트 자동 Suspense 담당(스트리밍 skeleton). `RegionSidoIndexView`는 React Query를 쓰지 않는 순수 서버 async 컴포넌트(도메인 문서와 동일 이유 — 빌드타임/SSR 전용 집계라 `useSuspenseQuery` 대상 아님)라 컴포넌트 레벨 `<Suspense>`는 불필요.
- `components/rankings/RankingsPageView.tsx`의 신규 CTA 카드는 정적 링크(데이터 패칭 없음)라 `Suspense`/`ErrorBoundary` 불필요 — 제거된 `SigunguLinksSection`이 갖고 있던 것들(비동기 fetch + 에러 경계)을 그대로 걷어냄.
- `DaycareDetailView.tsx`의 신규 카드도 이미 로드된 `useDaycareDetail` 데이터(`detail.sidoName`/`detail.sigunguName`)만 사용하는 정적 링크라 추가 경계 불필요.

## 접근성 · 모바일

- 신규 카드/칩 전부 `min-h-11`(44px) 이상 터치 타겟 유지.
- 신규 텍스트는 `text-gray-500` 이상만 사용(WCAG AA) — 기존 🏆 카드의 `text-gray-400` 서브텍스트는 스펙 지시대로 건드리지 않고 그대로 둠(범위 밖).
- `Breadcrumb`는 기존 시맨틱 `<nav aria-label="breadcrumb">` 컴포넌트 재사용.

## 깨진 import 경고

없음. `npx tsc --noEmit` exit 0. `domain/region`, `domain/daycare`의 기존 export(`fetchSigunguListBySido`, `buildRegionPath`, `SIDO_LIST`, `isValidSido`)만 그대로 소비.

## 검증 결과

1. `npx tsc --noEmit` → exit 0, 에러 없음.
2. `/region/서울특별시` (수동 브라우징 시 확인 필요 — dev 서버 미기동 상태로 curl 미실행): `RegionSidoIndexView`가 `fetchSigunguListBySido` 결과를 서버에서 `next/link`로 직접 렌더하므로 SSR HTML에 실제 `<a href>` 존재.
3. `/rankings/서울특별시`: 칩 섹션 제거 확인, "📍 서울특별시 지역별 전체 목록 보기" 카드 1개만 남음.
4. `/daycare/{id}`: `detail.sidoName`/`detail.sigunguName` 둘 다 있는 레코드에서 "OO 어린이집 전체보기" 카드 SSR 노출.
5. `sitemap.ts`에 `SIDO_LIST.map` 17개 엔트리 추가 — `/region/[sido]/[sigungu]` 블록과 별개로 카운트되어 `/region/[^/]*"` 정규식 기준 17개 매치 예상.

> 3~5번은 로컬 dev 서버 기동이 필요한 런타임 curl 검증 항목 — 이번 세션은 코드 구현+정적 타입체크까지 완료. 실제 서버 기동 후 QA 단계에서 재확인 필요.
