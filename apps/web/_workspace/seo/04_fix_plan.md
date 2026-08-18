# 구글 공식 문서 크로스체크 — 반영 계획

작성일: 2026-08-19
근거: `03_google_docs_crosscheck.md`
범위: **P1 5건 + 정책 문서 오류 3건 + 정책 문서 보강 2건.** P2 8건은 이번 범위 밖(별도 판단).

---

## 실행 순서

삭제형(위험 0) → 데이터 연결형(쿼리 추가) → 문서 순으로 간다. 앞 단계가 뒤 단계 검증을 막지 않도록 하는 순서다.

| 단계 | 대상 | 성격 | 검증 |
|---|---|---|---|
| 1 | P1-4, P1-5 (JSON-LD 무효·부적합 속성 제거) | 삭제 | 리치 결과 테스트 통과 |
| 2 | P1-3 (크롤러 전용 숨김 블록 제거) | 삭제 | 렌더된 HTML에 실콘텐츠 잔존 확인 |
| 3 | P1-1 (사이트맵 lastmod 정확화) | 쿼리 1컬럼 추가 | 사이트맵 XML 실측 |
| 4 | P1-2 (ItemList itemListElement 채우기) | 쿼리 1건 추가 | 리치 결과 테스트 통과 |
| 5 | 정책 문서 3건 수정 + 2건 보강 | 문서 | CLAUDE.md 변경 이력 기록 |
| 6 | 전체 검증 | — | lint / typecheck / build |

---

## 1단계 — P1-4·P1-5: `LocalBusiness` JSON-LD 정리

**파일:** `components/daycare/detail/DaycareDetailSSR.tsx:84-88`

- `image: 'https://kidzly.kr/og-image.png'` 제거 — 24,586개 페이지 공통 로고 이미지는 "이미지는 마크업된 콘텐츠를 나타내야 합니다" 위반이고, `image`는 `LocalBusiness` 필수 속성이 아니다.
- `datePublished` / `dateModified` 제거 — 두 속성의 schema.org 도메인은 `CreativeWork`이라 `ChildCare`/`LocalBusiness`에서 무효다. 제거하면 `daycare.syncedAt`을 참조하는 스프레드 블록 전체가 사라진다.

`daumDatetime`(다음 웹마스터용 `daum-wm-datetime`, 77·143행)은 **건드리지 않는다.** 다음 전용 마크업 규약이라 이번 판정 대상이 아니다.

**데이터 기준일을 사용자에게 보이는 텍스트로 노출하는 작업은 이번 범위에서 제외한다.** 현재 `syncedAt`은 화면 어디에도 표시되지 않아 새 UI를 만드는 일이 되고, 그건 SEO 수정이 아니라 기능 추가다. 필요하면 별건으로 판단한다.

**검증:** 상세 페이지 1건의 JSON-LD를 리치 결과 테스트에 넣어 오류·경고 0 확인. 필수 속성(`name`, `address`)이 남아 있는지 확인.

---

## 2단계 — P1-3: 크롤러 전용 숨김 블록 제거

**파일:** `components/daycare/detail/DaycareDetailSSR.tsx:145-163`

`<div className="sr-only" aria-hidden="true">` 블록과 그 위 주석 2줄을 제거한다. `aria-hidden`으로 스크린 리더에서도 빠져 있어 스팸 정책의 접근성 예외("스크린 리더 사용자의 환경을 개선하기 위한 텍스트")에 해당하지 않는다.

**제거 가능한 근거:** `useDaycareDetail`은 `useSuspenseQuery`(`domain/daycare/hooks/daycare.hooks.ts:16`)이고 `HydrationBoundary`로 prefetch 상태가 주입되므로, `DaycareDetailView`가 SSR 단계에서 실제 콘텐츠를 HTML로 렌더한다.

**검증(이 단계의 완료 조건):**

```
pnpm --filter web build && pnpm --filter web start
curl -s http://localhost:3000/daycare/{실제코드} > /tmp/detail.html
```

`/tmp/detail.html`에 어린이집 이름·주소·정원 문자열이 **JS 실행 없이** 존재하는지 확인한다. 하나라도 없으면 블록 제거를 되돌리고, 대신 `aria-hidden`을 떼서 접근성 예외 안으로 들어오게 하는 대안으로 전환한다.

---

## 3단계 — P1-1: 사이트맵 `lastmod` 정확화

구글은 `lastmod`를 "정확성을 검증할 수 있는 경우에" 쓴다. 부정확한 값이 섞이면 24,600개 상세 페이지의 정확한 `lastmod`까지 함께 신뢰를 잃는다.

**변경 1 — 시도별 갱신일 확보 (추가 쿼리 없음)**

- `packages/supabase/src/types.ts:225` — `DaycareIdRow`에 `sido_name` 추가.
- `domain/daycare/apis/daycare.api.ts:311-326` — `select('daycare_code, data_standard_date')` → `sido_name` 포함, 반환 객체에 `sidoName` 추가.

사이트맵은 이미 전 레코드를 페이지네이션으로 훑고 있으므로(`fetchAllDaycareEntries`), 컬럼 하나만 더 받으면 **시도별 `data_standard_date` 최대값을 추가 쿼리 없이** 계산할 수 있다.

**변경 2 — `app/sitemap.ts`**

| URL | 현재 | 변경 후 |
|---|---|---|
| `/rankings/{sido}` | `now` | 해당 시도 `data_standard_date` 최대값 |
| `/rankings` | `now` | 전체 `data_standard_date` 최대값 |
| `/` , `/map`, `/daycares` | `now` | **생략** (근거 있는 수정 시각이 없다) |
| `/about` | 누락 | 생략 상태 유지 — 위 규칙과 일치 |
| `/daycare/{id}`, `/contents/*` | 레코드·글 기준 | 그대로 |

`now` 상수와 관련 주석을 제거한다. "정확한 값이 없으면 생략한다"는 규칙을 파일 상단 주석으로 남긴다.

**검증:** `pnpm --filter web build` 후 `/sitemap.xml`을 받아 ①`<lastmod>` 없는 URL이 위 표와 일치하는지, ②`/rankings/서울특별시`의 `lastmod`가 해당 지역 상세 페이지들의 최대값과 같은지 확인한다.

---

## 4단계 — P1-2: `ItemList`에 `itemListElement` 채우기

**파일:** `components/rankings/RankingsPageView.tsx:51-56`, `domain/daycare/server.ts`

구글은 "`ListItem` 요소가 두 개 이상 포함된 `ItemList`"를 요구한다. 지금은 항목이 0개라 마크업이 무효다.

- `domain/daycare/server.ts`에 `fetchDaycareRankingWaiting` export 추가(다른 sitemap/SSR 전용 함수와 같은 패턴, 주석으로 용도 명시).
- `RankingsPageView`의 기존 `Promise.all`에 이 호출을 합쳐 대기 많은 순 상위 10건을 받고, `itemListElement`를 `{ '@type': 'ListItem', position, name, url: '/daycare/{id}' }` 배열로 채운다.

**비용:** 페이지당 Supabase 쿼리 1건 증가. `revalidate = 3600`인 ISR 페이지(전국 1 + 시도 17)라 요청마다 발생하지 않는다. prefetch와 dedup하려면 API 모듈 레벨에 React `cache()`를 씌워야 하는데, 그 함수는 클라이언트 쿼리에서도 쓰이므로 경계를 흐린다 — **중복 1회를 감수하는 쪽을 택한다.**

**세 랭킹 중 "대기 많은 순"만 마크업한다.** 한 페이지에 세 개의 `ItemList`를 병렬로 넣으면 어느 목록이 페이지의 주 콘텐츠인지 모호해진다.

**검증:** `/rankings/서울특별시`의 JSON-LD를 리치 결과 테스트에 넣어 `ItemList` 오류 0, 항목 10건 인식 확인. URL이 모두 동일 도메인·표준 URL인지 확인.

---

## 5단계 — 정책 문서 수정

**파일:** `.claude/skills/seo-manager/references/naver-daum-google-seo-guide.md`

### 오류 수정 (§1.4)

1. "schema.org에 어린이집 전용 타입은 없어" → **`ChildCare`(LocalBusiness 하위 타입) 사용**으로 교체.
2. "`additionalType`으로 보완" → **"유형이 여러 개면 배열로 지정. `additionalType`은 지원되지 않음"** 으로 교체.
3. "가장 구체적인 하위 타입 사용 권장"의 출처를 3자 블로그 → **공식 `local-business` 문서**로 교체.
4. `image`는 필수 속성이 아니며 "마크업된 콘텐츠를 나타내야 한다"는 요건 추가(1단계 판단 근거를 문서에 남긴다).

### AI 항목 재작성 (§1.5)

공식 문서 `생성형 AI 검색을 위한 최적화` 기준으로 교체하고, 문서가 명시적으로 부정하는 전술을 추가한다 — `llms.txt` 불필요, 콘텐츠 청킹 불필요, **"검색어 변형마다 별도 페이지 생성 = 대규모 콘텐츠 악용 위반"**, 측정은 Search Console 생성형 AI 실적 보고서. 3자 통계(47% 등)는 출처 성격을 표시한다.

### 신설 §1.7 — 구글 공식 규정 요약

감사 때 판단 근거로 바로 인용할 수 있게, 확인된 규정만 조항 형태로 넣는다.

- 사이트맵 50MB / 50,000 URL 한도, `priority`·`changefreq` 무시, `lastmod` 정확성 요건.
- 숨겨진 텍스트 금지 + **스크린 리더 목적 예외의 경계**.
- canonical은 절대·자체 참조, `robots.txt`/`noindex`를 표준화 수단으로 쓰지 않는다.
- 로봇 메타 기본값(`index, follow`) 명시는 무효, `max-snippet`·`max-image-preview`는 유효.
- `title`에 사이트명·키워드 반복 금지, 파비콘 요건, `WebSite` 구조화 데이터는 홈페이지 한정.
- `ItemList`는 `ListItem` 2개 이상 필수. **인기 장소 목록은 "자동 측정항목으로 만들어진 템플릿 목록" 배제** — 키즐리 랭킹은 대상 아님.
- 출처 절에 공식 문서 19편 URL 추가.

### CLAUDE.md 기록

`하네스: 사이트 SEO 관리`의 변경 이력에 2026-08-19 행을 추가한다 — 공식 문서 크로스체크로 정책 문서 오류 3건 수정, 공식 규정 절 신설, 그로 인해 발견된 P1 5건 반영.

---

## 6단계 — 전체 검증

```
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
```

기존 경고 18건(이번 변경과 무관)은 그대로 둔다. 빌드가 53개 라우트를 생성하는지 확인한다.

---

## 이번에 하지 않는 것

- **P2 8건** — `keywords` 제거, `index/follow` 정리, `WebSite` JSON-LD 홈 이동, 루트 canonical 제거, 제목 반복 정리, `Organization` 마크업, 이미지 사이트맵. P1 반영 후 별도 판단.
- **`daum-wm-*` 숨김 마크업** — 다음 웹마스터 규약이고 내용이 페이지 title/description과 동일해 조작 소지가 낮다. 유지.
- **데이터 기준일 UI 노출** — 기능 추가라 SEO 수정 범위 밖.

## 리스크

| 리스크 | 대응 |
|---|---|
| 2단계 후 상세 페이지 초기 HTML에 실콘텐츠가 없을 가능성 | 검증 실패 시 `aria-hidden`만 제거하는 대안으로 전환(접근성 예외 안으로 들어옴) |
| 3단계에서 `data_standard_date`가 NULL인 레코드 | 시도별 최대값 계산 시 NULL 제외, 전부 NULL이면 해당 URL은 `lastmod` 생략 |
| 4단계 추가 쿼리로 빌드 시간 증가 | 18개 페이지 × 1쿼리라 영향 미미. 빌드 시간 비교로 확인 |
