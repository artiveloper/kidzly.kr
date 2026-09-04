# TODO — 지역별 어린이집 목록 kidsinfo 스타일 강화

> 참고: [kidsinfo.kr/nurseries](https://kidsinfo.kr/nurseries/) · [시군구 예시](https://kidsinfo.kr/nurseries/seoul/eunpyeonggu/)
> 두 저장소에 걸친 작업이다 — Phase 1은 `kidzly-sync`, Phase 2는 `kidzly.kr`.

## 배경 / 왜
지역별 어린이집 목록을 kidsinfo.kr 스타일로 강화한다. 채택 확정한 두 가지다.
1. **계층별 SEO 요약 문단** — 인덱스/시도/시군구 각 페이지에 곳수·유형분포·정원/현원·통학차량을 문장으로 서술한다. 현재 지역 페이지는 목록만 있고 크롤 가능한 서술 텍스트가 없어 SEO상 약하다.
2. **지역 곳수 노출** — 지역 네비에 곳수를 표기하고, 제목에도 곳수를 넣는다.

**제외 확정:** 전체 목록 정적 SSR(무한스크롤+필터 유지), 영문 슬러그(한글 경로 유지).

## 집계 소싱 결정 — kidzly-sync `region_stats` 머티리얼라이즈드 뷰
데이터는 **하루 1회(동기화 주기)만** 변하므로 런타임 집계 대신 사전 계산이 정답이다.
- 실측: 필터 없는 전체 count 337ms인데, `status=정상 AND sido_name=경기도` 콜드 count는 **3,038ms**(웜 250ms)다. 병렬 16개 동시 실행 시 간헐 HTTP 500이 났다.
- 원인: 현재 `daycares` 인덱스는 `idx_daycares_status`, `idx_daycares_sigungu_code`뿐이고 **`sido_name`/`(status, sido_name)` 복합 인덱스가 없다**.
- MV는 곳수뿐 아니라 유형분포·정원합·현원합·통학차량수까지 계층별로 미리 담는다. 웹은 작은 인덱스 조회 한 번으로 요약 문단과 곳수를 모두 얻고, 런타임 스캔·타임아웃·콜드스타트가 사라진다.

## 실측 검증 기준값 (은평구, status='정상')
| 지표 | 값 |
|------|-----|
| 총 곳수 | 166 |
| 국공립 / 민간 / 가정 | 94 / 36 / 27 |
| 법인·단체등 / 직장 / 협동 | 4 / 4 / 1 |
| 정원 합 | 8,486 |
| 현원 합 | 5,647 |
| 통학차량 운영 | 32 |

---

## Phase 1 — kidzly-sync
> `D:\sources\project\kidzly\kidzly-sync`. 그 repo의 CLAUDE.md·`kidzly-migration` 스킬 컨벤션을 따른다. Flyway 경로 `src/main/resources/db/migration/`, 현재 최신 V12 → **V13**.

- [ ] `V13__create_region_stats.sql` — `MATERIALIZED VIEW region_stats`
  - `status='정상'`만 집계. `GROUP BY GROUPING SETS ((sido_name), (sido_name, sigungu_code, sigungu_name))`로 시도·시군구 2계층을 한 뷰에 담는다.
  - 컬럼: `grain`(`'sido'|'sigungu'`), `sido_name`, `sigungu_code`(시도행 NULL), `sigungu_name`(시도행 NULL), `total_count`, `capacity_sum`, `current_child_sum`, `vehicle_count`, `type_counts jsonb`(예: `{"국공립":94,"민간":36,...}`).
  - `REFRESH ... CONCURRENTLY`를 쓰려면 **UNIQUE INDEX**가 필요하다: `(sido_name, coalesce(sigungu_code, ''))`.
  - `grant select on region_stats to anon;`
- [ ] 동기화 usecase의 daycares upsert 완료 지점 끝에 `REFRESH MATERIALIZED VIEW CONCURRENTLY region_stats` 호출 추가.
- [ ] 로컬 검증: 시도행 16 + 시군구행 약 277, 은평구 행이 위 기준값과 일치하는지 확인.

## Phase 2 — kidzly.kr (web)
> CLAUDE.md 도메인 구조 준수. 4공백, Server Component 우선, 날짜/포맷은 `lib/format.ts`.

- [ ] `apps/web/domain/region-stats/`(신규) 또는 `domain/region` 확장
  - `types/index.ts`: `RegionStat { total, capacitySum, currentChildSum, vehicleCount, typeCounts }`
  - `apis/region-stats.api.ts`: `fetchSidoStats()`, `fetchSigunguStats(sido)`, `fetchRegionStat(sido, sigunguCode?)` — `region_stats`에서 select. (Supabase 쿼리는 apis 레이어에서만, non-null assertion 금지)
  - `server.ts`(`import 'server-only'`): 일 단위 캐시 래핑(`createCachedServerClient` 또는 `unstable_cache`, revalidate ≈ 86400)
- [ ] `components/region/RegionSummary.tsx`(신규, Server Component) — 계층별 요약 문단 + 통계 카드
  - 인덱스: 전국 총합 + 시도 카드 곳수
  - 시도: 시도 요약 + 최다 시군구 + 시군구 곳수
  - 시군구: 유형분포·정원·현원·통학차량 문단 + 통계 카드
- [ ] `app/daycares/[[...region]]/page.tsx`: 통계 fetch 후 `RegionSummary` 렌더, 필요 시 title/description에 곳수 반영
- [ ] 곳수 UI 배치: `SidoChipList.tsx` / `SidoFilterChips.tsx`에 곳수 노출
- [ ] (선택) 구조화 데이터: 지역 목록에 `ItemList`/`Dataset` 검토

## 오픈 결정 (Phase 2 착수 전 확정)
- **곳수 노출 UI:** 기존 칩에 곳수 배지 추가 vs kidsinfo식 카드 그리드로 재구성.
- 시도 페이지 요약에 유형분포 문단까지 넣을지(상세도).
- 페이지 제목에 곳수 포함 여부.

## 검증 방법
- **kidzly-sync:** 마이그레이션 로컬 적용 → `select * from region_stats where sigungu_name='은평구'`가 기준값과 일치, `REFRESH ... CONCURRENTLY` 정상 동작.
- **web:** `pnpm lint` · `pnpm typecheck` · `pnpm build` 통과. 3계층 지역 페이지 렌더 및 곳수 표시 확인, kidsinfo와 근사한 수치.
