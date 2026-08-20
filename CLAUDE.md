# CLAUDE.md — 키즐리(kidzly.kr) 작업 지침
> Next.js 16 · React 19 · React Query v5 | Lighthouse ≥ 90

이 문서는 키즐리 저장소에서 코드를 다룰 때 지켜야 할 행동 지침이다.
속도보다 신중함을 우선한다. 불필요한 diff가 줄고, 재작성이 줄고, 질문이 앞당겨지면 잘 지켜지고 있는 것이다.

---

## 작업 원칙

### 1. 코딩 전에 생각한다

가정하지 말고, 혼란을 숨기지 말고, 트레이드오프를 드러낸다.

- 가정은 명시한다. 불확실하면 묻는다.
- 해석이 여럿이면 조용히 하나를 고르지 말고 제시한다.
- 더 단순한 방법이 있으면 말한다. 필요하면 반대 의견도 낸다.
- 불명확하면 멈추고, 무엇이 헷갈리는지 이름 붙여 묻는다.

### 2. 단순함 우선

문제를 푸는 최소 코드만 쓴다. 추측성 구현은 없다.

- 요청받지 않은 기능·추상화·"유연성"은 넣지 않는다.
- 일어날 수 없는 시나리오에 대한 에러 처리는 넣지 않는다.
- 200줄인데 50줄로 될 것 같으면 다시 쓴다. "시니어가 과설계라 할까?" 자문한다.

### 3. 외과적 변경

건드려야 하는 것만 건드리고, 내가 만든 것만 치운다.

- 인접 코드·주석·서식을 "개선"하지 않는다. 안 깨진 걸 리팩터링하지 않는다.
- 내가 좋아하는 방식이라도 기존 스타일에 맞춘다.
- 무관한 죽은 코드는 발견하면 언급만 하고 지우지 않는다.
- 단, 내 변경이 만든 미사용 import·변수·함수는 내가 제거한다.

### 4. 목표 기반 실행

성공 기준을 정의하고 검증될 때까지 반복한다.

- "검증 추가"는 "잘못된 입력에 대한 테스트를 쓰고 통과시킨다"로 바꾼다.
- "버그 수정"은 "재현 테스트를 쓰고 통과시킨다"로 바꾼다.
- 다단계 작업은 먼저 짧게 적는다. 단계별 **계획**, 완료를 표시할 **체크리스트**, 결정·전제를 남기는 **컨텍스트 노트**를 두고, 각 단계마다 검증 방법을 명시한다.

### 5. 한국어 출력 시 문장 끝은 마침표

한국어 문장을 콜론(:)으로 끝내지 않는다.

- 다음 줄이 목록·예시여도 문장 종결은 `.` `?` `!` 로 한다.
- 영어 문서로 학습된 콜론 습관이 한국어에 새어 나온다. 잡아낸다.
- 코드·키값 쌍·라벨 안의 콜론은 괜찮다. 문장 종결로만 쓰지 않는다.

### 6. 새 파일 첫 줄은 한국어 역할 주석

새 소스 파일을 만들면 첫 줄에 역할을 한 줄 한국어로 적는다.

- TypeScript는 `// 어린이집 목록을 무한 스크롤로 렌더링하는 리스트 컴포넌트` 처럼 쓴다.
- 필수 지시자(`'use client'`, `'use server'` 등) 바로 아래 둔다.
- 설정 파일(`*.json`, `*.mjs` 설정 등)은 예외다.
- 이유는 에이전트가 파일을 선택적으로 읽기 때문이다. 한 줄 헤더가 다음 세션에 즉시 맥락을 준다.

### 7. 오류는 읽고, 추측하지 않는다

실패하면 실제 에러·로그 줄을 읽는다.

- 전체 에러 메시지와 스택 트레이스를 읽는다. 가정한 로그가 아니라 실제 출력을 본다.
- 원인 확인 전에 "흔한 수정"을 적용하지 않는다. 불명확하면 로그를 찍어 상태를 확인한 뒤 고친다.
- 이 저장소는 Supabase·네이버 지도 SDK 같은 외부 의존이 있다. 실패 시 어느 경계에서 났는지(Server Component fetch/React Query/Supabase 쿼리/지도 SDK) 먼저 특정한다.

### 8. 완료 전에 실행해서 확인한다

코드를 건드렸으면 "다 됐다"고 하기 전에 검증한다.

- 린트·타입체크를 맞춘다(`pnpm lint`, `pnpm typecheck`, 웹만이면 `apps/web`에서 동일 스크립트).
- 빌드로 확인한다(`pnpm build`, Next.js는 `next build`로 라우트·타입 오류까지 잡힌다).
- 사용자가 "끝", "완료"라고 하기 전에 선제적으로 검증한다.

### 9. 커밋은 원자적·의미 단위로

되돌릴 수 있게, 한 번에 하나의 논리적 변경만 커밋한다.

- 무관한 변경을 한 커밋에 섞지 않는다. 리팩터링과 기능 추가를 분리한다.
- 커밋 메시지는 "무엇을 왜"가 드러나게 쓴다.
- 커밋·푸시는 사용자가 요청할 때 한다. `main` 에 직접 커밋·푸시한다(별도 브랜치를 만들지 않는다).

---

## 기술 스펙

### 10. Stack

- Next.js 16 (App Router) · React 19 · TypeScript strict
- TanStack React Query v5 · nuqs v2 · Tailwind CSS v4
- Supabase JS v2 (`@supabase/supabase-js`) — public read-only, no auth
- `server-only` 패키지

---

### 11. Architecture

- Domain-based directory structure — **MANDATORY**
- Server Components 기본; Client Components 최소화·명시적
- 서버 데이터 상태 → React Query만 (`useState`+fetch 금지)
- UI 컴포넌트에 데이터 패칭 로직 작성 금지 → domain hooks 사용

---

### 12. Domain Structure

```
apps/web/domain/{name}/
├── index.ts          — client-safe public API
├── server.ts         — server-only (import "server-only" 필수)
├── types/index.ts
├── apis/{name}.api.ts
├── parser/{name}.parser.ts   ← 단수형 강제 (parsers/ 금지)
├── query-keys/{name}.query-keys.ts
├── query-options/{name}.query-options.ts
├── hooks/{name}.hooks.ts
└── prefetch/{name}.prefetch.ts  (import "server-only" 필수)
```

**Import 규칙:**
- deep import 금지, `export *` 금지
- Client Component → `index.ts` entry만
- Server page → `server.ts` entry 사용

**Entry point:**
- `index.ts`: types, hooks, queryKeys, queryOptions export
- `server.ts`: prefetch만 re-export

---

### 13. APIs Layer

- `lib/supabase/client.ts` / `lib/supabase/server.ts` 사용
- non-null assertion(`!`) 금지 — 명시적 null 체크 후 에러 throw
- 에러 → throw (React Query가 error state 처리)
- Supabase 쿼리는 `apis/` 레이어에서만

---

### 14. React Query

- queryKey: 팩토리 함수만 — inline 직접 작성 금지
- queryFn: queryOptions 팩토리만 — inline useQuery 금지
- `useSuspenseQuery` 기본; `useQuery`는 Suspense 불가 시만
- `useEffect` 내 fetch 금지
- `router.refresh()` 데이터 갱신 금지 → `invalidateQueries`
- `useInfiniteQuery`: hooks 파일에 직접 정의 (queryKey는 팩토리 사용)
- staleTime override: 실시간·정적 데이터만; 일반 리스트는 global 사용

> 구현 패턴 상세: `.claude/skills/kidzly-refactor/references/react-query-patterns.md`

---

### 15. Prefetch

- 리스트·상세 페이지: **필수**
- 무한 스크롤 첫 페이지: `prefetchInfiniteQuery` 필수
- 이후 페이지·모달 전용 데이터: 금지
- `prefetch.ts` + `server.ts` 모두 `import "server-only"` 필수
- queryOptions 재사용으로 prefetch↔hook queryKey 일치 보장
- Page에서 직접 QueryClient 다루지 않음 → `runPrefetch` 사용

---

### 16. 상태 소유권

| 상태 유형 | 도구 |
|----------|------|
| 서버 데이터 | React Query |
| URL 상태 (필터·정렬·페이지·탭) | nuqs |
| 로컬 UI (모달 open, 입력값) | useState |

판단 흐름: 서버 데이터? → React Query / URL 복원 필요? → nuqs / 컴포넌트 내부? → useState

---

### 17. nuqs 규칙

- 목록 필터·검색·정렬·페이지·탭은 `useQueryState`/`useQueryStates` 사용
- nuqs 값을 queryOptions 파라미터로 전달 → queryKey에 포함
- Server Component: `searchParams`로 초기값 읽어 prefetch에 반영
- 검색 입력: 300ms 디바운스 후 URL 반영 (매 키 입력마다 리패치 금지)
- `null`이면 query param 제거

---

### 18. Mutation

- `invalidateQueries`로 갱신 — UI 상태 직접 수정 금지
- `router.refresh()` 금지 (인증 세션 갱신 예외)
- 낙관적 업데이트: `onMutate` + `onError` + `onSettled` 패턴

---

### 19. Server/Client 경계

- `server.ts`, `prefetch`: `import "server-only"` 필수
- `apis`: server-only 불필요 (양쪽 모두 사용)
- hooks: server-only 불필요 (클라이언트 전용)

---

### 20. Suspense & Error 경계 (3계층)

| 계층 | 파일 | 대상 |
|------|------|------|
| 전역 | `global-error.tsx` | 루트 레이아웃 실패 |
| 라우트 | `error.tsx` + `loading.tsx` | 페이지 단위 |
| 컴포넌트 | `<ErrorBoundary>` + `<Suspense>` | 독립 데이터 영역 |

- `useSuspenseQuery` → 반드시 `<Suspense>` 안에
- `loading.tsx` → 세그먼트 자동 Suspense (streaming skeleton)
- `QueryErrorResetBoundary` + `ErrorBoundary` 연결 필수
- 예상된 실패(폼·mutation): `isError`/`ActionResult` 인라인 처리 (바운더리 throw 금지)
- 404 → `notFound()`, 인증 만료 → redirect

---

### 21. 로딩 · 에러 · 빈 상태

- 로딩 텍스트(`"불러오는 중..."`) 금지 → Skeleton 컴포넌트 사용
- Skeleton은 최종 레이아웃 크기와 일치 (CLS 방지)
- 에러: 사용자 친화 메시지 — 원본 Error 객체 UI 노출 금지
- 빈 상태: 에러 아님 — 왜 비었는지 설명하는 UI 제공

---

### 22. 날짜 · 시간

- **모든** 날짜·시간 표시: `lib/format.ts`의 `formatDate` / `formatDateTime` 사용 (KST)
- `new Date(x).toLocaleDateString('ko-KR')` timeZone 누락 형태 금지

---

### 23. TypeScript

- `any` 금지
- non-null assertion (`!`) 금지
- `type` 사용 (`interface` 아님)
- 타입 조기 좁히기 (narrow early)

---

### 24. 코드 포맷 (MANDATORY)

- 들여쓰기: **4공백** (탭·2공백 금지)
- TypeScript · JavaScript · JSON · JSX/TSX 전체 적용

---

### 25. Mobile-First (MANDATORY)

- 모바일 기준 시작 → `sm:` `md:` `lg:` 순 확장
- 터치 타겟 최소 44×44px
- hover-only 인터랙션 금지 — tap 대안 필수
- 넘치는 테이블: `overflow-x-auto`

---

### 26. 컴포넌트 규칙

- 파일당 컴포넌트 1개, default export
- 200줄 초과 또는 props 과다 시 분리
- 데이터(domain hooks)와 표현(render) 분리 — 컴포넌트는 렌더링만

---

### 27. 접근성 (WCAG AA)

- 시맨틱 HTML, 폼 `label`/`aria-*` 필수
- 명암비: 본문 4.5:1, 큰 텍스트·UI 컴포넌트 3:1
- 인터랙티브 요소 `focus-visible` 제거 금지
- 이미지 `alt` 필수 (장식 이미지는 `alt=""`)
- `<img>` 태그 금지 → `next/image` 사용

---

### 28. Performance

- `useEffect` fetch 금지 (React Query 사용)
- 자주 렌더링되는 컴포넌트 내 dynamic import 금지
- Server Components 우선
- 하이드레이션 페이로드 최소화
- Supabase: 필요한 컬럼만 `select()`, 목록 조회 `limit()` 강제, N+1 쿼리 금지

---

## 하네스: 어린이집 부모 대상 콘텐츠 크리에이터

**목표:** 어린이집·유치원 부모를 대상으로 한 SEO 최적화 블로그 아티클 + 이미지 기획을 에이전트 팀이 자동 생성

**트리거:** 부모 대상 콘텐츠 작성, SEO 글쓰기, 이미지 기획 요청 시 `content-creator` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**발행 관리:** 새 글을 기획하기 전에 `docs/content/`를 먼저 읽는다. 중복 주제 발행과 카테고리 난립을 막기 위해서다.
- `docs/content/README.md` — 발행 워크플로, frontmatter 스키마, 카테고리 체계, 집필 규칙
- `docs/content/발행-완료.md` — 발행된 글 인벤토리
- `docs/content/발행-예정.md` — 후보 주제, 우선순위, 집필 전 검증 사항

발행이 끝나면 해당 항목을 `발행-예정.md`에서 지우고 `발행-완료.md`로 옮긴다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-28 | 초기 구성 | 전체 | - |
| 2026-06-28 | 이미지 생성 방식 변경 (AI 프롬프트 → HTML/CSS + Playwright PNG 캡처, 1080×1080px) | agents/image-director.md, skills/content-creator/scripts/capture.py, skills/content-creator/references/image-html-template.md | 사용자 가이드 반영 |
| 2026-06-28 | 자체 검수 루프 추가 (PNG 캡처 후 Read로 시각 확인 → HTML 수정 → 재캡처, 최대 3회) | agents/image-director.md | 사용자 요청 |
| 2026-06-28 | 예상 읽기 시간·카테고리·태그 메타, 3초 룰, 한 문단 3~4줄, 핵심 포인트 callout, 관련 포스트 추천, 이미지 alt 텍스트 추가 | agents/seo-writer.md | blog-writer 에이전트 참고 |
| 2026-06-28 | 출처 검증 체계 전면 도입 — fact-checker 에이전트 추가, researcher 출처 수집 의무화, seo-writer 인라인 출처 표기, integrator 검증 출처 목록 패키지 포함, 오케스트레이터 Phase 4(팩트체크) 추가 | 전체 | 어린이집 부모 대상 글의 사실 관계·출처 신뢰성 강화 |
| 2026-06-28 | 서브 에이전트·팀원 모델 opus → sonnet (Sonnet 4.6) 변경, 오케스트레이터는 유지 | skills/content-creator/SKILL.md | 비용 최적화 |
| 2026-07-16 | 썸네일(유형 1) 디자인 변경 — 텍스트 기반 타이틀 카드 → 앱 아이콘 스타일(그라디언트 칩 + 대표 이모지, 텍스트 없음), 포인트 컬러 팔레트 8종 추가. 발행된 4개 아티클 썸네일 재생성 반영 | skills/content-creator/references/image-html-template.md, agents/image-director.md, apps/web/public/blog/*/thumbnail.png | 리스트 노출 크기(96~112px)에서 기존 텍스트 기반 썸네일이 안 읽히고 시선 집중력이 낮다는 사용자 피드백 |
| 2026-07-23 | Phase 7(실제 발행) 신설 — `.mdx` 커밋 전 `npx velite build` 실행을 발행의 기계적 게이트로 명문화 | skills/content-creator/SKILL.md, agents/content-integrator.md | "육아기 근로시간 단축 제도" 글이 이스케이프 안 된 `~`(범위 표기)로 인해 velite 컴파일이 실패, 목록에서 조용히 누락된 사고 발생. `~` 이스케이프 규칙이 seo-writer.md·content-integrator.md 체크리스트에 이미 있었음에도 자가 점검만으로는 놓쳐 실제 빌드 검증이 없으면 재발 가능하다고 판단 |
| 2026-08-17 | 구글 2026 랭킹 기준 4개 축 반영 — ①에버그린 주제 판정 + 갱신 데이터 층, ②제목 공식(`키워드 + 후킹 − 군더더기`, 한글 30~40자), ③해결형 프레임 강제·홍보형 금지·CTA를 "다음 행동 안내"로 재정의, ④완결성 우선(글 길이 상한 완화, 구체 수치·조건별 분해·예외 케이스 의무화) + 정보 이득 포인트 최소 2가지 | agents/content-researcher.md, agents/seo-writer.md, agents/content-integrator.md | 기존 기준에 에버그린·완결성 항목이 없었고, "1,500~2,500자" 상한과 필수 CTA가 오히려 완결성·해결형과 충돌. 2026 코어 업데이트 기조(정보 이득, 홍보성 톤 불리, 재검색 불필요한 완결성)를 확인해 반영 |
| 2026-08-17 | 발행 관리 문서 `docs/content/` 신설(README·발행-완료·발행-예정) 및 하네스에 포인터 추가 | CLAUDE.md, docs/content/* | 발행 이력이 `.mdx` frontmatter에만 흩어져 있어 중복 주제 발행과 카테고리 난립 위험이 있었다. 어린이집 생활 클러스터(입학 전 준비·원 생활·결석 대응) 22편 로드맵을 정리하며 함께 구성 |
| 2026-08-20 | 구글 공식 문서 4종 대조 반영 — ①**Who**: 편집·검증 정책 페이지(`/about/editorial`) 신설 + 글 바이라인 + `Article` JSON-LD `author.url`·`publishingPrinciples`, ②**How**: AI 초안 사용과 사람 검수 절차 공개, 검수 기록 규칙, ③**원본 정보**: 정보 이득 2가지 중 1가지 이상을 키즐리 자체 어린이집 데이터에서 확보, ④목표 글자 수·H2 개수·섹션 길이 강제 삭제(구글이 랭킹 무관이라 명시), ⑤참고 자료를 홈페이지 URL → 원문 deep link + 문서명 앵커로 전환하고 fact-checker에 링크 실접속 점검 단계 추가, ⑥표현 변형(공식 용어 ↔ 부모가 쓰는 말) 수집·반영 의무화, ⑦`updatedAt` 갱신 요건과 갱신 이력 기록 신설, ⑧교정·제목/디스크립션 교차 유일성 체크리스트 추가 | agents/content-researcher.md, agents/seo-writer.md, agents/fact-checker.md, agents/content-integrator.md, docs/content/README.md, docs/content/발행-완료.md, apps/web/app/about/editorial/page.tsx, apps/web/app/contents/[slug]/page.tsx, apps/web/lib/structured-data/article.ts, apps/web/app/sitemap.ts, apps/web/components/common/Footer.tsx | 에이전트 파이프라인이 23편을 자동 생성했는데 저자 표기와 자동화 공개가 어디에도 없었다. 구글은 바이라인·저자 배경 링크를 요구하고 "여러 주제에 걸친 광범위한 자동화"를 검색엔진 우선 콘텐츠의 신호로 들며, 보육료·급여·감염병 기준은 YMYL이라 신뢰 신호의 비중이 크다. 동시에 기존 정책의 `1,500~2,500자`·`H2 3~5개` 같은 수치 목표는 구글이 랭킹 무관이라고 명시한 항목이라 완결성 원칙과 충돌하고 있었다 |

---

## 하네스: kidzly-web 개발

**목표:** CLAUDE.md 스펙 기반 코드베이스 리팩토링 및 신규 도메인/UI 구현 자동화

**트리거:** 리팩토링, 도메인 구현, 코드 리뷰, UI 구현 요청 시 `kidzly-refactor` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-07-01 | 초기 구성 | 전체 | temp/ 에이전트/스킬 기반 kidzly-web 개발 하네스 구성 |
| 2026-07-01 | CLAUDE.md 슬림화 — 규칙만 유지, 코드 예시 제거 | CLAUDE.md | 컨텍스트 효율화 + temp/ 패턴 반영 |
| 2026-07-01 | temp/ 컨벤션 전면 반영 — WCAG AA, N+1, 날짜 KST, nuqs, 에러경계, Skeleton 규칙 추가 | CLAUDE.md, agents/*, skills/supabase-guide | temp/ 기준 가이드 통합 |
| 2026-08-16 | "작업 원칙" 9개 조항(생각 먼저, 단순함 우선, 외과적 변경, 목표 기반 실행, 한국어 마침표, 새 파일 한국어 역할 주석, 오류는 읽고 추측 안 함, 실행 검증, 원자적 커밋) 신설, 기존 기술 스펙은 "기술 스펙" 절로 유지하며 10~28번으로 재번호 | CLAUDE.md | 다른 저장소용 CLAUDE.md가 실수로 덮어써진 것을 복구하는 과정에서, 그 문서의 행동 지침 부분이 유용하다고 판단해 키즐리 기준으로 반영 |

---

## 하네스: 사이트 SEO 관리

**목표:** 구글·네이버·다음 3사 기준으로 kidzly-web의 기술 SEO(메타데이터·구조화 데이터·sitemap/robots)를 진단하고, 승인 시 코드에 반영

**트리거:** SEO 점검, 검색 노출 진단, 구조화 데이터 추가, 메타태그 점검 요청 시 `seo-manager` 스킬을 사용하라. 글 단위 SEO 카피라이팅은 `content-creator`(`seo-writer`)가 계속 담당 — 역할이 겹치지 않는다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-08-16 | 초기 구성 — seo-auditor(진단, 코드 수정 없음) → 승인 시 seo-engineer(반영) 2단계 파이프라인. 구글 Scaled Content Abuse(2026.3 코어 업데이트) 리스크를 P0 최우선 점검 항목으로 반영, 네이버/다음은 API 자격증명 없이 체크리스트 산출물로 대응 | agents/seo-auditor.md, agents/seo-engineer.md, skills/seo-manager/SKILL.md, skills/seo-manager/references/naver-daum-google-seo-guide.md | 2026년 최신 3사 SEO 리서치 기반 신규 하네스 구성. 기술 SEO와 콘텐츠 SEO(content-creator)의 역할 중복을 피하기 위해 범위를 사이트 구조로 한정 |
| 2026-08-19 | 구글 공식 문서 크로스체크 반영 — §1.4 구조화 데이터 오류 3건 수정(ChildCare 타입 존재, `additionalType` 미지원, `image` 요건), §1.5 AI 항목을 공식 `ai-optimization-guide` 기준으로 재작성, **§1.7 "구글 공식 규정" 신설**(원문 대조 확인 항목만 수록, 감사에서 그대로 인용 가능), 출처를 공식/3자로 등급 분리 | skills/seo-manager/references/naver-daum-google-seo-guide.md, CLAUDE.md | 정책 문서 출처 20개 중 구글 공식 문서가 1개뿐이라 사이트맵 `lastmod`·숨겨진 텍스트 예외·`ItemList` 필수 속성 같은 규정이 통째로 빠져 있었고, 그 결과 직전 감사가 P1 5건을 놓쳤다. 산출물은 `apps/web/_workspace/seo/03_google_docs_crosscheck.md` |
