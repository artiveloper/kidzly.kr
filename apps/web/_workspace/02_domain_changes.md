# 02_domain_changes.md — 시군구 SEO 허브 페이지: 도메인 레이어 구현

`01_refactor_spec.md`의 "신규/수정 파일" 중 `domain/region`, `domain/daycare` 범위만 구현.
`npx tsc --noEmit` 통과 확인 완료 (exit 0, 신규/기존 코드 모두 에러 없음).

## 신규 — `domain/region/`

region 도메인은 스펙 설계대로 `apis/parser/query-keys/query-options/hooks/prefetch` 8계층을
채우지 않음(자체 테이블 없음 + 빌드타임/SSR 전용이라 React Query가 소비하지 않음).

| 파일 | 내용 |
|---|---|
| `domain/region/types/index.ts` (신규) | `SigunguDirectoryEntry = { sido, sigungu, count }` |
| `domain/region/server.ts` (신규, `import 'server-only'`) | `fetchSigunguDirectory()` (전국 스캔), `fetchSigunguListBySido(sido)` (시도 스코프 스캔). 둘 다 내부 `scanRegionRows()`가 `domain/daycare/server`의 `fetchDaycareRegionRowsPaginated`를 1,000건 배치로 반복 호출해 전량 수집한 뒤, 내부 `aggregate()`가 `Map<"sido|sigungu", entry>`로 집계·건수 카운트·가나다순 정렬(`localeCompare('ko')`). `sido`/`sigungu` 중 하나라도 null인 행은 집계에서 제외. |
| `domain/region/index.ts` (수정) | 최상단에 `export type { SigunguDirectoryEntry } from './types'` 추가. 하단에 `buildRegionPath(sido, sigungu)` 헬퍼 추가 — `/region/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}` 반환. 기존 `SIDO_LIST`/`Sido`/`SIDO_SHORT`/`getSidoShort`/`formatLocation`/`isValidSido`는 그대로 유지(다른 파일 22곳에서 참조 중이라 시그니처 변경 없이 순수 추가만 진행). |

## 수정 — `domain/daycare/`

기존 `nearby`/`ranking*` 8계층 패턴을 그대로 복제해 `regionList` 계열 추가.

| 파일 | 변경 내용 |
|---|---|
| `types/index.ts` | `DaycareRegionListItem = { id, name, typeName, address }`, `DaycareRegionListResult = { items, totalCount }`, `DEFAULT_REGION_LIST_LIMIT = 72` 추가 (기존 `DaycareNearbyItem` 바로 아래). |
| `parser/daycare.parser.ts` | `DaycareRegionRow = Pick<DaycareRow, 'daycare_code'\|'name'\|'type_name'\|'address'>` (`DaycareNearbyRow`와 동일 컬럼셋이지만 스펙 지시대로 별도 타입/함수로 분리), `toDaycareRegionListItem(row)` 파서 추가. |
| `apis/daycare.api.ts` | ① `fetchDaycaresBySigungu(sido, sigungu, { limit = DEFAULT_REGION_LIST_LIMIT })` — `sido_name`+`sigungu_name` **문자열 조합**으로 `eq` 필터링(sigungu_code 미사용), `status='정상'`, `order('name', asc)`, `select(..., { count: 'exact' })`로 총 건수 동시 반환, `createSupabaseClient()`(isServer 분기)로 서버/클라 양쪽에서 재사용. 에러는 throw(기존 `fetchDaycareNearby`/`fetchDaycareDetail`과 동일 패턴). ② `fetchDaycareRegionRowsPaginated({ offset, limit, sido? })` — `sitemap.ts`의 `fetchDaycareIdsPaginated`와 동일한 offset/limit range 배치 패턴, `select('sido_name, sigungu_name')`만 조회, `createServerClient()` 직접 사용(build-time 전용), 에러 시 콘솔 로그 후 빈 배열 반환(throw 아님 — `fetchDaycareIdsPaginated`와 동일하게 sitemap/디렉토리 생성이 부분 실패해도 빌드가 죽지 않도록). `DaycareRegionScanRow = Pick<DaycareRow, 'sido_name'\|'sigungu_name'>`로 캐스팅. |
| `query-keys/daycare.query-keys.ts` | `DaycareRegionListParams = { sido, sigungu, limit? }` 타입, `regionList: (params) => [...all, 'regionList', params] as const` 키 팩토리 추가. |
| `query-options/daycare.query-options.ts` | `regionList: (params) => ({ queryKey: daycareQueryKeys.regionList(params), queryFn: () => fetchDaycaresBySigungu(...), staleTime: 60*60*1000 })` — `nearby`/`ranking*`과 동일하게 준정적 리스트로 취급해 1시간 staleTime. |
| `hooks/daycare.hooks.ts` | `useDaycareRegionList(params: DaycareRegionListParams)` — `useSuspenseQuery(daycareQueryOptions.regionList(params))`. |
| `prefetch/daycare.prefetch.ts` | `regionList(params)` — `queryClient.prefetchQuery(daycareQueryOptions.regionList(params))`. |
| `index.ts` | `DaycareRegionListItem`, `DaycareRegionListResult` 타입, `DEFAULT_REGION_LIST_LIMIT` 상수, `DaycareRegionListParams` 타입, `useDaycareRegionList` 훅 export 추가. |
| `server.ts` | `fetchDaycareRegionRowsPaginated` export 추가(region 도메인의 배치 스캔용 — `daycarePrefetch`엔 이미 `regionList`가 포함되므로 별도 export 불필요), `fetchDaycaresBySigungu` export 추가(`fetchDaycareDetail`과 동일 이유로 `generateMetadata`/`totalCount===0` → `notFound()` 판단에 UI 레이어가 직접 호출할 수 있도록). |

## 핵심 설계 준수 확인

- 그룹핑/필터 키는 전 구간 `sido_name`+`sigungu_name` 문자열 조합만 사용, `sigungus`/`sigungu_code` 미사용(기존 `fetchDaycareNearby`만 `sigungu_code` 사용 — 이건 스펙 범위 밖이라 그대로 둠).
- non-null assertion(`!`), `any` 없음. `type` 사용. 에러는 throw(단, `fetchDaycareRegionRowsPaginated`는 기존 `fetchDaycareIdsPaginated`와 동일하게 빌드타임 배치 스캔 특성상 콘솔 로그 후 빈 배열 — 기존 컨벤션 그대로 복제).
- `limit` 필수 파라미터(기본값 있음), 필요한 컬럼만 select.
- prefetch queryKey = hook queryKey (동일 `daycareQueryOptions.regionList` 재사용으로 보장).

## 깨진 import 경고

없음. `npx tsc --noEmit` 전체 통과(0 errors). 기존 22개 파일에서 `@/domain/region` 또는
`@/domain/daycare*`를 참조 중이나 모두 기존 export를 그대로 유지한 채 추가만 했으므로 영향 없음.

## 이번 세션에서 다루지 않은 것 (스펙상 범위 밖, UI/라우트 레이어)

- `app/region/[sido]/[sigungu]/page.tsx`, `loading.tsx`
- `components/region/*` (`RegionHubPageView`, `RegionDaycareList` 등)
- `components/rankings/SigunguLinksSection.tsx`, `RankingsPageView.tsx` 수정
- `components/common/Breadcrumb.tsx`
- `app/sitemap.ts`의 `/region/*` 엔트리 추가

위 항목은 `fetchSigunguDirectory`/`fetchSigunguListBySido`/`useDaycareRegionList`/
`daycarePrefetch.regionList`/`buildRegionPath`를 그대로 소비하면 되도록 이번 도메인 레이어를
설계함.
