# 구글 공식 문서 크로스체크 보고서

작성일: 2026-08-19
대상 구글 문서: Search Central 사이드 메뉴 3개 섹션 전체 — **검색엔진 최적화 기초**, **크롤링 및 색인 생성**, **순위 및 검색 노출**(서브 메뉴 포함, 총 100여 문서).
크로스체크 대상: `.claude/skills/seo-manager/references/naver-daum-google-seo-guide.md`(정책 문서) + `apps/web` 실제 구현.
방법: 각 섹션 목차를 실제로 조회해 서브 메뉴를 전수 열거한 뒤, 키즐리에 적용되는 문서 19편을 원문 조회해 규정을 확인했다. 데이터 규모는 Supabase REST로 실측했다.

판정 범례 — ✅ 일치 / ⚠️ 갭(조치 필요) / ❌ 정책 문서 오류 / ➖ 해당 없음.

---

## 요약

핵심 결론은 세 가지다.

1. **정책 문서의 사실 오류 3건, 근거 보강 필요 2건.** 정책 문서의 출처 20개 중 구글 공식 문서는 1개(`local-business`)뿐이고 나머지는 3자 블로그다. 그 결과 구조화 데이터 항목에서 공식 문서와 정면으로 어긋나는 서술이 남아 있었다.
2. **구현 신규 이슈 P1 5건 / P2 8건.** 직전 감사(2026-08-16)는 공식 문서를 참조하지 않아 사이트맵 `lastmod` 규정, 숨겨진 텍스트 정책, `ItemList` 필수 속성, `LocalBusiness.image` 요건을 모두 놓쳤다.
3. **정책 문서가 아예 다루지 않는 구글 문서 그룹 9개**(표준화, 페이지 메타데이터, 삭제, 사이트 이전, 모바일 중심 색인, JS SEO, URL 구조, 링크, 순위 시스템 가이드). 이 중 키즐리에 실제 적용되는 것은 5개다.

| 구분 | 건수 |
|---|---|
| 정책 문서 오류(❌) | 3 |
| 정책 문서 근거 보강 | 2 |
| 구현 P1 | 5 |
| 구현 P2 | 8 |
| 공식 문서 기준 합격 확인 | 10 |
| 정책 문서 미커버 그룹(적용 대상) | 5 |

P0은 없다. 스팸 정책 위반으로 곧바로 분류될 패턴은 확인되지 않았다.

---

## 1. 정책 문서 수정 필요 — `naver-daum-google-seo-guide.md`

### ❌ 1-1. "어린이집 전용 schema.org 타입이 없다" — 사실 아님

현재 §1.4 서술은 "schema.org에 어린이집 전용 타입은 없어 `LocalBusiness` + 필요 시 `additionalType`으로 보완하는 방식이 실무에서 쓰인다"다.
schema.org에는 `LocalBusiness` 하위 타입으로 **`ChildCare`가 존재한다.** 코드(`DaycareDetailSSR.tsx:81`)는 이미 `['ChildCare', 'LocalBusiness']`를 쓰고 있어 구현이 정책 문서보다 정확한 상태다.

### ❌ 1-2. `additionalType` 권고 — 구글이 지원하지 않는 방식

`local-business` 문서 원문은 "유형이 여러 개인 경우 배열로 지정합니다(**`additionalType`는 지원되지 않음**)"이다. 정책 문서가 권하는 보완 수단이 공식 문서에서 명시적으로 배제된 방식이다. 배열 지정으로 문구를 교체해야 한다.

### ❌ 1-3. "가장 구체적인 하위 타입 사용 권장"의 근거 표기

정책 문서는 이 지침을 3자 블로그 톤으로 서술했지만, 원문은 "가능하면 가장 구체적인 `LocalBusiness` 하위 유형을 사용하세요"로 공식 문서에 직접 존재한다. 공식 출처로 교체하면 1-1·1-2가 함께 해소된다.

### 1-4. AI 항목(§1.5)을 공식 문서 기준으로 재작성

2026년 현재 구글은 **`검색엔진 최적화 기초 > 생성형 AI 검색을 위한 최적화`** 공식 문서를 운영한다. 정책 문서의 "공식 발표 없음" 서술은 이 문서로 대체해야 하고, 문서가 명시적으로 **부정**하는 전술이 정책 문서에 빠져 있다.

- "생성형 AI 검색에는 구조화된 데이터가 필요하지 않으며 추가해야 하는 특별한 schema.org 마크업도 없습니다."
- `llms.txt` 류 파일은 "Google 검색 자체에서 사용하지 않으므로" 만들 필요가 없다.
- "AI가 콘텐츠를 더 잘 이해할 수 있도록 콘텐츠를 작은 조각으로 나눌 필요는 없습니다."
- "사람들이 검색할 수 있는 모든 변형에 대해 별도의 콘텐츠를 만드는 것"은 **대규모 콘텐츠 악용 스팸 정책 위반**이다. 키즐리의 지역×조건 조합 페이지 확장을 검토할 때 직접 적용되는 문장이다.
- 측정 수단은 **Search Console 생성형 AI 실적 보고서**가 유일한 공식 창구다. 수동 조치 체크리스트에 추가할 항목이다.

"AI Overview 인용의 47%가 5위 밖 페이지" 같은 수치는 3자 출처임을 문서에 명시해야 한다.

### 1-5. 사이트맵·숨겨진 텍스트 규정 추가

정책 문서에 아래 공식 규정이 없어 감사 때 판단 근거가 비어 있었다.

- 사이트맵 1개당 **50MB(비압축) 또는 URL 50,000개** 한도. 초과 시 분할 + 색인 파일.
- "`<priority>` 및 `<changefreq>` 값을 **무시합니다.**"
- "`lastmod` 값이 일관되고 **정확성을 검증할 수 있는 경우에** 이 값을 사용합니다."
- 숨겨진 텍스트는 스팸 정책 위반이지만, **"스크린 리더에서만 액세스할 수 있으며 스크린 리더 사용자의 환경을 개선하기 위한 텍스트"는 예외**다. 이 예외의 경계가 아래 P1-3의 판단 기준이 된다.

---

## 2. 구현 조치 — P1

### ⚠️ P1-1. 사이트맵 `lastmod`가 실제 수정 시각이 아니다

`app/sitemap.ts:36,55,61,67,73,80` — 홈·`/map`·`/daycares`·`/rankings`·`/rankings/[sido]` 전부 `lastModified: now`(사이트맵 재생성 시각)를 넣는다. `revalidate = 86400`이라 **콘텐츠 변화와 무관하게 매일 값이 갱신된다.**
구글 문서는 lastmod를 "정확성을 검증할 수 있는 경우에" 쓰고, "페이지에 마지막으로 중요한 업데이트가 이루어진 날짜와 시간을 반영해야" 한다고 규정한다. 검증에 실패하면 **사이트 전체의 lastmod 신뢰도가 떨어져** 24,600여 개 상세 페이지의 정확한 lastmod까지 함께 무시될 수 있다. 코드 주석도 "근사치"임을 이미 인정하고 있다.

조치 — 지역 랭킹은 해당 지역 데이터의 `data_standard_date` 최대값을 쓰고, 근거가 없는 정적 라우트(홈·`/map`·`/daycares`)는 `lastModified`를 **생략**한다. 생략은 허용되며, 부정확한 값보다 안전하다.

### ⚠️ P1-2. `ItemList`에 `itemListElement`가 없다

`components/rankings/RankingsPageView.tsx:51-56` — `ItemList`에 `name`/`description`/`url`만 있고 항목이 하나도 없다.
구글 문서는 "목록을 지정하려면 **`ListItem` 요소가 두 개 이상 포함된** `ItemList`를 정의합니다"라고 요구한다. 지금 마크업은 유효한 목록으로 인식되지 않아 아무 효과가 없다.

조치 — 세 랭킹 섹션 중 대표 목록(대기 많은 순)을 `itemListElement`로 채운다. 요약 페이지 방식이면 `position` + `url`(상세 페이지 표준 URL, 동일 도메인)만으로 충족된다. 이미 `WaitingRankingList.tsx:31`이 `/daycare/{id}` 링크를 렌더하므로 데이터는 그대로 재사용할 수 있다.

**함께 확인한 사항** — `순위 및 검색 노출 > 유명한 장소 > 인기 장소 목록` 기능의 적격 조건은 "목록이 데이터 또는 자동화된 측정항목으로 만들어진 템플릿 문장이어서는 안 됩니다"다. 정원·대기 수치로 자동 생성되는 키즐리 랭킹은 **이 기능의 대상이 아니다.** `ItemList`는 캐러셀 목적으로만 유효하며, 이 문장은 정책 문서 §1.2 Scaled Content Abuse 판단과 같은 방향을 가리킨다.

### ⚠️ P1-3. 크롤러 전용 숨김 블록이 접근성 예외에 해당하지 않는다

`components/daycare/detail/DaycareDetailSSR.tsx:147-163` — `<div className="sr-only" aria-hidden="true">` 안에 이름·주소·전화·정원·AI 요약을 중복 출력한다. 주석은 용도를 "Googlebot 초기 크롤용"으로 명시한다.
`sr-only`는 시각적으로 숨기고, `aria-hidden="true"`는 스크린 리더에서도 제거한다. 즉 **사용자 누구에게도 도달하지 않고 크롤러만 읽는 텍스트**다. 스팸 정책의 숨겨진 텍스트 예외는 "스크린 리더에서만 액세스할 수 있으며 스크린 리더 사용자의 환경을 개선하기 위한 텍스트"에 한정되므로, 이 블록은 예외 범위 밖이다.
더 중요한 건 **불필요하다는 점**이다. `useDaycareDetail`은 `useSuspenseQuery`(`domain/daycare/hooks/daycare.hooks.ts:16`)이고 `HydrationBoundary`로 prefetch 상태가 주입되므로, `DaycareDetailView`는 SSR 단계에서 실제 콘텐츠를 이미 HTML로 렌더한다. 크롤러가 볼 콘텐츠가 없어서 넣은 블록이 아니다.

조치 — 블록을 제거한다. 제거 후 상세 페이지 HTML(`curl`)에 이름·주소·정원이 남아 있는지 확인하는 것을 완료 조건으로 둔다.

### ⚠️ P1-4. `LocalBusiness.image`가 전 페이지 공통 OG 이미지다

`DaycareDetailSSR.tsx:84` — 24,586개 상세 페이지가 모두 `image: 'https://kidzly.kr/og-image.png'`를 쓴다.
구글 문서는 이미지에 대해 "**이미지는 마크업된 콘텐츠를 나타내야 합니다**"라고 요구한다. 서비스 로고형 OG 이미지는 개별 어린이집을 나타내지 않는다. 구조화 데이터 일반 가이드라인의 "구조화된 데이터가 페이지 콘텐츠를 실제로 표현해야 합니다"에도 걸린다. 동일 이미지의 대량 반복은 정책 문서 §1.2 템플릿 대량 페이지 신호와도 겹친다.
`image`는 `LocalBusiness` **필수 속성이 아니다**(필수는 `name`, `address`뿐).

조치 — `image`를 제거한다. 기관별 실제 이미지를 확보하면 그때 넣는다.

### ⚠️ P1-5. `LocalBusiness`에 `datePublished`/`dateModified`를 넣고 있다

`DaycareDetailSSR.tsx:86-87` — `daycare.syncedAt`을 두 속성에 넣는다. 두 속성의 schema.org 도메인은 `CreativeWork`이며 `LocalBusiness`/`ChildCare`에는 정의되지 않는다. 구글은 정의되지 않은 속성을 무시하므로 신선도 신호로도 작동하지 않는다.

조치 — 두 속성을 제거한다. 데이터 기준일을 노출하려는 목적이면 **본문에 보이는 텍스트**로 표기하는 편이 정책·효과 양쪽에서 맞다(구조화 데이터는 보이는 콘텐츠를 표현해야 한다).

---

## 3. 구현 조치 — P2

| # | 위치 | 내용 | 구글 문서 근거 |
|---|---|---|---|
| P2-1 | `app/sitemap.ts` 전역 | `priority`/`changeFrequency`를 전 항목에 부여 | "Google에서는 `<priority>` 및 `<changefreq>` 값을 무시합니다." 네이버·다음 대응 목적이면 주석으로 의도를 남기고 유지, 아니면 제거해 파일 크기를 줄인다. |
| P2-2 | `app/sitemap.ts` `/about` 항목 | `lastModified` 누락 | 다른 항목과 정책이 엇갈린다. P1-1과 함께 "정확한 값 아니면 생략" 규칙으로 통일한다. |
| P2-3 | `app/layout.tsx:35-58` | `keywords` 23개 배열 | "메타 키워드 태그는 Google 검색에서 사용되지 않으며 색인 생성 및 순위 지정에 전혀 영향을 미치지 않습니다." 구글 기준 무효. 네이버 목적이라면 의도를 주석으로 남긴다. |
| P2-4 | `app/layout.tsx:63-71`, `app/privacy-policy/page.tsx:11`, `app/terms/page.tsx:11` | `robots: { index: true, follow: true }` 명시 | "이 규칙은 기본값이므로 명시적으로 표시해도 아무 효과가 없습니다." `max-image-preview`/`max-snippet`은 유효하므로 그대로 둔다. |
| P2-5 | `app/layout.tsx:106-118` | `WebSite` JSON-LD를 루트 레이아웃에서 **전 페이지**에 출력 | "구조화된 `WebSite` 데이터가 사이트의 홈페이지에 있어야 합니다." 하위 디렉터리는 미지원. 홈(`app/page.tsx`)으로 옮기고 `alternateName` 추가를 검토한다. |
| P2-6 | `app/layout.tsx:97` | 루트 `alternates.canonical = BASE_URL` | 페이지가 canonical을 지정하지 않으면 **홈으로 canonical 되는 함정**이다. 현재 모든 라우트가 자체 canonical을 지정해 실피해는 없지만, 신규 라우트 추가 시 조용히 색인에서 빠질 수 있다. 루트에서 canonical을 빼고 페이지에서만 지정하는 방식이 안전하다. |
| P2-7 | `app/layout.tsx:29-33`, 각 페이지 title | 사이트명 "키즐리"가 모든 제목에 반복, 홈 제목에 "어린이집" 3회 | "모든 페이지에 이를 표시하는 것은 반복적으로 보입니다", "같은 단어나 구문을 여러 번 표시할 필요는 없습니다. 유인 키워드 반복을 사용하면 Google과 사용자가 검색결과를 스팸으로 오인할 수 있습니다." 구글이 제목 링크를 자체 교체할 수 있다. |
| P2-8 | 홈(`app/page.tsx`) | `Organization` 구조화 데이터가 `WebSite.publisher` 안에 중첩된 형태만 존재 | `Organization` 독립 마크업(`logo`, `sameAs`)이 있으면 지식 패널·사이트 이름 인식에 유리하다. 로고는 `public/logo.png`가 이미 있다. |

---

## 4. 공식 문서 기준 합격 확인

| 항목 | 확인 내용 |
|---|---|
| 사이트맵 규모 | Supabase 실측 `daycares` 60,223행 / `status='정상'` **24,586행**. 사이트맵 URL 약 24,630개로 **50,000개 한도 이내**. 파일 크기도 수 MB 수준으로 50MB 한도와 무관하다. 분할·색인 파일은 아직 불필요하다(네이버 1개 제한도 현행 구조로 충족). |
| 한글 URL | `/rankings/{시도}`, `/contents/{한글-슬러그}`를 `encodeURIComponent`로 퍼센트 인코딩. 문서 권장과 일치("ASCII가 아닌 범위에 해당하는 문자는 퍼센트 인코딩되어야 합니다"). 하이픈 사용도 일치. |
| canonical | 전 라우트 절대 URL + 자체 참조. "절대 경로를 사용하세요", "자체 참조 `rel="canonical"`을 추가하는 것이 좋습니다"와 일치. `robots.txt`·`noindex`를 표준화 수단으로 쓰지 않는다. |
| 링크 크롤 가능성 | `RegionDaycareList.tsx:59`, `WaitingRankingList.tsx:31`, `DaycareListItem.tsx:28` 모두 `href` 있는 `<a>`(next `Link`). "링크가 `href` 속성이 있는 `<a>` HTML 요소인 경우에만 Google에서 링크를 발견할 수 있습니다"를 충족. |
| 파비콘 | `app/favicon.ico` 48×48, `app/icon.png` 512×512, `app/apple-icon.png` 180×180. 정사각형·8px 이상 요건 충족, `robots.txt`에서 차단되지 않는다. |
| Core Web Vitals | 정책 문서의 LCP<2.5s / INP<200ms / CLS<0.1은 공식 문서와 **일치**. |
| robots 지시어 | `max-image-preview: large`, `max-snippet: -1`은 지원 지시어로 확인. |
| 이미지 | `<img>` 0건, `next/image` 9건 전부 `alt` 지정. |
| 전면 광고 | `PromoToast`는 화면 일부만 덮고 닫기 버튼 + 세션 1회 제한이라 문서가 지적하는 "페이지 전체에 오버레이"에 해당하지 않는다. AdSense 지면 자체는 코드만으로 판단 불가 — 수동 확인 항목. |
| Article 구조화 데이터 | 필수 속성 없음이 공식 입장. 썸네일 1080×1080은 "너비×높이 최소 50,000픽셀" 충족. `author`를 `Organization`으로 두는 것도 허용 범위. |

---

## 5. 서브 메뉴 전수 매트릭스

### 5-1. 검색엔진 최적화 기초

| 서브 메뉴 | 판정 | 비고 |
|---|---|---|
| 소개 | ✅ | — |
| 검색 Essentials(스팸 정책 포함) | ⚠️ | 숨겨진 텍스트 → P1-3. 대규모 콘텐츠 악용은 정책 문서 §1.2가 이미 다룬다. |
| SEO 기본 가이드 | ✅ | 제목·설명·링크·이미지 기본은 충족. 제목 반복만 P2-7. |
| 생성형 AI 검색을 위한 최적화 | ❌ | 정책 문서 §1.5가 3자 출처 기반 — 1-4로 재작성 필요. |
| Google 검색 작동 방식 | ✅ | 참고용. |
| SEO가 필요한가요 | ➖ | 대행 관련 안내. |

### 5-2. 크롤링 및 색인 생성

| 서브 메뉴 | 판정 | 비고 |
|---|---|---|
| 개요 | ✅ | — |
| 색인 생성 가능 파일 형식 | ➖ | HTML 단일. PDF 등 없음. |
| URL 구조 | ✅ | 퍼센트 인코딩·하이픈·읽을 수 있는 단어 충족. 경로가 모두 소문자·고정형이라 대소문자 구분 이슈 없음. |
| 링크 | ✅ | `<a href>` 충족. |
| 사이트맵 — 알아보기 / 제작·제출 | ⚠️ | `lastmod` P1-1, `priority`·`changefreq` P2-1. |
| 사이트맵 — 색인 파일로 관리 | ✅ | 24,630 URL로 한도 이내, 전환 불필요. |
| 사이트맵 — 이미지 | ⚠️ | 블로그 썸네일 21개가 이미지 사이트맵 미포함. 우선순위 낮음. |
| 사이트맵 — 뉴스 / 동영상 / 확장 통합 | ➖ | 해당 콘텐츠 없음. |
| 크롤러 관리 — 재크롤링 요청 / 오류 해결 / 크롤러 목록 / Googlebot / 속도 낮추기 / 크롤러 확인 | ➖ | 코드 대상 아님. Search Console 수동 영역. |
| robots.txt — 소개 / 사양 | ⚠️ | 문법 정상, 사이트맵 선언 정상. `Disallow: /api/`가 `/api/naver/blog`를 막아 해당 섹션은 렌더 단계에서 비워진다("차단된 페이지의 JavaScript를 렌더링하지 않습니다"). 3자 콘텐츠라 의도된 결과로 보이나 근거를 문서에 남길 것. |
| 표준화 — 정의 / 지정 방법 / 문제 해결 | ⚠️ | 절대·자체 참조 canonical 충족. 루트 canonical 상속 함정 P2-6. |
| 모바일 사이트 및 모바일 중심 색인 | ✅ | 단일 반응형 URL, CLAUDE.md §25 모바일 퍼스트. 정책 문서 미커버 그룹이지만 리스크 없음. |
| AMP(4문서) | ➖ | 미사용. |
| JavaScript — 기본사항 / 문제 해결 / 지연 로드 / 동적 렌더링 | ⚠️ | Server Components + `useSuspenseQuery` 하이드레이션으로 초기 HTML에 실콘텐츠 존재. 동적 렌더링 불필요. 무한 스크롤 이후 페이지는 색인 대상이 아니며 상세 URL은 사이트맵으로 커버. `/map`은 지도 SDK 의존이라 사실상 색인 가치가 낮다(`h1`만 `sr-only`) — 인지 필요. |
| 페이지·콘텐츠 메타데이터 — 페이지 메타데이터 / 지원 메타 태그 / 로봇 메타 태그 / noindex / rel 속성 | ⚠️ | `keywords` P2-3, 기본값 명시 P2-4. `noindex` 사용처는 상세 fetch 실패 fallback 1곳으로 적절. 외부 링크가 거의 없어 `rel` 정책은 무관. |
| 삭제(4문서) | ➖ | 삭제 요청 대상 없음. |
| 사이트 이전 및 변경 — 리디렉션 / 호스팅 변경 / URL 변경 / A/B 테스트 / 일시중지 | ✅ | `next.config.mjs`의 301 두 건(`/region`, 보육료 글 통합)이 문서 권장 방식(영구 리디렉션)과 일치. |

### 5-3. 순위 및 검색 노출

| 서브 메뉴 | 판정 | 비고 |
|---|---|---|
| 개요 / 시각적 요소 갤러리 | ✅ | — |
| 제목 링크 | ⚠️ | P2-7. |
| 스니펫 | ✅ | description 전 라우트 개별 지정, 상세는 실데이터 조합. |
| 추천 스니펫 | ➖ | 별도 조치 없음(콘텐츠 품질 영역). |
| 사이트링크 | ✅ | Header·Footer 내부 링크 구조 존재. 별도 마크업 요구 없음. |
| 사이트 이름 | ⚠️ | P2-5(홈 한정 배치). |
| 파비콘 | ✅ | 요건 충족. |
| 서명일 | ⚠️ | 블로그 글은 `<time dateTime>` + `datePublished`/`dateModified` 일치. 상세 페이지의 데이터 기준일은 P1-5 참고. |
| 번역된 검색결과 / 선호하는 출처 / Discover / 유연한 샘플링 / 웹 스토리(3문서) / 배송 추적 / 광고 네트워크·번역 | ➖ | 해당 없음(단일 언어, 페이월 없음, 스토리·상거래 없음). |
| AI 기능 | ⚠️ | 정책 문서 1-4로 재정리. |
| 이미지 | ✅ | `next/image`, `alt` 전건. 이미지 사이트맵만 선택 과제. |
| 동영상 | ➖ | 없음. |
| 페이지 경험 — 이해하기 / Core Web Vitals / 전면 광고 | ✅ | 임계값 일치. `PromoToast`는 위반 아님. AdSense 지면은 수동 확인. |
| 유명한 장소 — 비즈니스 세부정보 | ➖ | 어린이집 소유자가 아니라 우리가 등록할 대상이 아니다. |
| 유명한 장소 — 인기 장소 목록 | ⚠️ | 자동 측정항목 기반 목록은 적격 대상 아님(P1-2 참고). 정책 문서에 이 제약을 명시할 것. |
| 순위 시스템 가이드 / 리뷰 시스템 | ➖ | 리뷰 기능 미도입. 도입 시 리뷰 시스템·`Review` 마크업 재검토. |
| 순위 업데이트 — 핵심 / 스팸 | ⚠️ | 정책 문서 §1.1·§1.2가 3자 분석 기반. 공식 업데이트 목록을 근거 링크로 추가할 것. |
| 구조화 데이터 — 작동 방식 / 일반 가이드라인 / 인리치드 결과 / JS 생성 / 전체 갤러리 | ⚠️ | 일반 가이드라인 위반 소지 → P1-3·P1-4. JSON-LD 사용은 권장 포맷과 일치. |
| 구조화 데이터 — 현지 업체 | ⚠️ | 필수(`name`,`address`) 충족. `image` P1-4, 무효 속성 P1-5. `@type` 배열 방식은 정확. |
| 구조화 데이터 — 기사 | ✅ | 필수 속성 없음, 권장 속성 충족. |
| 구조화 데이터 — 탐색경로 | ✅ | 상세·랭킹·목록 페이지에 2단 `BreadcrumbList` 존재. 화면 탐색경로 UI는 없으나 마크업 요건은 충족. |
| 구조화 데이터 — 캐러셀(ItemList) | ⚠️ | P1-2. |
| 구조화 데이터 — 나머지 27종(도서·과정·데이터세트·포럼·교육 Q&A·고용주 평점·사실확인·이벤트·이미지 라이선스·채용·수학·영화·조직·제품 계열·프로필·Q&A·레시피·리뷰 스니펫·소프트웨어·Speakable·페이월·공유숙박·동영상 등) | ➖ | 해당 콘텐츠 없음. `Organization`은 P2-8, `Review`는 후기 기능 도입 시. `FAQPage`는 실제 FAQ가 없으므로 **넣지 않는 현 상태가 정답**이다(정책 문서 §1.4 경고와 일치). |

---

## 6. 수동 조치 체크리스트(사람만 가능)

1. Search Console **생성형 AI 실적 보고서** 확인 — AI 기능 노출 측정의 유일한 공식 창구.
2. Search Console에서 사이트맵 처리 상태와 색인 지연 패턴 확인 — P1-1 조치 후 재확인.
3. AdSense 지면이 본문 상단을 과도하게 덮지 않는지 실제 모바일 화면에서 확인.
4. Core Web Vitals **필드 데이터**를 Search Console 페이지 경험 보고서에서 확인 — Lighthouse 랩 점수와 별개다.
5. 네이버 서치어드바이저·다음 검색등록 인증 상태 유지 확인(기존 체크리스트 유지).

---

## 7. 인용한 구글 공식 문서

- 검색 Essentials — 스팸 정책 `/search/docs/essentials/spam-policies`
- 생성형 AI 검색을 위한 최적화 `/search/docs/fundamentals/ai-optimization-guide`
- 사이트맵 제작 및 제출 `/search/docs/crawling-indexing/sitemaps/build-sitemap`
- URL 구조 `/search/docs/crawling-indexing/url-structure`
- rel="canonical" 지정 방법 `/search/docs/crawling-indexing/consolidate-duplicate-urls`
- 지원 메타 태그 및 HTML 속성 `/search/docs/crawling-indexing/special-tags`
- 로봇 메타 태그·X-Robots-Tag `/search/docs/crawling-indexing/robots-meta-tag`
- 자바스크립트 SEO 기본사항 `/search/docs/crawling-indexing/javascript/javascript-seo-basics`
- 제목 링크 `/search/docs/appearance/title-link`
- 사이트 이름 `/search/docs/appearance/site-names`
- 파비콘 `/search/docs/appearance/favicon-in-search`
- 이미지 SEO `/search/docs/appearance/google-images`
- Core Web Vitals `/search/docs/appearance/core-web-vitals`
- 전면 광고 및 대화상자 `/search/docs/appearance/avoid-intrusive-interstitials`
- 인기 장소 목록 `/search/docs/appearance/top-places-list`
- 구조화된 데이터 일반 가이드라인 `/search/docs/appearance/structured-data/sd-policies`
- 현지 업체 `/search/docs/appearance/structured-data/local-business`
- 기사 `/search/docs/appearance/structured-data/article`
- 캐러셀(ItemList) `/search/docs/appearance/structured-data/carousel`
