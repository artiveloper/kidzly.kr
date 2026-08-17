# 리팩토링 명세 — 지역별(시도/시군구) 어린이집 찾기 칩 필터 (sigungu_code 기반 전환)

## 요약

- **범위**: 전체 코드베이스 감사가 아니라, 이번 요청(지역별 칩 필터를 sigungu_code 조인 방식으로 전환)에 한정.
- **핵심 발견**: "지역별 어린이집 찾기 칩 필터"는 **이미 구현되어 있다.** `/daycares` 페이지의 "지역별" 탭이 시도 → 시군구 2단계 칩 UI, nuqs URL 상태, Suspense/ErrorBoundary, Skeleton까지 CLAUDE.md 스펙에 맞게 갖추고 있다. 따라서 이번 작업은 **신규 UI 구축이 아니라, 기존 기능의 데이터 조회 방식을 (sido_name, sigungu_name) 문자열 매칭 → sigungu_code(arcode) 코드 조인으로 교체하는 데이터 레이어 마이그레이션**이다.
- **`fetchDaycaresBySigungu` 사용처**: 코드베이스 전체에서 `daycareQueryOptions.regionList`의 queryFn 한 곳뿐. 다른 페이지·컴포넌트에서 재사용되지 않으므로, 병행 유지 없이 **직접 교체(in-place 시그니처 변경)**해도 기존 동작을 깨뜨릴 위험이 없다 (CLAUDE.md §3 외과적 변경 원칙 충족).
- 발견된 위반: P0 0개, P1 0개 — 순수 CLAUDE.md 위반은 없음. 이번 명세는 "위반 수정"이 아니라 **기능 요구사항에 따른 설계 변경 작업 목록**이다.

## 현재 상태 (파일별 확인 완료)

### 라우트 / UI
- `apps/web/app/daycares/page.tsx` — `/daycares` 목록 페이지. `tab=region|upcoming` 쿼리로 탭 전환. `region` 탭이 이번 기능의 본체.
  - `RegionSection()`: `fetchSigunguNames()`로 시군구 전체 목록을 가져와 시도별로 그룹핑(`groupBySido`) 후 `SidoChipList`에 props로 전달.
  - `?sido=&sigungu=` 딥링크 진입 시 `daycarePrefetch.regionList({ sido, sigungu })`로 초기 prefetch.
- `apps/web/components/region/SidoChipList.tsx` (Client) — 시도 칩 → (선택 시) 시군구 칩 2단계 전환. 선택 상태는 nuqs(`sido`, `sigungu` — **문자열 이름** 파라미터)로 URL에 동기화. 시군구까지 선택되면 `DaycareFilters` + `RegionDaycareList`를 렌더링.
- `apps/web/components/region/RegionDaycareList.tsx` (Client) — `useDaycareRegionList({ sido, sigungu, ...filters })` 호출, 결과 카드 그리드 렌더링. type 필터는 클라이언트에서 추가 필터링(기존 정책, 유지).
- `apps/web/components/region/RegionDaycareListSkeleton.tsx`, `RegionDaycareListError.tsx` — 이미 최종 레이아웃 크기에 맞춘 Skeleton, 사용자 친화 에러 메시지. ✅ 준수.
- `apps/web/components/common/SidoFilterChips.tsx` — 시도 칩 공용 컴포넌트(rankings 탭과 공유). 변경 불필요.

### 도메인 레이어
- `apps/web/domain/daycare/apis/daycare.api.ts:170-214` `fetchDaycaresBySigungu(sido, sigungu, options)` — `.eq('sido_name', sido).eq('sigungu_name', sigungu)`로 필터링. JSDoc에 "sigungu_code 대신 (sido_name, sigungu_name) 조합으로 필터링 (sigungus 참조 테이블 신뢰 불가)"라고 명시 — **이번 결정과 상충하므로 갱신 필요**.
- `apps/web/domain/daycare/apis/daycare.api.ts:452-467` `fetchSigungus()` — `sigungus` 테이블에서 `arcode, sidoname, sigunname`을 이미 select하고 있음. **arcode는 이미 쿼리되고 있으나 상위 레이어(region 도메인)에서 버려지고 있음.**
- `apps/web/domain/daycare/apis/daycare.api.ts:127-160` `fetchDaycareNearby(sigunguCode, excludeId, origin, options)` — 같은 시군구 어린이집을 `sigungu_code`로 조회하는 기존 선례. **네이밍 컨벤션 참고 대상**(아래 결정 참고).
- `apps/web/domain/daycare/query-keys/daycare.query-keys.ts:25-32` `DaycareRegionListParams = { sido, sigungu, limit?, vehicleOperation?, services?, ages? }`.
- `apps/web/domain/daycare/query-options/daycare.query-options.ts:90-100` `regionList` — `fetchDaycaresBySigungu(params.sido, params.sigungu, {...})` 호출.
- `apps/web/domain/daycare/hooks/daycare.hooks.ts:47-49` `useDaycareRegionList(params)` — `useSuspenseQuery(daycareQueryOptions.regionList(params))`. ✅ v5 패턴 준수.
- `apps/web/domain/daycare/prefetch/daycare.prefetch.ts:63-67` `daycarePrefetch.regionList(params)` — queryOptions 재사용으로 prefetch↔hook queryKey 일치. ✅ 준수. params 타입만 따라 바뀌면 코드 변경 불필요.
- `apps/web/domain/daycare/server.ts:8` `fetchDaycaresBySigungu` re-export, 주석 "daycareQueryOptions.regionList(useDaycareRegionList)의 queryFn에서 사용 — /daycares 지역별 탭" — 정확, 유지.
- `apps/web/domain/daycare/index.ts` — client-safe entry. 변경 불필요(타입 이름 유지 시).

### region 도메인
- `apps/web/domain/region/types/index.ts` — `SigunguEntry = { sido: string; sigungu: string }`. **arcode 필드 없음 — 추가 필요.**
- `apps/web/domain/region/server.ts:6-9` 주석 — "참조 테이블이 최신 daycares 데이터와 어긋날 수 있어(폐원·행정구역 변경 등) 등록된 어린이집이 없는 시군구가 섞여 들어올 수 있다"는 **칩 목록(이름 나열) 자체에 대한 설명이라 계속 유효**하다(이 우려는 그대로 남음: sigungu_code로 조인해도 daycares에 매칭이 없는 시군구는 여전히 빈 결과가 나올 수 있음). 다만 사용자 확정 사실(코드 불일치 4건, 0.0066%, 무시 가능)을 반영해 **sigungu_code 조인 시의 사각지대 규모를 구체적으로 명시**하도록 갱신 필요 (요구사항 4).
- `apps/web/domain/region/index.ts` — `SIDO_LIST`, `SIDO_SHORT`, `getSidoShort`, `formatLocation`, `isValidSido`. 변경 불필요.
- region 도메인은 `apis/`, `query-keys/`, `query-options/`, `hooks/`, `prefetch/` 레이어가 없음 — CLAUDE.md §12 레이어 표와 다름. **이번 기능과 무관한 기존 구조이며, 실제 데이터 패칭은 daycare 도메인(`fetchSigungus`)에 위임하고 region은 서버 컴포넌트에서 직접 호출되는 순수 서버 유틸(React Query 미사용)이라 구조적 위반이 아니라 의도된 설계로 판단.** 이번 작업 범위에서 손대지 않음 — domain-engineer가 별도로 문제 삼지 않는 한 그대로 둔다.

### DB 스키마 확인 (schema.sql 직접 대조)
- `daycares.sigungu_code varchar(10) not null` — null 걱정 없음.
- `daycares.sido_name`, `sigungu_name` — nullable.
- 인덱스: `idx_daycares_sigungu_code (sigungu_code)`, `idx_daycares_sigungu_status (sigungu_code, status)` — 둘 다 존재, 사용자 설명과 일치.
- `idx_daycares_sido_sigungu_name (sido_name, sigungu_name, name) WHERE status='정상'` — 기존 `fetchDaycaresBySigungu`가 사용하던 인덱스. 이번 교체 후 앱 코드에서는 더 이상 이 인덱스를 타는 쿼리가 없어짐. **DDL 삭제는 이번 작업 범위 밖**(요청되지 않았고, 데이터베이스 마이그레이션은 별도 승인 필요 — 언급만 하고 방치).
- `sigungus.arcode varchar(10) primary key`, `sidoname`, `sigunname` — `daycares.sigungu_code`와 동일 타입(`varchar`)이라 조인 시 타입 캐스팅 불필요.

## 결정 사항 (승인 필요 — 코딩 전 확인)

### 결정 1 — 함수 시그니처: 교체 vs 병행
**권장: 교체.** `fetchDaycaresBySigungu`의 유일한 호출부가 `daycareQueryOptions.regionList` 하나뿐이므로 병행 유지는 불필요한 복잡도만 추가한다(CLAUDE.md §2 단순함 우선). 함수명은 그대로 `fetchDaycaresBySigungu`를 유지하되, 시그니처를 `(sigunguCode: string, options)`로 변경 — 같은 파일의 `fetchDaycareNearby(sigunguCode, ...)`와 파라미터명 컨벤션을 맞춘다.

- 변경 전: `fetchDaycaresBySigungu(sido: string, sigungu: string, options)`
- 변경 후: `fetchDaycaresBySigungu(sigunguCode: string, options)`
- 쿼리: `.eq('status', '정상').eq('sigungu_code', sigunguCode)` (`sido_name`/`sigungu_name` eq 제거)
- JSDoc 갱신 — "sigungu_code(=sigungus.arcode) 기반 조인. daycares.sigungu_code 중 sigungus.arcode에 없는 코드가 4건(0.0066%, 전남광주통합특별시 관련 데이터 오염) 존재하나 무시 가능 수준으로 판단해 별도 처리하지 않음" 명시.

### 결정 2 — URL 상태 파라미터: 이름 유지 vs arcode로 교체
현재 URL은 `?sido=서울특별시&sigungu=강남구` (사람이 읽을 수 있는 이름). 요구사항 3의 "(arcode)"가 URL 파라미터 자체를 arcode 값으로 바꾸라는 뜻인지, 선택 상태의 내부 식별자가 arcode라는 뜻인지 문면상 확정하기 어려움.

**권장: URL 파라미터는 `sido`/`sigungu` 이름 문자열로 유지.** 근거:
- 기존에 공유·색인된 URL(`/daycares?sido=...&sigungu=...`)을 깨뜨리지 않는다(외과적 변경 원칙, SEO 하네스와도 충돌 없음).
- `SigunguEntry`에 `arcode` 필드를 추가하면 `SidoChipList`가 선택된 시군구 이름으로 목록에서 엔트리를 찾아 **내부적으로만** arcode를 조회해 `useDaycareRegionList({ sigunguCode })`에 넘길 수 있다. URL은 그대로, 쿼리 키·API 조인만 코드 기반으로 바뀐다.
- 이름이 사람이 읽기 좋고, 딥링크 미리보기/디버깅에도 유리하다.

**대안(비권장이지만 명시)**: URL을 `?arcode=11680` 형태로 바꾸면 이름→코드 매핑 조회가 필요 없어져 코드는 더 단순해지지만, 기존 URL과 호환되지 않고 사람이 읽을 수 없다. 이 옵션을 원하면 이번 스펙의 결정 2를 뒤집어야 하며, 그 경우 `SidoChipList`/`RegionDaycareList`/`page.tsx`의 nuqs 파라미터 이름과 breadcrumb 로직도 함께 다시 설계해야 한다.

### 결정 2 — 확정 (사용자 승인, 오케스트레이터 조정)

**사용자가 "arcode로 교체"를 선택했다.** 다만 오케스트레이터가 링크 참조처를 추가 조사한 결과, architect의 원안(arcode 단일 파라미터)은 그대로 적용할 수 없어 다음과 같이 조정한다.

추가 발견 — `/daycares?sido=...` URL을 거는 내부 링크가 2곳 존재한다(architect 스펙에 누락됨):
- `apps/web/components/daycare/detail/DaycareDetailView.tsx:206` — `?sido={sidoName}&sigungu={sigunguName}` (상세 → 해당 시군구 목록)
- `apps/web/components/rankings/RankingsPageView.tsx:137` — `?sido={sido}` **만** (랭킹 → 해당 시도의 시군구 칩 화면, 시군구 미선택 상태)

`arcode` 단일 파라미터로 완전 대체하면 위 랭킹 링크가 표현하는 **"시도만 선택된 1단계 상태"를 URL로 나타낼 수 없다** (sigungus 테이블에는 시도 단위 코드가 없고 arcode는 시군구 단위다).

**확정안 (사용자 추가 지적 반영, 최종)**: `sido`와 `arcode`를 **배타적으로** 사용한다. 둘을 동시에 URL에 붙이지 않는다.

사용자 지적 — arcode를 넘기면 시도까지 알 수 있으므로 `?sido=...&arcode=...`는 중복이다. 맞다. 단 근거는 "arcode 앞 2자리를 잘라 시도코드를 파싱한다"가 **아니다**. 이 데이터의 코드 체계는 표준 행정코드와 어긋난 흔적이 있어(목포시=12110, 광주 북구=29170) 접두 파싱은 신뢰할 수 없다. 대신 `fetchSigunguNames()`가 반환하는 `SigunguEntry[]`가 이미 `{ sido, sigungu, arcode }`를 모두 들고 있으므로, **arcode로 엔트리를 조회하면 시도·시군구 이름이 함께 나온다**. 이 조회 방식으로 역산한다.

- **2단계(시군구까지 선택)**: `/daycares?arcode=11680` — 이 하나로 충분. 시도·시군구 이름은 엔트리 조회로 얻는다.
- **1단계(시도만 선택)**: `/daycares?sido=서울특별시` — 이 상태는 선택된 시군구가 없어 arcode가 존재하지 않으므로 `sido` 파라미터가 계속 필요하다. `RankingsPageView.tsx:137`이 거는 링크가 정확히 이 케이스이며 **무수정**으로 계속 동작한다.
- `DaycareDetailView.tsx:206` 링크는 `?arcode={detail.sigunguCode}` **단일 파라미터**로 단순해진다(이름 2개를 encodeURIComponent로 넘기던 코드가 사라짐). `DaycareDetail` 타입에 `sigunguCode`가 이미 있다(`apps/web/domain/daycare/types/index.ts:26`, parser 매핑은 `daycare.parser.ts:165`).
- 확정된 사각지대 4건(코드 12110/12240/12300)은 arcode 조회가 실패하므로 1단계 화면으로 폴백된다 — 무시하기로 확정한 범위 내라 별도 처리하지 않는다.
- `SigunguEntry`에 `arcode` 추가는 원안대로 필요하다 — `SidoChipList`가 칩 렌더링 시 `arcode`를 URL에 쓰고, URL의 `arcode`로 선택 상태를 역검증해야 하기 때문.

→ **domain-engineer/ui-engineer는 이 확정안(`sido` 이름 유지 + `sigungu` → `arcode` 교체)으로 진행**한다. 아래 "작업 목록"에서 결정 2 관련 항목은 이 절이 우선한다.

## 작업 목록

### domain/region
- [ ] `types/index.ts`: `SigunguEntry`에 `arcode: string` 필드 추가 (sigungus.arcode, daycares.sigungu_code와 동일 값 공간).
- [ ] `server.ts`: `fetchSigunguNames()` 매핑에 `arcode: row.arcode` 추가.
- [ ] `server.ts`: 상단 JSDoc 주석 갱신 — "sigungus 참조 테이블 신뢰 불가"라는 기존 문구는 칩 목록(이름) 자체에는 여전히 유효하므로 유지하되, sigungu_code 조인 시 daycares.sigungu_code가 sigungus.arcode에 없는 사각지대가 4건(0.0066%, 전남광주통합특별시 데이터 오염) 존재하며 데이터 수정 없이 무시하기로 확정했다는 내용을 추가.

### domain/daycare
- [ ] `apis/daycare.api.ts`: `fetchDaycaresBySigungu(sido, sigungu, options)` → `fetchDaycaresBySigungu(sigunguCode, options)`로 시그니처 변경. `.eq('sido_name', sido).eq('sigungu_name', sigungu)` → `.eq('sigungu_code', sigunguCode)`. JSDoc 갱신(결정 1 내용 반영).
- [ ] `query-keys/daycare.query-keys.ts`: `DaycareRegionListParams`에서 `sido: string; sigungu: string` 제거 → `sigunguCode: string` 추가. `regionList` 쿼리키 팩토리는 params 구조 변경만 따라가면 되므로 로직 변경 불필요(팩토리가 params 객체를 그대로 키에 포함).
- [ ] `query-options/daycare.query-options.ts`: `regionList` queryFn을 `fetchDaycaresBySigungu(params.sigunguCode, {...})`로 변경.
- [ ] `hooks/daycare.hooks.ts`, `prefetch/daycare.prefetch.ts`, `index.ts`, `server.ts`: 타입 재수출만 하고 있어 **코드 변경 불필요** — `DaycareRegionListParams` 타입이 바뀌면 자동 반영됨. server.ts의 `fetchDaycaresBySigungu` re-export 주석은 그대로 유효.

### components/region
- [ ] `SidoChipList.tsx`: `sigunguBySido: Record<string, SigunguEntry[]>`의 각 엔트리가 이제 `arcode`를 포함. 시군구 선택 시(`selectedSigungu` 확정 지점) 매칭되는 엔트리에서 `arcode`를 조회해 `RegionDaycareList`에 `sigunguCode` prop으로 전달(`sido`/`sigungu` 이름 prop은 뒤 결정 2에 따라 표시·URL 동기화 목적으로는 계속 보유 가능하나, 데이터 조회용으로는 더 이상 넘기지 않음).
- [ ] `RegionDaycareList.tsx`: props를 `{ sido, sigungu }` → `{ sigunguCode: string }`로 변경(현재 sido/sigungu 이름은 렌더링에 쓰이지 않으므로 완전 교체 가능 — 확인 완료, 카드에는 name/typeName/address만 표시). `useDaycareRegionList({ sigunguCode, vehicleOperation, services, ages })` 호출로 변경.

### apps/web/app/daycares/page.tsx
- [ ] `RegionSection`: `?sido=&sigungu=` 딥링크 검증 로직은 그대로(이름 기반 유지, 결정 2). 유효성 확인 후 `daycarePrefetch.regionList({ sigunguCode: <매칭된 entry.arcode>, ... })` 호출로 변경 — `sigunguBySido[sido].find((e) => e.sigungu === sigungu)?.arcode` 조회 필요.

### 영향 없음 (변경 불필요, 확인만 완료)
- `apps/web/components/common/SidoFilterChips.tsx` — 순수 표시용 공용 칩, 변경 불필요.
- `apps/web/components/daycare/list/filters/DaycareFilters.tsx` 및 하위 필터 컴포넌트 — sido/sigungu와 무관.
- `apps/web/domain/daycare/parser/daycare.parser.ts`의 `toDaycareRegionListItem`/`DaycareRegionRow` — select 컬럼(`daycare_code, name, type_name, address`)에 sido/sigungu 관련 컬럼 없음, 변경 불필요.
- `apps/web/app/rankings/[sido]` — 별도 기능(시도 단위 랭킹), `sido` 문자열만 사용하고 `fetchDaycaresBySigungu`/`regionList`를 참조하지 않음. 이번 변경과 무관 — 건드리지 않음.
- `schema.sql`의 `idx_daycares_sido_sigungu_name` 인덱스 — 이번 교체 후 앱 코드에서 미사용 상태가 되나, DDL 변경은 요청 범위 밖. 언급만 하고 방치.

## 우선순위

이번 작업은 위반 수정이 아니라 기능 요구사항 구현이므로 P0/P1/P2 대신 실행 순서로 정리한다.

1. domain/region (arcode 필드 추가) — 아래 단계의 전제조건.
2. domain/daycare (api·query-keys·query-options 시그니처 교체) — region 변경과 독립적으로 병행 가능하나 통합 테스트는 region 이후.
3. components/region + app/daycares/page.tsx (prop/호출 갱신).
4. 검증: `/daycares` 지역별 탭에서 임의 시도 → 시군구 선택 시 목록이 기존과 동일하게 나오는지 수동 확인(특히 사용자 확정 4건 오염 지역: 코드 12110/12240/12300에 매칭되는 시군구가 있다면 그 시군구만 빈 목록이 되는지 별도 확인), `pnpm lint` / `pnpm typecheck` / `pnpm build` 통과.

## domain-engineer 전달 컨텍스트

- `fetchDaycaresBySigungu`는 유일한 호출부(`daycareQueryOptions.regionList`)만 존재 — 안심하고 시그니처를 직접 바꿔도 된다. 다른 곳에서 `(sido, sigungu)` 2-string 형태로 호출하는 곳은 없다(전체 grep 확인 완료).
- `fetchDaycareNearby`가 이미 같은 파일에서 `sigunguCode: string` 파라미터명을 쓰고 있으니 새 시그니처도 그 이름을 그대로 따라간다.
- `sigungus.arcode`와 `daycares.sigungu_code`는 스키마상 둘 다 `varchar` — 타입 캐스팅 없이 바로 `.eq()` 비교 가능(schema.sql 확인 완료).
- `daycares.sigungu_code`는 `not null` — null 체크 로직 불필요.
- `DEFAULT_REGION_LIST_LIMIT`(1000), `REGION_LIST_COLUMNS`는 그대로 재사용 — 이번 변경은 WHERE 절만 바뀐다.
- region 도메인은 `apis/query-keys/query-options/hooks/prefetch` 레이어가 없는 게 정상이다(React Query를 쓰지 않는 순수 서버 유틸) — 이번 작업 범위에서 새로 만들 필요 없음.

## ui-engineer 전달 컨텍스트

- 새 컴포넌트를 만드는 작업이 아니다. `SidoChipList`(시도→시군구 2단계 칩)와 `RegionDaycareList`(결과 카드 그리드), 스켈레톤·에러 컴포넌트가 이미 CLAUDE.md 스펙(Suspense 경계, mobile-first 그리드 `grid-cols-1 sm:grid-cols-2`, 최소 44px 터치 타겟 `min-h-11`, Skeleton 크기 일치)에 맞게 구현돼 있다. ✅ 준수.
- 변경은 딱 하나: `RegionDaycareList`가 받는 prop이 `{ sido, sigungu }`에서 `{ sigunguCode }`로 바뀐다. 렌더링 로직(카드 마크업, 빈 상태 문구, totalCount 안내문)은 전혀 손댈 필요 없음 — 이 컴포넌트는 sido/sigungu 이름을 화면에 표시한 적이 없다(카드에는 name/typeName/address만 출력).
- `SidoChipList`의 칩 표시 텍스트·URL 동기화(`sido`/`sigungu` nuqs 파라미터)는 그대로 유지(결정 2). 추가되는 로직은 "선택된 시군구 이름에 대응하는 arcode를 `sigunguBySido` 맵에서 찾아 `RegionDaycareList`에 넘기는" 한 줄 수준의 조회뿐.
- hover 의존 인터랙션 없음(버튼 탭 기반), 이미 mobile-first. 추가 접근성/반응형 작업 불필요.
