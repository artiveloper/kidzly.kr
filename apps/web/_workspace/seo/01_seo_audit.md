# SEO 감사 보고서

감사일: 2026-08-16

## 요약

P0: 0개 | P1: 5개 | P2: 6개

전체 평가: **Scaled Content Abuse 리스크는 낮은 편이다.** `daycare/[id]`는 대기·현원·교직원 근속·주변 어린이집 비교·네이버 블로그 실검색 결과 등 페이지별로 실제로 달라지는 데이터 훅을 이미 갖추고 있고, `rankings/[sido]`도 지역별 실데이터 기반 랭킹(대기·정원·역사)을 렌더링한다. 다만 `daycare/[id]`의 AI 분석 요약(`aiAnalysisSummary`)이 없는 레코드는 사실상 공공데이터 재배열에 가까워지므로 커버리지 확인이 필요하고, `contents/[slug]`(블로그 글)에는 `Article` JSON-LD가 아예 없다는 점이 가장 큰 P1 이슈다.

## P0 이슈 없음

코드 레벨에서 확인 가능한 범위 내에 P0급(즉시 색인 강등 위험) 이슈는 발견되지 않았다. `daycare/[id]`·`rankings/[sido]` 모두 구조화 데이터와 화면 표시 내용이 일치하며(가이드 §1.4), 눈에 안 보이는 내용을 스키마에만 넣은 사례는 없었다.

---

## P1 이슈 (권고)

### [P1][Google] contents/[slug] — Article JSON-LD 없음
**파일:** `apps/web/app/contents/[slug]/page.tsx`
**이유:** 블로그 상세 페이지에 `Article`(또는 `BlogPosting`) JSON-LD가 없다. `layout.tsx`의 `WebSite` JSON-LD 외에는 이 라우트에 구조화 데이터가 전혀 없음 (전체 검색: `application/ld+json` 매치 파일 목록에 `contents/[slug]/page.tsx` 없음).
**근거:** 가이드 §1.4 "구글이 JSON-LD를 권장 포맷으로 지정, 우선순위 5종 중 Article 포함"
**수정 방향:** `post.title`, `post.description`, `post.publishedAt`, `post.thumbnail`, `author`(키즐리 조직)를 담은 `Article` JSON-LD를 `<script type="application/ld+json">`으로 추가. `daycare/[id]`(`DaycareDetailSSR.tsx`)와 `rankings`(`RankingsPageView.tsx`)에 이미 있는 패턴을 그대로 재사용 가능.

---

### [P1][공통] contents/[slug] — 발행일 표기에 formatDate 미사용
**파일:** `apps/web/app/contents/[slug]/page.tsx:59`
**이유:** `<time>{post.publishedAt}</time>`로 원본 문자열을 그대로 출력한다. `lib/format.ts`의 `formatDate`를 쓰지 않았고, `dateTime` 속성도 없어 `<time>` 태그의 시맨틱 이점(검색엔진의 날짜 파싱)을 살리지 못한다. 같은 컴포넌트 트리의 `DaycareDetailView.tsx:167`(`formatDate(post.publishedAt)`)와 `DaycareDetailSSR.tsx:62`는 이미 규칙을 지키고 있어 이 파일만 예외.
**근거:** CLAUDE.md §22 "모든 날짜·시간 표시는 formatDate/formatDateTime 사용", seo-auditor 체크리스트 §5
**수정 방향:** `<time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>`로 교체. Article JSON-LD의 `datePublished`에는 원본 ISO 문자열을 그대로 사용.

---

### [P1][Google] daycare/[id] — 고유 데이터 훅이 레코드에 따라 조건부
**파일:** `apps/web/components/daycare/detail/DaycareDetailSSR.tsx:61`, `apps/web/domain/daycare/parser/daycare.parser.ts:235`
**이유:** `daycare.aiAnalysisSummary`(`row.ai_analysis?.summary`)가 없는 레코드는 메타 description이 `"{주소} 소재 {유형}어린이집. 전화 {번호}. 운영시간·대기현황은 키즐리에서 확인하세요."` 형태의 정형 문구로 대체된다. 화면 콘텐츠 자체는 정원/현원/대기/교직원 근속 등 실데이터가 있어 완전한 템플릿 반복은 아니지만, `aiAnalysisSummary`가 없는 비율이 크면 그 페이지군은 가이드 §1.2가 말하는 "원본 데이터에 맥락을 더하지 않는 어그리게이터"에 가까워진다. AI 분석이 없는 레코드 비율은 코드로 확인 불가.
**근거:** 가이드 §1.2
**수정 방향:** DB에서 `ai_analysis IS NULL` 비율을 확인해 수동 조치 체크리스트에 반영. 비율이 높다면 대기 현황·근속 데이터가 채워진 페이지부터 우선 색인되도록 sitemap priority를 조정하거나, AI 분석 커버리지를 늘리는 것을 검토.

**✅ 해소됨 (2026-08-16):** `status='정상'` 기준 전체 약 23,000건 중 `ai_analysis IS NULL`은 30건(약 0.13%). 우려했던 "AI 분석 없는 레코드 비율이 커서 어그리게이터에 가까워짐" 시나리오는 해당하지 않는다. 코드 반영 불필요.

---

### [P1][공통] rankings/[sido] — 소개 카피가 지역명만 치환되는 템플릿
**파일:** `apps/web/components/rankings/RankingsPageView.tsx:83-97`, `apps/web/components/rankings/rankings-meta.ts:9-10`
**이유:** title/description/`daum-wm-*`/화면 소개 문구가 모두 `${regionLabel} 어린이집 랭킹` / `다양한 기준으로 {regionLabel} 어린이집을 비교해보세요` 같은 변수 치환 패턴이다. 랭킹 리스트 자체(대기·정원·역사 TOP)는 지역별 실데이터라 구제 조건은 충족하지만, 지역별로 "왜 이 지역이 특별한지" 같은 부가 설명이 전혀 없어 텍스트 차별화가 약하다.
**근거:** 가이드 §1.2 "지역명만 바뀌고 실질적으로 동일한 구조·문구 반복"
**수정 방향:** 지역별 요약 통계(예: "{지역} 전체 N개 어린이집, 평균 대기 M명" 같은 실제 집계값)를 소개 문단에 1~2문장 추가해 문구 자체도 지역별로 달라지게 만드는 것을 권장. P0는 아니지만 방치 시 누적 리스크.

---

### [P1][Google] daycare/[id] fetch 실패 시 fallback 메타데이터에 noindex 없음
**파일:** `apps/web/app/daycare/[id]/page.tsx:39-44`
**이유:** `getCachedDaycareDetail` 실패 시 `generateMetadata`는 `robots` 필드 없이 기본 제목만 반환한다. 실제 페이지는 `DaycareDetailSSR`에서 `notFound()`를 호출해 404 상태가 되지만, `generateMetadata`가 독립 실행되므로 이 catch 분기에도 방어적으로 `robots: { index: false }`를 명시하는 편이 안전하다.
**근거:** 체크리스트 §2 "신규 라우트가 robots 메타 기본값(index/follow) 확인 안 됨"
**수정 방향:** catch 블록 반환값에 `robots: { index: false, follow: false }` 추가.

---

## P2 이슈 (제안)

### [P2][공통] sitemap.ts — daycare 항목 changeFrequency가 실제 동기화 주기와 불일치
**파일:** `apps/web/app/sitemap.ts:40`, `apps/web/app/about/page.tsx:301` (동기화 일정 안내)
**이유:** `about` 페이지는 "변경 데이터 동기화: 매일 02:00 KST", "전체 데이터 동기화: 매주 일 03:00 KST"라고 명시하는데, `sitemap.ts`의 daycare 엔트리는 `changeFrequency: "weekly"`로 고정되어 있다. 크롤러에게 주는 힌트일 뿐 강제력은 없지만 실제 갱신 주기(매일)와 어긋난다.
**수정 방향:** `changeFrequency: "daily"`로 조정 검토. (단, `lastModified`는 이미 레코드별 `syncedAt` 기반이라 정확함 — 이 부분은 잘된 부분으로 별도 언급.)

### [P2][Naver] sitemap 규모 — 인덱스 파일 전환 필요 여부 불확실
**파일:** `apps/web/app/sitemap.ts`
**이유:** 어린이집 상세 URL이 전국 단위로 대량 생성되고(수만 건 추정) 블로그·정적 페이지가 더해진다. 네이버는 사이트맵 1개만 제출 가능해 콘텐츠가 계속 느는 구조라면 인덱스 파일 전환이 권장된다(가이드 §2.1). 다만 정확한 현재 레코드 수는 코드에서 확인 불가.
**판단 근거 불확실:** 실제 어린이집 레코드 수(약 몇만 건인지)를 확인 후 재평가 필요.
**수정 방향:** Supabase에서 `daycare` 테이블 row count 확인 → 수만 건 이상이면 `sitemap.ts`를 `generateSitemaps()` 기반 인덱스 방식으로 분할하는 것을 seo-engineer 단계에서 검토.

**✅ 확인됨 (2026-08-16):** 약 23,000건. Google 사이트맵 XML 단일 파일 한도(50,000 URL)에 여유가 있어 지금은 인덱스 파일 전환이 불필요하다고 판단, P2에서 보류(하향)로 재분류. 4만 건 이상으로 늘면 재평가.

### [P2][Daum] daycares/page.tsx, contents/page.tsx — daum-wm-* 히든 마크업 누락
**파일:** `apps/web/app/daycares/page.tsx`, `apps/web/app/contents/page.tsx`
**이유:** `home`, `map`, `about`, `daycare/[id]`, `rankings`는 모두 `<div className="daum-wm-title hidden">`/`daum-wm-content` 패턴을 갖추고 있는데(다음 검색등록의 웹마스터툴 컨벤션으로 추정), 목록형 페이지인 `daycares`·`contents`는 이 패턴이 빠져 있어 일관성이 없다.
**수정 방향:** 다른 라우트와 동일하게 `daum-wm-title`/`daum-wm-content` 히든 div 추가. 가이드상 다음 자체 기술 투자 우선순위는 낮게 잡되(§4 비교표), 이미 존재하는 컨벤션과의 일관성 차원에서 P2로 분류.

### [P2][공통] daycares, contents 목록 페이지 — BreadcrumbList 없음
**파일:** `apps/web/app/daycares/page.tsx`, `apps/web/app/contents/page.tsx`
**이유:** `rankings`(전국/지역)와 `daycare/[id]`에는 `BreadcrumbList` JSON-LD가 있지만 `daycares`, `contents` 목록 페이지에는 없다.
**근거:** 체크리스트 §3 "목록형 페이지에 BreadcrumbList 없음"
**수정 방향:** `RankingsPageView.tsx`의 breadcrumbLd 패턴을 재사용해 `키즐리 > 어린이집 목록`, `키즐리 > 콘텐츠` 2단 breadcrumb 추가.

### [P2][공통] apis/naver/blog, api/article — robots.txt에서 /api 크롤 차단 없음
**파일:** `apps/web/public/robots.txt`
**이유:** `Allow: /`가 `/api/*`도 허용한다. `api/naver/blog`, `api/article/[uuid]/like`, `api/article/[uuid]/view`는 JSON 응답 전용 엔드포인트로 색인 가치가 없고 불필요한 크롤 예산 소모 가능성이 있다.
**수정 방향:** `Disallow: /api/` 한 줄 추가 검토. 다만 Next.js route handler는 기본적으로 HTML 페이지가 아니라 실질적 색인 위험은 낮음 — 우선순위 낮게 P2 유지.

### [P2][Google] daycare/[id] 제목 템플릿 — 어린이집명이 길 경우 60자 초과 가능
**파일:** `apps/web/components/daycare/detail/DaycareDetailSSR.tsx:19-21`
**이유:** `${daycare.name} (${year}) | ${location} ${typeLabel} - 키즐리` 템플릿은 대표 샘플 기준 60자 이내지만, "OO구립OO종합사회복지관부설OO어린이집" 같은 긴 기관명 + 시도/시군구 조합에서는 60자를 넘을 수 있다.
**판단 근거 불확실:** 실제 최장 기관명 데이터를 확인해야 초과 여부를 확정할 수 있음.
**수정 방향:** 어린이집명이 일정 길이(예: 20자) 초과 시 시군구 표기를 생략하는 등 제목 길이 가드 추가 검토.

---

## 잘된 부분

- `layout.tsx`에 네이버 서치어드바이저 인증 메타(`verification.other["naver-site-verification"]`)와 `WebSite` JSON-LD가 이미 반영돼 있다.
- `robots.txt`에 Daum 검색등록 인증 주석(`#DaumWebMasterTool:...`)이 존재하고 `sitemap.ts` 경로가 명시돼 있다.
- `sitemap.ts`가 지역별 랭킹(`/rankings/[sido]`)을 쿼리파라미터가 아닌 색인 가능한 개별 경로 URL로 등록한 점, 그리고 daycare 엔트리의 `lastModified`를 레코드별 `syncedAt` 기반으로 정확히 채운 점.
- `daycare/[id]`가 `ChildCare`/`LocalBusiness` + `BreadcrumbList` JSON-LD, Googlebot용 `sr-only` 서버렌더 콘텐츠 블록, 실데이터 기반 대기/근속/주변 어린이집/네이버 블로그 검색까지 갖춰 Scaled Content Abuse 대응이 잘 되어 있다.
- `rankings/page.tsx`와 `rankings/[sido]/page.tsx`가 `buildRankingsMetadata` 공용 빌더로 canonical/OG URL을 통일해 중복 콘텐츠·리다이렉트 이슈를 사전 방지했다(코드 주석에 그 의도가 명시돼 있음).
- 모든 동적 라우트(`daycare/[id]`, `rankings/[sido]`, `contents/[slug]`)가 `generateMetadata`를 구현하고 있고, `alternates.canonical`도 예외 없이 채워져 있다.
- `<img>` 태그 직접 사용 사례가 `app/`, `components/` 전체에서 발견되지 않음 — `next/image` 규칙(CLAUDE.md §27) 준수.
- `rankings/[sido]`는 `generateStaticParams` + `dynamicParams = false`로 17개 시도 외 경로를 라우팅 단계에서 404 처리해 soft-200/중복 색인 리스크를 차단.

---

## 수동 조치 체크리스트

(에이전트가 대신 할 수 없는 것 — 사람이 각 포털에서 직접 확인/실행)

- [x] 네이버 서치어드바이저 — 사이트 등록 상태·수집 현황 확인 — **등록 완료(2026-08-16, 사용자 확인).**
- [x] Daum 검색등록 — `#DaumWebMasterTool` 인증 유효 여부 재확인 — **등록 완료(2026-08-16, 사용자 확인).**
- [x] Google Search Console — 색인 커버리지, Core Web Vitals(필드 데이터, LCP/INP/CLS) 확인. 코드베이스에서 `verification.google` 메타 태그나 `google-site-verification` 파일을 찾지 못했다 — GSC가 DNS 또는 GA4 연동으로 별도 인증되어 있는지 확인 필요. — **등록 완료(2026-08-16, 사용자 확인).** 색인 커버리지·CWV 필드 데이터는 등록 직후라 아직 쌓이지 않았을 수 있음 — 1~2주 후 재확인 권장.
- [x] Supabase에서 `daycare` 테이블(또는 상당 뷰)의 실제 row 수 확인 → sitemap 인덱스 파일 전환 필요 규모인지 재평가 (P2 이슈 참조) — **확인 완료(2026-08-16): 약 23,000건.** 사이트맵 XML 단일 파일 한도(50,000 URL)에 여유가 있어 지금은 인덱스 파일 전환 불필요. 블로그·정적 페이지가 더해져도 당분간 안전. 향후 daycare 레코드가 큰 폭으로 늘면(예: 4만 건 이상) 재평가.
- [x] `daycare` 레코드 중 `ai_analysis IS NULL` 비율 확인 → Scaled Content Abuse 대응 커버리지 판단 (P1 이슈 참조) — **확인 완료(2026-08-16): `status='정상'` 기준 23,000건 중 30건(약 0.13%).** 사실상 전수 커버 — 이 P1 이슈는 해소된 것으로 처리.
- [ ] 네이버 사이트맵(1개 제한) 실제 제출 여부 및 RSS 피드 별도 제출 여부 확인 — **보류: 이번 SEO 반영(P0~P2) 완료 후 마지막에 제출 예정(사용자 계획).**
- [ ] Daum 검색등록 Seed URL(사이트맵) 제출 여부 확인 — 반영까지 수개월 소요 고지됨 — **보류: 위와 동일하게 반영 완료 후 마지막에 제출 예정.**

---

## 재감사 이력

(최초 실행 — 이력 없음)
