# 구글 공식 문서 크로스체크 — 반영 내역

반영일: 2026-08-19
계획: `04_fix_plan.md` / 근거: `03_google_docs_crosscheck.md`
범위: P1 5건 + 정책 문서 수정. **P2 8건은 미반영(범위 밖).**

---

## 반영 내역

| 이슈 | 변경 파일 | 내용 |
|---|---|---|
| P1-4 `LocalBusiness.image`가 전 페이지 공통 OG 이미지 | `components/daycare/detail/DaycareDetailSSR.tsx` | `image: 'https://kidzly.kr/og-image.png'` 제거. `image`는 필수 속성이 아니고, 공식 문서는 "이미지는 마크업된 콘텐츠를 나타내야" 한다고 요구한다 |
| P1-5 `LocalBusiness`에 `CreativeWork` 속성 사용 | 같은 파일 | `dateModified`/`datePublished`(+ `syncedAt` 스프레드) 제거. 다음 웹마스터용 `daum-wm-datetime`은 유지 |
| P1-3 크롤러 전용 숨김 블록 | 같은 파일 | `sr-only` + `aria-hidden="true"` 블록(19줄) 제거. 스팸 정책의 숨겨진 텍스트 예외는 스크린 리더용 텍스트에만 적용되는데 `aria-hidden`으로 스크린 리더에서도 빠져 있었다. 블록을 참조하던 주석 1줄도 정정 |
| P1-1 사이트맵 `lastmod` 부정확 | `app/sitemap.ts`, `domain/daycare/apis/daycare.api.ts`, `packages/supabase/src/types.ts` | `fetchDaycareIdsPaginated` select에 `sido_name` 추가(추가 쿼리 없음) → `collectLatestDataDates`로 시도별·전체 `data_standard_date` 최대값 계산. `/rankings`·`/rankings/[sido]`는 이 값을 쓰고, 근거 없는 홈·`/map`·`/daycares`는 `lastModified` 생략. `now` 상수 제거, 규칙을 파일 상단 주석으로 명문화 |
| P1-2 `ItemList`에 `itemListElement` 없음 | `components/rankings/RankingsPageView.tsx`, `domain/daycare/server.ts` | `fetchDaycareRankingWaiting`을 server 엔트리에 노출하고 기존 `Promise.all`에 합쳐 상위 10건 조회 → `position`·`name`·`url`을 가진 `ListItem` 10개로 `itemListElement` 구성. 항목이 2개 미만이면 마크업 자체를 내보내지 않는다 |
| 정책 문서 오류 3건 + AI 항목 재작성 + §1.7 신설 | `.claude/skills/seo-manager/references/naver-daum-google-seo-guide.md`, `CLAUDE.md` | §1.4 `ChildCare` 타입 존재·`additionalType` 미지원·`image` 요건 반영, §1.5를 공식 `ai-optimization-guide` 기준으로 재작성, **§1.7 "구글 공식 규정"**(원문 대조 확인 항목) 신설, 출처를 공식 19편 / 3자로 등급 분리. CLAUDE.md 변경 이력에 기록 |

---

## 계획에 없던 발견 — 사이트맵 URL 8,500여 개 조용한 누락 (수정함)

P1-1 검증으로 사이트맵 XML을 실제로 세어보다 발견했다.

**증상:** 빌드 로그에 `[fetchDaycareIdsPaginated] canceling statement due to statement timeout` 1줄이 뜨고, 생성된 `sitemap.xml`의 URL이 **16,046개**였다. 기대값은 24,630여 개다.

**원인:** `fetchDaycareIdsPaginated`가 에러 시 빈 배열을 반환했고(`console.error` 후 `return []`), 호출부 `fetchAllDaycareEntries`는 `batch.length < BATCH_SIZE`를 종료 조건으로 삼아 **에러를 "마지막 페이지"로 오인**했다. 배치 하나가 타임아웃나면 그 지점부터 끝까지가 통째로 사라지는데, 빌드는 성공하고 로그 1줄만 남는다.

**내 변경 때문인지 확인:** `sido_name` 컬럼 추가 전후로 REST 쿼리를 offset 0/16000/24000에서 각각 측정했다. 추가 전 2,722ms·3,632ms·1,501ms, 추가 후 2,084ms·1,847ms·1,121ms로 **컬럼 추가가 원인이 아니다.** 25개 배치를 순차 조회하는 동안 빌드 워커 11개가 동시에 DB를 치면서 간헐적으로 statement timeout이 나는 기존 구조의 문제다.

**수정:**
- `daycare.api.ts` — 에러 시 `throw`(CLAUDE.md §13 "에러 → throw"와도 일치). 빈 배열 반환이 누락의 직접 원인이었다.
- `sitemap.ts` — `fetchDaycareBatch`로 배치당 최대 2회 재시도(1초·2초 백오프), 그래도 실패하면 사이트맵 생성을 실패시킨다. 조용히 잘린 사이트맵보다 실패가 낫다.

**결과:** 재빌드 후 URL **24,634개**로 복구.

---

## 검증

| 항목 | 결과 |
|---|---|
| `pnpm --filter web typecheck` | ✅ |
| `pnpm --filter web lint` | ✅ 0 errors, 45 warnings(전부 네이버 지도 SDK 벤더 파일 등 기존 경고 — 변경 파일에는 경고 0) |
| `pnpm --filter web build` | ✅ 54개 라우트 생성, 사이트맵 에러 로그 없음 |
| 사이트맵 URL 수 | ✅ 24,634개 (수정 전 16,046개) |
| 사이트맵 `lastmod` 누락 URL | ✅ 정확히 4개 — `/`, `/map`, `/daycares`, `/about` (의도대로) |
| `/rankings` `lastmod` | ✅ `2026-08-19` (데이터 기준일 최대값, 빌드 시각 아님) |
| `ItemList` 마크업 | ✅ 프리렌더된 `/rankings`에 `ListItem` 10건, URL 모두 `https://kidzly.kr/daycare/{code}` |
| 상세 페이지 SSR 콘텐츠 (P1-3 완료 조건) | ✅ `next start` 후 `curl`한 HTML에 이름·주소·정원·전화 모두 존재(JS 실행 없이), `h1` 1개 유지 |
| 상세 JSON-LD | ✅ `image`·`dateModified`·`datePublished` 부재, `name`/`address`/`telephone`/`maximumAttendeeCapacity`/`geo`/`url` 유지 |

검증에 쓴 어린이집: `40400000640`(아이사랑어린이집, 경기도 파주시).

---

---

## 2차 반영 — P2 4건 (2026-08-19)

`app/layout.tsx` 한 파일에 P2-3~P2-6이 모두 걸쳐 있어 한 커밋으로 처리했다.

| 이슈 | 내용 |
|---|---|
| P2-3 | `keywords` 23개 제거 — 구글이 색인·순위에 전혀 쓰지 않는다 |
| P2-4 | `robots`의 `index`/`follow` 제거(기본값이라 무효). `max-image-preview`·`max-snippet`만 유지. `privacy-policy`·`terms`의 동일 명시도 제거 |
| P2-5 | `WebSite` JSON-LD를 루트 레이아웃 → `app/page.tsx`로 이동, `alternateName: 'Kidzly'` 추가 |
| P2-6 | 루트 `alternates.canonical` 제거 — 신규 라우트가 canonical을 빠뜨리면 홈으로 canonical 되던 함정 |
| P2-8 | 홈에 `Organization` 독립 마크업 추가(`logo` 716×300 포함). 운영 소셜 채널이 없어 `sameAs`는 생략 |

**검증:** typecheck ✅ / lint ✅(0 errors) / build ✅ 54개 라우트. 프리렌더 페이지 전부가 자체 canonical 보유(`_global-error` 제외), `keywords` 메타 소멸, `googlebot` 메타는 두 지시어만, `index.html`에 `WebSite`·`Organization` 존재, `about.html`에서 `WebSite` 소멸 확인.

**P2-2**(`/about` lastmod)는 P1-1에서 "근거 없으면 생략" 규칙을 세우며 의도된 상태가 되어 해소됐다.

---

## 남은 항목

- **P2-7 제목 반복** — 사이트명이 모든 제목에 붙고 홈 제목에 "어린이집"이 3회. 카피 결정이 필요해 미반영.
- **P2-1 `priority`/`changeFrequency`** — 구글은 무시한다. 네이버·다음 대응 의도를 정한 뒤 유지/제거 판단.
- **이미지 사이트맵** — 블로그 썸네일 21개 미포함. 우선순위 낮음.
- **수동 조치** — Search Console 생성형 AI 실적 보고서 확인, 사이트맵 처리 상태 재확인(URL 수가 24,000대로 잡히는지), AdSense 지면 확인, CWV 필드 데이터 확인.
- 사이트맵 생성이 배치 25회 순차 조회로 60초 이상 걸린다. 지금은 재시도로 방어했지만, 어린이집 수가 더 늘면 배치 크기·병렬화 재검토가 필요하다.
