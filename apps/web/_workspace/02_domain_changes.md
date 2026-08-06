# 도메인 레이어 변경 사항 — "같은 지역 다른 어린이집" (`domain/daycare`)

> 범위: `01_refactor_spec.md`에 명시된 `domain/daycare/` 8개 파일 (신규 파일 없음, `server.ts` 제외 전 파일 수정)

## 변경 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `domain/daycare/types/index.ts` | `DaycareDetail.sigunguCode: string` 필드 추가(`sigunguName` 바로 아래), `DaycareNearbyItem` 타입 신규 추가(`DaycareAgeFilter` 위) |
| `domain/daycare/apis/daycare.api.ts` | `DETAIL_COLUMNS`에 `sigungu_code` 추가, `NEARBY_COLUMNS` 상수 신규, `fetchDaycareNearby(sigunguCode, excludeId, { limit = 10 })` 함수 신규 추가(throw 패턴), import에 `toDaycareNearbyItem`/`DaycareNearbyRow`/`DaycareNearbyItem` 추가 |
| `domain/daycare/parser/daycare.parser.ts` | `DaycareNearbyRow` 타입(Pick) 신규, `toDaycareNearbyItem()` 함수 신규, `toDaycareDetail()`에 `sigunguCode: row.sigungu_code` 매핑 한 줄 추가 |
| `domain/daycare/query-keys/daycare.query-keys.ts` | `DaycareNearbyParams` 타입 신규, `daycareQueryKeys.nearby(params)` 팩토리 추가 |
| `domain/daycare/query-options/daycare.query-options.ts` | `daycareQueryOptions.nearby(params)` 추가 (staleTime 1시간, ranking* 패턴 재사용), import에 `fetchDaycareNearby`/`DaycareNearbyParams` 추가 |
| `domain/daycare/hooks/daycare.hooks.ts` | `useDaycareNearby(params)` 훅 추가 (`useSuspenseQuery` 기반) |
| `domain/daycare/prefetch/daycare.prefetch.ts` | `daycarePrefetch.nearby(params)` 프리페처 추가, import에 `DaycareNearbyParams` 추가 |
| `domain/daycare/index.ts` | `DaycareNearbyItem`, `DaycareNearbyParams`, `useDaycareNearby` export 추가 |
| `domain/daycare/server.ts` | **변경 없음** — `daycarePrefetch` 전체를 이미 re-export 중이므로 `nearby` 자동 포함 확인 |

## 검증

- `npx tsc --noEmit` 실행 결과, `domain/daycare/*` 및 이를 참조하는 `components/daycare/*` 파일에서 타입 에러 없음 확인 (남은 에러는 `blog`/`mdx`/`velite` 관련 기존 이슈로 이번 작업과 무관)
- `fetchDaycareNearby`: `.limit(limit)` 호출 확인, `NEARBY_COLUMNS`로 필요한 컬럼(`daycare_code, name, type_name, address`)만 select, `.neq('daycare_code', excludeId)`로 현재 항목 제외, `.eq('status', '정상')` 필터, 에러 시 throw
- `useDaycareNearby`는 `useSuspenseQuery` 기반, inline queryKey/queryFn 없이 `daycareQueryOptions.nearby` 팩토리만 참조
- `non-null assertion(!)`, `any` 미사용. `row.sigungu_code`는 `DaycareRow`(lib/supabase/types.ts)상 `string`(not null)이라 단언 없이 직접 할당
- 4공백 들여쓰기 유지 (CLAUDE.md §15)

## 깨진 import 경고

- 없음. `domain/daycare` 외부에서 이번에 추가된 export(`DaycareNearbyItem`, `DaycareNearbyParams`, `useDaycareNearby`)를 아직 참조하는 코드가 없어 하위 호환성 문제 없음.
- 단, `components/daycare/detail/DaycareDetailSSR.tsx` / `DaycareDetailView.tsx`는 스펙상 ui-engineer가 `daycarePrefetch.nearby(...)`와 `useDaycareNearby(...)`를 새로 참조해야 하며, 이번 domain-engineer 작업 범위 밖이므로 아직 미수정 상태다 (UI 레이어 작업 대기).

## 스펙 대비 편차

없음 — `01_refactor_spec.md`에 명시된 시그니처·컬럼·필터 조건·에러 패턴을 그대로 구현했다.
