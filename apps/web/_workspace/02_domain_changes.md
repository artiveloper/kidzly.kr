# Phase 2 — 도메인 레이어 변경 사항 (daycare)

지역별 어린이집 조회를 `(sido_name, sigungu_name)` 문자열 매칭 → `sigungu_code`(= `sigungus.arcode`) 코드 조인으로 전환했다.
region 도메인(`types/index.ts`, `server.ts`)은 선행 작업에서 이미 완료된 상태를 확인만 하고 건드리지 않았다.

## 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `apps/web/domain/daycare/apis/daycare.api.ts` | `fetchDaycaresBySigungu` 시그니처·WHERE 절·JSDoc 교체 |
| `apps/web/domain/daycare/query-keys/daycare.query-keys.ts` | `DaycareRegionListParams` 필드 교체 |
| `apps/web/domain/daycare/query-options/daycare.query-options.ts` | `regionList` queryFn 호출 인자 교체 |
| `apps/web/domain/daycare/prefetch/daycare.prefetch.ts` | `regionList` 위 주석의 딥링크 URL 표기만 갱신 (코드 변경 없음) |

변경 없음(확인만 완료) — `hooks/daycare.hooks.ts`, `index.ts`, `server.ts`, `parser/daycare.parser.ts`, `types/index.ts`.
모두 `DaycareRegionListParams` 타입을 그대로 재수출·소비하고 있어 타입 변경이 자동 반영된다.
`server.ts:7-8`의 `fetchDaycaresBySigungu` re-export 주석은 여전히 정확해 유지했다.

## 시그니처 변경 전/후

### `fetchDaycaresBySigungu` (apis/daycare.api.ts)

```ts
// 전
export async function fetchDaycaresBySigungu(
    sido: string,
    sigungu: string,
    options: { limit?: number; vehicleOperation?: boolean; services?: string[]; ages?: number[] } = {}
): Promise<DaycareRegionListResult>

// 후
export async function fetchDaycaresBySigungu(
    sigunguCode: string,
    options: { limit?: number; vehicleOperation?: boolean; services?: string[]; ages?: number[] } = {}
): Promise<DaycareRegionListResult>
```

WHERE 절:

```ts
// 전
.eq('status', '정상').eq('sido_name', sido).eq('sigungu_name', sigungu)

// 후
.eq('status', '정상').eq('sigungu_code', sigunguCode)
```

유지된 것 — `DEFAULT_REGION_LIST_LIMIT`(1000), `REGION_LIST_COLUMNS`, `count: 'exact'`,
`order('name', { ascending: true })`, `vehicleOperation`/`services`/`ages` 필터 로직, 에러 throw 방식.
파라미터명은 같은 파일 `fetchDaycareNearby(sigunguCode, ...)`의 기존 컨벤션에 맞췄다.

JSDoc에 사각지대를 명시했다 — daycares 60,223건 중 `sigungus.arcode`에 없는 `sigungu_code`가
3개 코드(12110/12240/12300) 총 4건(0.0066%). 전남광주통합특별시 관련 데이터 오염이며 무시 확정.
칩 목록에 해당 시군구가 나타나지 않으므로 조회 자체가 도달하지 않는다.
`daycares.sigungu_code`는 varchar(10) NOT NULL, `sigungus.arcode`도 varchar라 캐스팅·null 체크 없음.

### `DaycareRegionListParams` (query-keys/daycare.query-keys.ts)

```ts
// 전
export type DaycareRegionListParams = {
    sido: string
    sigungu: string
    limit?: number
    vehicleOperation?: boolean
    services?: string[]
    ages?: number[]
}

// 후
export type DaycareRegionListParams = {
    /** sigungus.arcode와 동일한 값 공간의 시군구 코드 (daycares.sigungu_code) */
    sigunguCode: string
    limit?: number
    vehicleOperation?: boolean
    services?: string[]
    ages?: number[]
}
```

`daycareQueryKeys.regionList` 팩토리는 params 객체를 그대로 키에 담으므로 로직 변경 없음.
같은 파일 `DaycareNearbyParams.sigunguCode`(17번 줄)는 별개 용도라 손대지 않았다.

### `daycareQueryOptions.regionList` (query-options/daycare.query-options.ts)

```ts
// 전
queryFn: () => fetchDaycaresBySigungu(params.sido, params.sigungu, { ... })

// 후
queryFn: () => fetchDaycaresBySigungu(params.sigunguCode, { ... })
```

staleTime(1시간), limit 기본값 처리는 그대로.
prefetch↔hook은 같은 queryOptions를 공유하므로 queryKey 일치는 계속 보장된다.

## Phase 3에서 ui-engineer가 고쳐야 할 깨진 호출부

typecheck 에러 2건 + 타입 에러는 안 나지만 함께 고쳐야 하는 1건.

### 1. `apps/web/components/region/RegionDaycareList.tsx` — 타입 에러 (31번 줄)

```
error TS2353: Object literal may only specify known properties, and 'sido' does not exist in type 'DaycareRegionListParams'.
```

- `type Props = { sido: string; sigungu: string }` → `{ sigunguCode: string }`로 교체 (9-12번 줄).
- `useDaycareRegionList({ sido, sigungu, ... })` → `useDaycareRegionList({ sigunguCode, ... })` (30-36번 줄).
- 렌더링 로직은 sido/sigungu 이름을 화면에 쓰지 않으므로(카드는 name/typeName/address만) 그대로 두면 된다.

### 2. `apps/web/app/daycares/page.tsx` — 타입 에러 (128번 줄)

```
error TS2353: Object literal may only specify known properties, and 'sido' does not exist in type 'DaycareRegionListParams'.
```

`RegionSection`(121-137번 줄)이 `?sido=&sigungu=` 딥링크를 검증한 뒤
`daycarePrefetch.regionList({ sido, sigungu })`를 호출한다.
확정된 URL 설계(`?arcode=11680` 2단계 / `?sido=서울특별시` 1단계 배타 사용)에 맞춰
`searchParams` 읽기부터 prefetch 인자까지 함께 재작성해야 한다.
`fetchSigunguNames()`가 반환하는 `SigunguEntry[]`에 `arcode`가 이미 포함되어 있으므로
arcode → 엔트리 조회로 시도·시군구 이름을 역산하는 방식을 쓴다(접두 파싱 금지 — 코드 체계가 표준 행정코드와 어긋남).

### 3. `apps/web/components/region/SidoChipList.tsx` — 타입 에러는 없으나 반드시 함께 수정

87번 줄에서 `<RegionDaycareList sido={selectedSido} sigungu={selectedSigungu} />`를 렌더한다.
위 1번에서 Props가 바뀌면 여기서 타입 에러가 발생한다(현재는 RegionDaycareList가 아직 옛 Props를 갖고 있어 조용함).
- nuqs 파라미터를 `sigungu`(이름) → `arcode`(코드)로 교체 (33번 줄 `useQueryState('sigungu', ...)`).
- 칩 렌더링(64-73번 줄)에서 표시 텍스트는 `sigungu` 이름 유지, `onClick`은 `setArcodeParam(arcode)`로 변경.
- URL의 `arcode`로 선택 상태 역검증 (40번 줄의 이름 기반 검증 대체).

### 함께 확인해야 할 링크 생성부 (architect 스펙 지적 사항)

- `apps/web/components/daycare/detail/DaycareDetailView.tsx:206` — `?sido=&sigungu=` → `?arcode={detail.sigunguCode}` 단일 파라미터로 단순화. `DaycareDetail.sigunguCode`는 이미 존재한다.
- `apps/web/components/rankings/RankingsPageView.tsx:137` — `?sido=` 단독 링크. 1단계 상태이므로 **무수정**으로 계속 동작한다.

## typecheck 결과

```
> tsc --noEmit
app/daycares/page.tsx(128,70): error TS2353: ... 'sido' does not exist in type 'DaycareRegionListParams'.
components/region/RegionDaycareList.tsx(31,9): error TS2353: ... 'sido' does not exist in type 'DaycareRegionListParams'.
```

남은 에러 2건은 모두 `app/`과 `components/`에만 있다.
**도메인 레이어(`apps/web/domain/**`)는 타입 에러 0건으로 깨끗하다.**
두 에러는 Phase 3 작업 대상이며 예상된 상태다.

## 범위 밖으로 남겨둔 것

- `schema.sql`의 `idx_daycares_sido_sigungu_name` 인덱스 — 이번 교체로 앱 코드에서 미사용이 되지만 DDL 변경은 범위 밖이라 방치.
- region 도메인의 `apis/query-keys/query-options/hooks/prefetch` 레이어 부재 — React Query를 쓰지 않는 순수 서버 유틸이라 의도된 설계로 판단, 손대지 않음.
