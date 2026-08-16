# SEO 반영 내역

반영일: 2026-08-16

## 반영한 이슈

| 이슈 (01_seo_audit.md 기준) | 심각도 | 변경 파일 | 비고 |
|---|---|---|---|
| contents/[slug] — Article JSON-LD 없음 | P1 | `apps/web/lib/structured-data/article.ts`(신규), `apps/web/app/contents/[slug]/page.tsx` | `buildArticleJsonLd` 빌더 신규 작성 (headline/description/url/datePublished/author/publisher/image). `daycare/[id]`·`rankings` JSON-LD `<script>` 패턴 재사용 |
| contents/[slug]:59 — 발행일 formatDate 미사용 | P1 | `apps/web/app/contents/[slug]/page.tsx` | `<time>{post.publishedAt}</time>` → `<time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>`로 교체. JSON-LD `datePublished`는 원본 ISO 문자열 그대로 사용 |
| daycare/[id] — AI 분석 요약 없는 레코드의 커버리지 불명 | P1 | (코드 변경 없음) | 아래 "미해결" 항목 참조 — 스키마·페이지 콘텐츠 구조는 이미 실데이터 기반이라 구제 조건은 충족하나, `ai_analysis IS NULL` 비율 확인은 DB 조회가 필요해 코드 반영 범위 밖. 01_seo_audit.md 체크리스트에 이미 등재된 항목으로 대응 |
| rankings/[sido] — 소개 카피가 지역명만 치환되는 템플릿 | P1 | `apps/web/domain/daycare/apis/daycare.api.ts`, `apps/web/domain/daycare/server.ts`, `apps/web/components/rankings/RankingsPageView.tsx` | `fetchDaycareRegionSummary(sido?)` 신규 API 함수 추가 — 지역별 정상 운영 어린이집 총수 + 대기 있는 곳 평균 대기 인원(근사치, 최대 5000행 풀) 조회. 소개 문단에 "{지역} 정상 운영 어린이집 N곳, 대기 있는 곳 평균 M명 대기" 문장 추가로 지역별 실통계 반영 |
| daycare/[id] fetch 실패 시 fallback 메타데이터에 noindex 없음 | P1 | `apps/web/app/daycare/[id]/page.tsx` | `generateMetadata` catch 블록 반환값에 `robots: { index: false, follow: false }` 추가 |

## 미해결 (코드 변경만으로 불가) → 이후 해소됨

| 이슈 | 이유 |
|---|---|
| daycare/[id] — AI 분석 요약(`aiAnalysisSummary`) 커버리지 | `ai_analysis IS NULL` 비율은 Supabase 테이블 실측이 필요해 코드 변경만으로 판단·해결 불가했음. **✅ 2026-08-16 사용자가 직접 조회해 해소: `status='정상'` 약 23,000건 중 30건(0.13%)만 NULL — 무시 가능한 수준이라 추가 조치 불필요.** 01_seo_audit.md에도 동일하게 기록됨 |

## 검증 결과

lint: ✅ (0 errors, 18 pre-existing warnings — 이번 변경과 무관)
typecheck: ✅
build: ✅ (`pnpm --filter web build` 성공, 53개 라우트 정상 생성)

---

## P2 반영 내역

반영일: 2026-08-16

| 이슈 (01_seo_audit.md 기준) | 심각도 | 변경 파일 | 비고 |
|---|---|---|---|
| sitemap.ts daycare changeFrequency가 실제 동기화 주기(매일)와 불일치 | P2 | `apps/web/app/sitemap.ts` | daycareEntries의 `changeFrequency: "weekly"` → `"daily"`로 변경. `lastModified`는 기존대로 레코드별 `syncedAt`(정확히는 `data_standard_date`) 기반 유지, 이 값만 조정 |
| daycares/page.tsx, contents/page.tsx — daum-wm-* 히든 마크업 누락 | P2 | `apps/web/app/daycares/page.tsx`, `apps/web/app/contents/page.tsx` | 다른 라우트(`rankings`, `daycare/[id]` 등)와 동일한 `daum-wm-title hidden` / `daum-wm-content hidden` div 패턴 추가. `contents/page.tsx`는 기존에 title/description이 `metadata` 객체에 인라인돼 있어 `TITLE`/`DESCRIPTION` 상수로 추출(daycares/page.tsx 기존 패턴과 통일)해 중복 문자열 없이 재사용 |
| daycares, contents 목록 페이지 — BreadcrumbList 없음 | P2 | `apps/web/lib/structured-data/breadcrumb.ts`(신규), `apps/web/app/daycares/page.tsx`, `apps/web/app/contents/page.tsx` | `RankingsPageView.tsx`의 인라인 breadcrumbLd 패턴을 `buildBreadcrumbJsonLd(items)` 공용 빌더로 분리 후 두 목록 페이지에 각각 `키즐리 > 어린이집 목록`, `키즐리 > 콘텐츠` 2단 breadcrumb 추가. 기존에 이미 인라인으로 breadcrumbLd를 쓰고 있는 `DaycareDetailSSR.tsx`/`RankingsPageView.tsx`는 이번 이슈 범위 밖이라 건드리지 않음(외과적 변경 원칙) |
| /api 경로 robots.txt 크롤 차단 없음 | P2 | `apps/web/public/robots.txt` | `Allow: /` 다음 줄에 `Disallow: /api/` 추가. `#DaumWebMasterTool` 인증 주석, `naver-site-verification` 등 기존 라인은 그대로 보존 |
| daycare/[id] 제목 템플릿 60자 초과 가능성 | P2 | `apps/web/components/daycare/detail/DaycareDetailSSR.tsx` | 코드로 직접 확인 처리(아래 "확인 방법" 참고). Supabase `daycares` 테이블(status='정상', 약 24,586건) 전수 조회 결과 60자 초과는 1건(63자, "공덕베이비시터하우스어린이집(공덕동크로시티행복주택어린이집")뿐이었음. `buildDaycareMetaStrings`에 길이 가드 추가 — 시도+시군구 포함 title이 60자를 넘고 `sidoName`이 있으면 시군구를 생략하고 시도명만으로 재구성(해당 사례는 59자로 축소되어 해소). `addressLine`/`description` 계산은 기존 `location` 값을 그대로 사용해 건드리지 않음 |

### 확인 방법 (title 길이 이슈)

`.env`의 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`(공개 read-only anon key, 앱이 이미 프로덕션에서 사용 중인 것과 동일)로 Supabase REST API에 직접 페이지네이션 조회(`daycares` 테이블, `status=eq.정상`, `name`/`sido_name`/`sigungu_name`/`type_name` 컬럼만 select)해 `buildDaycareMetaStrings`와 동일한 title 생성 로직을 Node 스크립트로 재현, 전수(24,586건)에 대해 길이를 계산했다. 스크립트는 스크래치패드에서 1회성으로 실행 후 삭제했다(저장소에 커밋된 파일 없음).

## 검증 결과 (P2 반영 후)

lint: ✅ (0 errors, 18 pre-existing warnings — 이번 변경과 무관)
typecheck: ✅
build: ✅ (`pnpm --filter web build` 성공, 53개 라우트 정상 생성)
