# Phase 3 — UI 레이어 변경 사항 (components/ + app/)

확정된 URL 설계(`sido`와 `arcode` 배타 사용)에 맞춰 `/daycares` 지역별 탭의 선택 상태·prefetch·내부 링크를 전환했다.
도메인 레이어(`apps/web/domain/**`)는 건드리지 않았다.

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `apps/web/components/region/RegionDaycareList.tsx` | Props `{ sido, sigungu }` → `{ sigunguCode }`, 훅 호출 인자 교체 |
| `apps/web/components/region/SidoChipList.tsx` | nuqs `sigungu`(이름) → `arcode`(코드) 교체, 선택 상태 판정 재작성 |
| `apps/web/app/daycares/page.tsx` | `searchParams` 타입 교체, `RegionSection` 딥링크 검증·prefetch 재작성 |
| `apps/web/components/daycare/detail/DaycareDetailView.tsx` | 지역 목록 링크를 `?arcode=` 단일 파라미터로 단순화 |

변경 없음(확인만 완료) — `components/rankings/RankingsPageView.tsx`(`?sido=` 단독 링크, 1단계 상태라 무수정 동작),
`components/common/SidoFilterChips.tsx`, `components/daycare/list/filters/DaycareFilters.tsx` 및 하위 필터,
`components/region/RegionDaycareListSkeleton.tsx`, `RegionDaycareListError.tsx`, `app/rankings/[sido]`.

## URL 파라미터 전 / 후

| 상태 | 전 | 후 |
|------|-----|-----|
| 1단계 — 시도만 선택 | `/daycares?sido=서울특별시` | `/daycares?sido=서울특별시` (동일) |
| 2단계 — 시군구까지 선택 | `/daycares?sido=서울특별시&sigungu=강남구` | `/daycares?arcode=11680` |

두 파라미터는 배타적이다. 시군구 칩을 누르면 `setSidoParam(null)` + `setArcodeParam(arcode)`로
`sido`를 URL에서 제거하고, 1단계에서 시도 칩을 누를 때도 남아 있을 수 있는 무효 `arcode`를 함께 정리한다.

## 컴포넌트별 상세

### `RegionDaycareList.tsx`

`type Props = { sigunguCode: string }`, `useDaycareRegionList({ sigunguCode, vehicleOperation, services, ages })`.
렌더링 로직(카드 마크업, 빈 상태 문구, totalCount 안내문, 필터 정책 주석)은 무수정 —
이 컴포넌트는 sido/sigungu 이름을 화면에 표시한 적이 없다.

### `SidoChipList.tsx`

선택 상태 판정을 이름 대조에서 arcode 조회로 바꿨다.

```ts
const selectedEntry = useMemo(() => {
    if (!arcodeParam) return null
    for (const entries of Object.values(sigunguBySido)) {
        const found = entries.find((entry) => entry.arcode === arcodeParam)
        if (found) return found
    }
    return null
}, [sigunguBySido, arcodeParam])

const selectedSido = selectedEntry
    ? selectedEntry.sido
    : sidoParam && sigunguBySido[sidoParam]
      ? sidoParam
      : null
```

- **접두 파싱 없음** — arcode → 시도 역산은 전부 엔트리 조회다(코드 체계가 표준 행정코드와 어긋남: 목포시 12110, 광주 북구 29170).
- **무효 URL 폴백 유지** — `arcode`가 목록에 없으면 `selectedEntry`가 null이 되어 `sido` 폴백을 거쳐 1단계 화면으로 떨어진다.
  확정된 사각지대 4건(12110/12240/12300)이 이 경로를 탄다.
- 칩 `key`를 `sigungu` → `arcode`로 바꿨다(같은 시도 안 이름 중복 위험 제거, 이제 arcode를 그대로 들고 있으므로).
- 칩 표시 텍스트는 `sigungu` 이름 그대로.

**뒤로가기(← 시도명) 버튼 — 기존 동작 유지로 판단했다.**
지시에는 "시군구 선택 해제 시 그 시도의 칩 목록으로 돌아가야 하므로 `setArcode(null)` + `setSido(해당 시도)`"라는 안이 있었으나,
현재 화면 구조에서는 시군구 칩 목록이 결과 목록 위에 **항상 함께 렌더**되고 있어(112번 줄 `selectedEntry &&` 블록은 칩 목록의 형제)
"시군구 목록 화면으로 돌아간다"는 별도 상태가 존재하지 않는다. 또 그 안을 쓰면 시군구 미선택 상태(1단계에서 시도만 고른 화면)에서
이 버튼이 같은 sido를 다시 세팅하는 no-op이 된다. 따라서 기존과 동일하게 두 파라미터를 모두 비워 1단계로 복귀시킨다 —
UX 퇴행 없음(전/후 동작 동일), CLAUDE.md §3 외과적 변경 준수.

### `app/daycares/page.tsx`

```ts
searchParams: Promise<{ tab?: string; sido?: string; arcode?: string }>
```

`sido`는 클라이언트(`SidoChipList`)에서만 소비하므로 서버에서 읽지 않는다(타입에는 허용 파라미터 문서화 목적으로 유지).
`RegionSection`은 `arcode`만 받는다.

```ts
const selectedEntry = arcode ? entries.find((entry) => entry.arcode === arcode) : undefined
if (selectedEntry) {
    const state = await runPrefetch(daycarePrefetch.regionList({ sigunguCode: selectedEntry.arcode }))
    ...
}
```

`?sido=`만 들어온 1단계 진입은 선택된 시군구가 없어 조회할 목록도 없으므로 prefetch하지 않고 `SidoChipList`만 렌더한다.
`groupBySido` 헬퍼는 그대로 재사용.

### `DaycareDetailView.tsx`

```tsx
{detail.sigunguCode && detail.sigunguName && (
    <Link href={`/daycares?arcode=${detail.sigunguCode}`} ...>
```

가드를 `detail.sidoName && detail.sigunguName` → `detail.sigunguCode && detail.sigunguName`으로 조정했다
(링크 값은 sigunguCode, 링크 텍스트 "{sigunguName} 어린이집 전체보기"는 sigunguName에 의존하므로 둘 다 필요).
`encodeURIComponent` 2회 호출은 제거 — arcode는 숫자형 varchar 코드다.
바로 위 랭킹 링크(`/rankings/{sidoName}`)는 무관하므로 그대로 뒀다.

## Suspense / ErrorBoundary 배치 (변경 없음)

`SidoChipList` 안의 배치를 그대로 유지했다.

```
DaycareFilters              ← Suspense 경계 밖(형제). 필터 변경으로 목록이 재-suspend돼도 필터 바는 유지
ErrorBoundary(RegionDaycareListError)
  └ Suspense(RegionDaycareListSkeleton)
      └ RegionDaycareList   ← useSuspenseQuery
```

`page.tsx`의 `HydrationBoundary`(prefetch 성공 시에만 래핑)도 기존 구조 유지.

## 깨진 import / 잔여 위험

- 깨진 import 없음. `02_domain_changes.md`가 지목한 타입 에러 2건은 모두 해소됐다.
- `?sido=&sigungu=` 형태의 기존 딥링크는 이제 `sigungu`가 무시되어 **1단계(시군구 칩 화면)로 폴백**된다.
  결정 2 확정안이 명시적으로 수용한 비호환이며, 코드베이스 내부에 이 형태의 링크는 남아 있지 않다(grep 확인 완료).
  `sitemap.xml`에도 지역별 탭 쿼리 URL은 포함되어 있지 않다.

## 검증 결과

| 명령 | 결과 |
|------|------|
| `pnpm typecheck` | 통과 (에러 0건) |
| `pnpm lint` | 에러 0건 / 경고 45건 — 전부 `next.config.mjs`, `public/vendor/naver-marker-clustering.js` 등 이번에 손대지 않은 기존 파일 |
| `pnpm build` | 성공 (`/daycares` ƒ Dynamic로 정상 빌드) |

## 접근성 / 반응형 (퇴행 없음)

칩 터치 타겟 `h-10`(+`px-4`), 카드 `min-h-11`, `grid-cols-1 sm:grid-cols-2` mobile-first 그리드,
탭 기반 인터랙션(hover-only 없음) 모두 기존 그대로다. 새 스타일 클래스를 추가하지 않았다.
