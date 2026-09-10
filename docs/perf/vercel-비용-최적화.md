# Vercel 비용 최적화 기록

2026년 8월 말~9월 초 Vercel Functions **Fluid Provisioned Memory**가 평소 ~5GB Hrs에서 최대 780GB까지 치솟은 사고의 원인 분석과 대응 기록이다. 같은 실수를 반복하지 않기 위한 배경·조치·주의사항·TODO를 남긴다.

---

## 1. 원인 요약

코드 버그가 아니라 **"색인 가능한 URL을 대량으로 개방 → 크롤러가 캐시 안 된 함수 수만 개를 깨움"** 이 반복된 것이다.

- `daycare/[id]` 상세 24,000여 건을 on-demand ISR(`revalidate=3600`, `generateStaticParams` 빈 배열)로 바꾼 뒤, 그 페이지들로 가는 크롤 경로를 계속 새로 열었다.
- Fluid의 **Provisioned Memory**는 `함수 메모리 × 요청 지속시간`의 총합이다. 함수가 Supabase 왕복을 **기다리는 동안에도 과금**된다. 크롤러가 콜드 상태 URL 수만 개를 훑을 때마다 그만큼 함수 실행·대기 시간이 쌓인다.

### 날짜별 인과관계

| 시점 | 관측 메모리 | 유발 사건 |
|------|------------|-----------|
| ~8/28 | ~5GB (기준선) | 상세가 아직 노출 전 |
| 8/25 | — | `a51eda4` 상세 24,000건 → on-demand ISR 전환 |
| 8/26 | — | `89ceef2` 지역 페이지 색인화 + `RegionDirectory`로 277개 시군구 크롤 경로 개방, 사이트맵 24,635→24,912 |
| 8/29~30 | 급상승 | 구글봇이 새로 열린 허브를 타고 상세 대량 수집 시작 |
| 8/31 | 108GB | 1차 크롤 파도 정점. 사이트맵이 `offset=17000`에서 statement timeout으로 반복 실패(`ce2ce78`로 당일 수정)해 장시간 함수가 메모리 점유 |
| 9/2 | ~5GB 복귀 | 크롤 예산 소진 + 캐시 워밍 + 사이트맵 수정으로 진정 |
| 9/3 | — | `9d5d3d2`/`fac7772`/`d13a0ef`/`fedfaa6` — 경로형 지역 URL 이전, `/daycares/upcoming` 분리, `playgrounds` 신규 도메인, rankings 경로 페이지. 수만 개의 콜드 URL 신설 + 사이트맵 구조 변경 → 전면 재크롤 |
| 9/5~6 | — | `f610821`/`e578892` 신규 블로그 발행 → 사이트맵 또 변경 → 재크롤 |
| 9/6~9 | 250~780GB | 9/3 신규 경로 + 반복된 사이트맵 변경이 겹쳐 콜드 URL 수만 개 재수집. 각 요청이 Supabase 왕복 대기 → GB-시간 폭발 |

8월 말·9월 초 두 스파이크는 같은 메커니즘의 두 파도다. 9월이 큰 이유는 9/3 URL 구조 교체로 캐시가 전부 무효화되고 새 URL이 전부 콜드였기 때문이다.

---

## 2. 적용한 조치

| # | 조치 | 대상 비용 | 커밋 |
|---|------|-----------|------|
| 1 | 데이터 기반 페이지 ISR `revalidate` 1h→24h | Provisioned Memory, ISR Writes | `cdb8094` |
| 2 | robots.txt에서 필터·레거시 쿼리 URL 크롤 차단 | Provisioned Memory (지역 동적 렌더) | `2c5172d` |
| 3 | 상세 페이지 중복 조회 제거 + 독립 쿼리 병렬화 | Active CPU, Provisioned Memory, DB 부하 | `50dff88` |

### 조치 1 — ISR 재생성 주기 24시간

데이터는 하루 1회(새벽 3시경) kidzly-sync가 갱신한다. `revalidate=3600`(1h)이면 동기화와 무관하게 매 시간 재생성 자격이 생겨, 크롤러 재방문마다 함수가 다시 떴다. 24h로 맞춰 정확성 손실 없이 재생성 빈도를 최대 24배 줄인다.

적용 대상: `app/page.tsx`(홈), `app/daycare/[id]`, `app/daycares/[[...region]]`, `app/daycares/upcoming`, `app/rankings`, `app/rankings/[sido]`, `app/sitemap.ts`.

### 조치 2 — robots.txt 쿼리 크롤 차단

지역 목록 `/daycares/[[...region]]`는 `searchParams`(필터)를 읽어 동적 렌더된다. 크롤러가 지역 칩에 달린 필터 조합(`type/age/services/vehicle`)과 경로형 이전 전 레거시 파라미터(`tab/sido/arcode`)를 따라가면 캐시 안 된 함수가 그 수만큼 뜬다. 이 URL들은 canonical이 전부 경로형 지역 URL로 합쳐져 색인 가치가 없으므로, 색인 대상(경로형 지역 페이지) 크롤은 두고 쿼리 파라미터 크롤만 막았다.

### 조치 3 — 상세 중복 조회 제거 + 병렬화

- 상세 렌더가 같은 행을 `getCachedDaycareDetail`(React `cache()`)과 `prefetchQuery`(React Query)로 **두 번** 조회하고 있었다. 두 캐시가 서로 달라 dedup되지 않았다. 이미 조회한 객체를 `setQueryData`로 시딩하는 `daycarePrefetch.detailSeed`를 추가해 **1건당 왕복 2회 → 1회**로 줄였다.
- 상세와 무관한 `fetchSigunguNames`가 상세·주변 조회 뒤에서 순차 대기하던 것을 상세 조회와 병렬(`Promise.all`)로 옮겨 왕복 1회치 wall-clock을 줄였다.

---

## 3. 주의사항 (caveats)

- **`export const revalidate`는 리터럴만 허용된다.** Next.js 16은 route segment config를 빌드 타임에 정적 분석하며, 다른 모듈에서 import한 상수는 인라인되지 않아 `"Invalid segment configuration export"` 빌드 오류가 난다. 전역 상수로 뺄 수 없으니 각 파일에 리터럴 `86400`을 두고 주석으로 의도를 맞춘다.
- **`/daycares/[[...region]]`는 여전히 동적(`ƒ`) 렌더다.** `searchParams`를 읽는 한 `revalidate`가 적용되지 않는다. 지역 base 경로(필터 없는 canonical)조차 매 요청 함수가 뜬다. 조치 2(robots)는 faceted 크롤만 막을 뿐, base 경로 동적 렌더 자체는 TODO 4로 남아 있다.
- **on-demand ISR은 배포마다 캐시가 통째로 콜드**가 된다. 상세는 빌드 시 사전생성이 없어(빈 `generateStaticParams`), 새 배포 후 크롤 파도가 24,000건을 전부 재생성한다. 잦은 배포는 재생성 파도를 반복 유발한다.
- **robots.txt 변경은 Googlebot이 다시 읽어야 반영**된다(보통 수 시간~하루). Search Console robots 테스터로 차단 규칙 적용을 확인할 수 있다.
- **`detailSeed`의 queryKey는 `daycareQueryOptions.detail`과 공유**해야 한다. 직접 키를 만들면 클라이언트 hook과 어긋나 하이드레이션 직후 재조회가 발생한다.
- **함수 메모리는 이미 최저**라 더 낮출 수 없다. Provisioned Memory를 줄이려면 (a) 함수 실행 횟수, (b) 요청당 wall-clock 둘 중 하나를 줄여야 한다.
- **이 사고의 근본 트리거는 "색인 URL 대량 개방 + 사이트맵 잦은 변경"** 이다. 기능 자체(경로형 URL·색인화)는 SEO상 옳은 결정이므로 되돌리지 않는다. 다만 큰 URL 구조 변경은 몰아서 한 번에 배포한다.

---

## 4. TODO (남은 레버, 효과 큰 순)

- [ ] **다음 청구 주기 관찰** — 조치 1~3이 Provisioned Memory($43.90)·ISR Writes($5.49)를 직접 때린다. 베이스라인(~5GB Hrs) 근처로 내려오는지 먼저 확인하고, 그래도 높을 때만 아래를 진행한다(과설계 방지).
- [ ] **동기화 트리거 on-demand 재검증 (크로스리포)** — 시간 기반 ISR은 데이터가 안 바뀌어도 24h마다 재생성한다. kidzly-sync가 새벽 동기화 직후 **실제로 바뀐 어린이집만** web의 `revalidateTag`/`revalidatePath` 엔드포인트로 찍어주고 페이지 `revalidate`를 길게/`false`로 두면, 안 바뀐 페이지는 재생성하지 않는다. ISR Writes·Provisioned Memory를 크게 줄인다. kidzly-sync(다른 저장소) 변경 필요.
- [ ] **지역 base 경로 ISR 전환** — `/daycares/[[...region]]`의 필터를 서버 `searchParams` → 클라이언트 nuqs + React Query로 옮기고, 레거시 쿼리 308 리다이렉트를 `middleware.ts`로 빼면 base 경로가 `ƒ 동적` → `● ISR`로 바뀐다. 조치 2(robots)의 효과를 관찰한 뒤 필요 시 진행.
- [ ] **배포 빈도 관리 (운영, 무료)** — 콘텐츠 발행마다 배포하지 말고 묶어서 배포해 on-demand ISR 재생성 파도를 줄인다.
- [ ] **Fast Origin Transfer 절감** — 하이드레이션 페이로드 축소(주변 목록 과도한 prefetch 정리). 효과는 소폭.

---

## 5. 검증·관찰 방법

- **코드 검증**: `pnpm --filter web typecheck`, `pnpm --filter web build`. 빌드 라우트 테이블에서 대상 페이지 `Revalidate`가 `1d`인지 확인한다.
- **비용 관찰**: Vercel 대시보드 → Usage → Vercel Functions → Fluid Provisioned Memory. 크롤 주기를 지나며(보통 며칠) 추이를 본다.
- **크롤 상태**: Google Search Console → 크롤 통계 / robots.txt 테스터.
