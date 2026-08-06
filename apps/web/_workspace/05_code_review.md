# 코드 리뷰 보고서 — 시군구 SEO 허브 구조 개선(2차)

## 범위
`01_refactor_spec.md` / `03_ui_changes.md` 2차 작업분 한정:
- `app/region/[sido]/page.tsx`, `loading.tsx`
- `components/region/RegionSidoIndexView.tsx`
- `components/region/region-meta.ts`
- `components/rankings/RankingsPageView.tsx`
- `app/sitemap.ts`
- `components/daycare/detail/DaycareDetailView.tsx`

QA 보고서(`04_qa_report.md`)에서 이미 통과 처리한 diff 형태·타입체크·린트·4공백·`any`/`!` 부재 등은 재검증하지 않고 QA 참조로 처리한다.

## 요약
P0: 0개 | P1: 1개 | P2: 3개

diff 자체는 스펙과 정확히 일치하고 구조적으로 안전하다(SSG 방어 패턴 재사용, prefetch/queryKey 이슈 없음, server-only 경계 위반 없음). 다만 QA는 "diff가 스펙과 일치하는가"만 검증했고, 리뷰에서는 그 diff가 **기존 코드와 상호작용하는 지점**을 봤을 때 사용자에게 실제로 잘못된 라우팅을 유발하는 결함을 하나 발견했다(`DaycareDetailView.tsx`의 기존 🏆 카드). 이번 diff가 만든 문제는 아니지만, 바로 그 diff가 같은 `<div>` 안에 새 카드를 추가하면서 이 결함을 더 눈에 띄게 만들었으므로 보고한다. 나머지는 리팩토링 기회 수준의 P2.

## P0 이슈 (즉시 수정)
P0 이슈 없음.

## P1 이슈 (권고)

### [P1] DaycareDetailView.tsx — 기존 🏆 카드가 쿼리파라미터 라우팅을 사용해 지역 필터가 무시됨
**파일:** `apps/web/components/daycare/detail/DaycareDetailView.tsx:180-182`
```tsx
href={
    detail.sidoName
        ? `/rankings?sido=${encodeURIComponent(detail.sidoName)}`
        : "/rankings"
}
```
**이유:** `/rankings/page.tsx`(`apps/web/app/rankings/page.tsx`)는 `searchParams`를 전혀 읽지 않고 `<RankingsPageView />`를 `sido` prop 없이 그대로 렌더한다. `sido` 필터는 오직 `/rankings/[sido]/page.tsx`의 **경로 파라미터**로만 전달되며(`app/rankings/[sido]/page.tsx:32-38`), 쿼리파라미터를 경로로 리다이렉트하는 미들웨어도 없다(`middleware.ts` 부재 확인). 즉 이 카드를 클릭하면 "OO 어린이집 랭킹"이라는 라벨과 달리 항상 `/rankings`(전국)로 이동해 시도 필터가 조용히 사라진다.
바로 아래 이번 diff로 추가된 📍 카드는 동일 정보(지역 스코프)를 `buildRegionPath`로 정확한 경로 기반 라우팅(`/region/${encodeURIComponent(sido)}/...`)으로 링크하고 있어, 같은 컴포넌트 안에서 두 카드가 서로 다른(하나는 깨진) 라우팅 컨벤션을 쓰는 상태가 되었다. 상세페이지가 24,592건이라는 점을 감안하면 파급력이 크다.
**수정:** `` `/rankings/${encodeURIComponent(detail.sidoName)}` `` 로 변경 (다른 모든 곳 — `RankingsPageView.tsx`, `sitemap.ts`, `SidoFilter.tsx` — 와 동일한 경로 컨벤션).
**참고:** 이 라인 자체는 이번 2차 diff의 변경 범위가 아니다(`04_qa_report.md` §6에서 "기존 로직 완전 무변경" 확인됨). 다만 이번 diff가 이 카드를 감싸는 `<div>`에 `space-y-3`를 추가하고 바로 옆에 올바른 라우팅 카드를 배치하면서 결함이 더 도드라졌으므로, 이번 작업 범위에서 같이 고치는 것을 권장한다.

---

## P2 이슈 (제안)

### [P2] region-meta.ts — `buildRegionSidoMetadata`가 `buildRegionMetadata`를 거의 그대로 복제
**파일:** `apps/web/components/region/region-meta.ts:8-64`
**이유:** 두 함수 모두 `title`/`description`/`canonical`/OG/Twitter 필드 구조가 동일하고 문자열 조합 로직만 다르다. 코드량이 2배가 되어 있고, 공통 필드(예: `siteName`, `images` 배열 shape) 변경 시 두 곳을 함께 고쳐야 하는 유지보수 부담이 생긴다.
**제안:** `buildMetaBase({ title, description, url, ogAlt }: {...}): Metadata` 형태의 공통 헬퍼로 추출하고, 두 함수는 title/description/url 문자열만 조립해 헬퍼에 위임.

### [P2] RankingsPageView.tsx / DaycareDetailView.tsx — 동일한 CTA 카드 마크업이 3곳에 중복
**파일:** `apps/web/components/rankings/RankingsPageView.tsx:134-150`, `apps/web/components/daycare/detail/DaycareDetailView.tsx:177-216`
**이유:** `rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 active:bg-gray-200` + 이모지 아이콘 + 타이틀/서브텍스트 + `ChevronRight` 구성의 링크 카드가 세 군데(🏆, 신규 📍 × 2)에 거의 동일한 JSX로 복제되어 있다. 스펙 지시("새 컴포넌트 만들 필요 없이 인라인 JSX 블록 하나 추가면 충분")를 따른 결과라 이번 diff의 잘못은 아니지만, 카드가 3개로 늘어난 지금 시점에는 공용 `InfoLinkCard` 컴포넌트로 추출하면 스타일 변경(예: 명암비 조정)을 한 곳에서 처리할 수 있다.

### [P2] 신규 📍 카드 이모지에 `aria-hidden` 누락
**파일:** `apps/web/components/rankings/RankingsPageView.tsx:139`, `apps/web/components/daycare/detail/DaycareDetailView.tsx:205`
```tsx
<span className="text-2xl">📍</span>
```
**이유:** 이모지가 장식 목적이고 바로 옆에 텍스트 라벨(`{sido} 지역별 전체 목록 보기` / `{sigunguName} 어린이집 전체보기`)이 있어 스크린리더가 "라운드 푸시핀" 같은 이모지 이름을 라벨 앞에 중복으로 읽게 된다. 기존 🏆 카드에도 동일 패턴이 있어(QA 범위 밖) 이번 diff가 그 패턴을 그대로 복제한 것이지만, 신규로 추가된 두 곳부터라도 `aria-hidden="true"`를 붙이는 것을 권장.

---

## 잘된 부분

- `app/region/[sido]/page.tsx`의 `resolveSido()`(decode+NFC+화이트리스트) + `dynamicParams = false` + `generateStaticParams`가 `/rankings/[sido]/page.tsx`와 원칙적으로 완전히 동일해, 새 라우트를 추가하면서도 SSG 방어 패턴이 코드베이스 전역에서 일관되게 유지되고 있다.
- `RegionSidoIndexView.tsx`의 `getCachedSigunguList = cache(...)`로 `generateMetadata`와 본문 렌더링 간 fetch 중복을 제거한 것은 `RegionHubPageView.getCachedRegionCount`와 동일한 검증된 패턴을 재사용한 좋은 선택.
- `domain/region`의 기존 export(`fetchSigunguListBySido`, `buildRegionPath`, `SIDO_LIST`, `isValidSido`)만 재사용하고 신규 도메인 코드를 추가하지 않아, "UI/라우트 레이어만 작업"이라는 스펙 제약을 정확히 지켰다. `buildRegionPath`가 `encodeURIComponent`를 내부에서 처리하므로 호출부(`RegionSidoIndexView`, `DaycareDetailView`)에서 이중 인코딩 위험이 없다.
- `DaycareDetailView.tsx` 변경이 스펙이 지시한 범위(카드 1개, `space-y-3` 클래스 1곳)에 정확히 머물러 있고, `DaycareNearbySection`/`NaverBlogSection` 등 기존 비동기 경계(`ErrorBoundary`+`Suspense`)를 전혀 건드리지 않았다.
- `sitemap.ts`의 신규 `SIDO_LIST.map` 블록이 기존 `/rankings/[sido]` 블록 바로 옆에 자연스럽게 배치되어 있고, `priority`를 0.7(랭킹) > 0.68(지역 인덱스) > 0.65(시군구 허브) 순으로 미세 조정해 크롤 우선순위 의도가 코드만 봐도 읽힌다.
- 신규 텍스트는 전부 `text-gray-500` 이상을 사용해(WCAG AA), 손대지 않기로 한 기존 `text-gray-400` 서브텍스트와 명확히 구분해 범위를 지켰다.
