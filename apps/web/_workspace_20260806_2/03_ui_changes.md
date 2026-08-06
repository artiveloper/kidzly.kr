# UI 레이어 변경 사항 — "같은 지역 다른 어린이집" (`components/daycare/detail`)

> 범위: `01_refactor_spec.md`에 명시된 UI 작업만 수행. 신규 3파일 + 기존 2파일 수정.

## 변경 파일 목록

| 파일 | 종류 | 내용 |
|---|---|---|
| `components/daycare/detail/DaycareNearbySection.tsx` | 신규 | `'use client'`, `useDaycareNearby({ sigunguCode, excludeId, limit: 10 })`로 목록 조회, `next/link`의 실제 `<Link href="/daycare/{id}">`로 카드형 리스트 렌더링. `TypeBadge` 재사용. 빈 배열이면 "같은 지역에 등록된 다른 어린이집 정보가 없습니다." 안내 문구(에러 아님). `target="_blank"` 미적용(동일 탭 상세→상세 탐색) |
| `components/daycare/detail/DaycareNearbySectionSkeleton.tsx` | 신규 | `<Suspense fallback>`. 카드 5개 스켈레톤, `DetailSkeleton`/`NaverBlogSectionSkeleton`과 동일한 `animate-pulse` + `bg-gray-100`/`bg-gray-200` 컨벤션. 최종 카드와 높이·구조 일치(CLS 방지) |
| `components/daycare/detail/DaycareNearbySectionError.tsx` | 신규 | `<ErrorBoundary fallback>`. `NaverBlogSectionError`와 동일 패턴("정보를 불러올 수 없습니다.") |
| `components/daycare/detail/DaycareDetailSSR.tsx` | 수정 | 기존 `Promise.all([detail prefetch, getCachedDaycareDetail]).catch(() => notFound())` 블록은 그대로 유지. 그 직후 `daycare.sigunguCode`로 `daycarePrefetch.nearby({ sigunguCode, excludeId: id, limit: 10 })`를 별도 `runPrefetch` 호출 후 `.catch(() => null)`로 실패를 흡수(보조 섹션이므로 전체 404 미유발). `nearbyState`가 있으면 `state.queries`와 `nearbyState.queries`를 병합한 `hydrationState`를 만들어 `<HydrationBoundary state={hydrationState}>`에 전달(기존 `state` 단독 전달에서 교체) |
| `components/daycare/detail/DaycareDetailView.tsx` | 수정 | import에 `DaycareNearbySection`/`DaycareNearbySectionError`/`DaycareNearbySectionSkeleton` 추가. `<DaycareDetailContent daycare={detail} />` 직후, 기존 `NaverBlogSection` `<ErrorBoundary>` 블록 바로 앞에 `<ErrorBoundary fallback={<DaycareNearbySectionError />}><Suspense fallback={<DaycareNearbySectionSkeleton />}><DaycareNearbySection sigunguCode={detail.sigunguCode} excludeId={id} /></Suspense></ErrorBoundary>` 삽입. 추가 prop drilling 없음 — `detail`(이미 hydrate된 `useDaycareDetail(id)` 결과)과 `id` prop에서 바로 값을 얻음 |

## Suspense / ErrorBoundary 배치 요약

컴포넌트 레벨 2계층 경계(CLAUDE.md §11)를 `NaverBlogSection`과 동일하게 적용:

```
DaycareDetailView (client)
├─ DaycareDetailContent (동기 렌더, prefetch된 detail 사용)
├─ ErrorBoundary(fallback=DaycareNearbySectionError)
│    └─ Suspense(fallback=DaycareNearbySectionSkeleton)
│         └─ DaycareNearbySection  ← useDaycareNearby (useSuspenseQuery)
└─ ErrorBoundary(fallback=NaverBlogSectionError)
     └─ Suspense(fallback=NaverBlogSectionSkeleton)
          └─ NaverBlogSection
```

SSR 측(`DaycareDetailSSR.tsx`)에서는 `nearby` prefetch를 `detail` prefetch/notFound 판정과 분리해 별도 `.catch(() => null)`로 격리했으므로, nearby 조회가 실패해도 페이지 자체는 정상적으로 200으로 렌더링되고 클라이언트에서 `DaycareNearbySection`이 prefetch 없이 자체 fetch를 재시도(그마저 실패 시 `<ErrorBoundary>`가 흡수).

## SSR 크롤링 확인

`DaycareNearbySection`은 `'use client'` 컴포넌트지만 `next/link`의 `<Link href={`/daycare/${item.id}`}>`를 실제로 렌더링하며, 서버에서 `nearby` 쿼리가 prefetch되어 `<HydrationBoundary>`로 hydrate되므로 클라이언트 JS 실행 전 SSR HTML에 `<a href="/daycare/{id}">`가 이미 포함된다(하이드레이션 전 상태에서도 크롤링 가능). `<Link>`를 조건부로 클라이언트 전용 렌더링(예: `useEffect` 이후에만 표시)하지 않았음을 확인.

## 모바일/접근성 체크

- 터치 타겟: 각 리스트 아이템 `<Link>`에 `min-h-11`(44px) 적용
- hover 전용 인터랙션 없음 — `hover:` 클래스는 보조 신호, `active:bg-gray-50`로 탭 시각 피드백 제공
- 로딩 텍스트 없음 — Skeleton 컴포넌트로 대체
- 빈 상태: 에러 UI와 분리된 안내 문구("같은 지역에 등록된 다른 어린이집 정보가 없습니다.")
- 4공백 들여쓰기 유지, `any`/`!`/불필요한 `as` 미사용

## 재사용한 기존 패턴

- `components/rankings/TypeBadge.tsx` — 그대로 import, 신규 구현 없음
- `components/rankings/WaitingRankingList.tsx`의 카드형 톤(`rounded-xl border border-gray-100`, hover/active 클래스) — 단 `target="_blank"` 미적용(상세→상세 동일 탭 이동)
- `NaverBlogSection`/`NaverBlogSectionError`/`NaverBlogSectionSkeleton`의 3파일 세트 + ErrorBoundary/Suspense 배치 구조

## 검증

- `npx tsc --noEmit` 실행 — 이번 변경 파일(`DaycareNearbySection.tsx`, `DaycareNearbySectionSkeleton.tsx`, `DaycareNearbySectionError.tsx`, `DaycareDetailSSR.tsx`, `DaycareDetailView.tsx`) 관련 타입 에러 없음. 남은 에러는 `app/contents/[slug]/page.tsx`, `components/blog/mdx-components.tsx`, `lib/blog.ts`, `velite.config.ts`의 기존 blog/mdx/velite 이슈로 이번 작업과 무관(스코프 밖, 미수정)

## 깨진 import 경고

- 없음. `domain/daycare`가 이미 `DaycareNearbyItem`, `DaycareNearbyParams`, `useDaycareNearby`, `daycarePrefetch.nearby`를 export 중임을 확인 후 사용
