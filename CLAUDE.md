# CLAUDE.md
> Next.js 16 · React 19 · React Query v5 | Lighthouse ≥ 90

---

## 1. Stack

- Next.js 16 (App Router) · React 19 · TypeScript strict
- TanStack React Query v5 · nuqs v2 · Tailwind CSS v4
- Supabase JS v2 (`@supabase/supabase-js`) — public read-only, no auth
- `server-only` 패키지

---

## 2. Architecture

- Domain-based directory structure — **MANDATORY**
- Server Components 기본; Client Components 최소화·명시적
- 서버 데이터 상태 → React Query만 (`useState`+fetch 금지)
- UI 컴포넌트에 데이터 패칭 로직 작성 금지 → domain hooks 사용

---

## 3. Domain Structure

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

## 4. APIs Layer

- `lib/supabase/client.ts` / `lib/supabase/server.ts` 사용
- non-null assertion(`!`) 금지 — 명시적 null 체크 후 에러 throw
- 에러 → throw (React Query가 error state 처리)
- Supabase 쿼리는 `apis/` 레이어에서만

---

## 5. React Query

- queryKey: 팩토리 함수만 — inline 직접 작성 금지
- queryFn: queryOptions 팩토리만 — inline useQuery 금지
- `useSuspenseQuery` 기본; `useQuery`는 Suspense 불가 시만
- `useEffect` 내 fetch 금지
- `router.refresh()` 데이터 갱신 금지 → `invalidateQueries`
- `useInfiniteQuery`: hooks 파일에 직접 정의 (queryKey는 팩토리 사용)
- staleTime override: 실시간·정적 데이터만; 일반 리스트는 global 사용

> 구현 패턴 상세: `.claude/skills/kidzly-refactor/references/react-query-patterns.md`

---

## 6. Prefetch

- 리스트·상세 페이지: **필수**
- 무한 스크롤 첫 페이지: `prefetchInfiniteQuery` 필수
- 이후 페이지·모달 전용 데이터: 금지
- `prefetch.ts` + `server.ts` 모두 `import "server-only"` 필수
- queryOptions 재사용으로 prefetch↔hook queryKey 일치 보장
- Page에서 직접 QueryClient 다루지 않음 → `runPrefetch` 사용

---

## 7. 상태 소유권

| 상태 유형 | 도구 |
|----------|------|
| 서버 데이터 | React Query |
| URL 상태 (필터·정렬·페이지·탭) | nuqs |
| 로컬 UI (모달 open, 입력값) | useState |

판단 흐름: 서버 데이터? → React Query / URL 복원 필요? → nuqs / 컴포넌트 내부? → useState

---

## 8. nuqs 규칙

- 목록 필터·검색·정렬·페이지·탭은 `useQueryState`/`useQueryStates` 사용
- nuqs 값을 queryOptions 파라미터로 전달 → queryKey에 포함
- Server Component: `searchParams`로 초기값 읽어 prefetch에 반영
- 검색 입력: 300ms 디바운스 후 URL 반영 (매 키 입력마다 리패치 금지)
- `null`이면 query param 제거

---

## 9. Mutation

- `invalidateQueries`로 갱신 — UI 상태 직접 수정 금지
- `router.refresh()` 금지 (인증 세션 갱신 예외)
- 낙관적 업데이트: `onMutate` + `onError` + `onSettled` 패턴

---

## 10. Server/Client 경계

- `server.ts`, `prefetch`: `import "server-only"` 필수
- `apis`: server-only 불필요 (양쪽 모두 사용)
- hooks: server-only 불필요 (클라이언트 전용)

---

## 11. Suspense & Error 경계 (3계층)

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

## 12. 로딩 · 에러 · 빈 상태

- 로딩 텍스트(`"불러오는 중..."`) 금지 → Skeleton 컴포넌트 사용
- Skeleton은 최종 레이아웃 크기와 일치 (CLS 방지)
- 에러: 사용자 친화 메시지 — 원본 Error 객체 UI 노출 금지
- 빈 상태: 에러 아님 — 왜 비었는지 설명하는 UI 제공

---

## 13. 날짜 · 시간

- **모든** 날짜·시간 표시: `lib/format.ts`의 `formatDate` / `formatDateTime` 사용 (KST)
- `new Date(x).toLocaleDateString('ko-KR')` timeZone 누락 형태 금지

---

## 14. TypeScript

- `any` 금지
- non-null assertion (`!`) 금지
- `type` 사용 (`interface` 아님)
- 타입 조기 좁히기 (narrow early)

---

## 15. 코드 포맷 (MANDATORY)

- 들여쓰기: **4공백** (탭·2공백 금지)
- TypeScript · JavaScript · JSON · JSX/TSX 전체 적용

---

## 16. Mobile-First (MANDATORY)

- 모바일 기준 시작 → `sm:` `md:` `lg:` 순 확장
- 터치 타겟 최소 44×44px
- hover-only 인터랙션 금지 — tap 대안 필수
- 넘치는 테이블: `overflow-x-auto`

---

## 17. 컴포넌트 규칙

- 파일당 컴포넌트 1개, default export
- 200줄 초과 또는 props 과다 시 분리
- 데이터(domain hooks)와 표현(render) 분리 — 컴포넌트는 렌더링만

---

## 18. 접근성 (WCAG AA)

- 시맨틱 HTML, 폼 `label`/`aria-*` 필수
- 명암비: 본문 4.5:1, 큰 텍스트·UI 컴포넌트 3:1
- 인터랙티브 요소 `focus-visible` 제거 금지
- 이미지 `alt` 필수 (장식 이미지는 `alt=""`)
- `<img>` 태그 금지 → `next/image` 사용

---

## 19. Performance

- `useEffect` fetch 금지 (React Query 사용)
- 자주 렌더링되는 컴포넌트 내 dynamic import 금지
- Server Components 우선
- 하이드레이션 페이로드 최소화
- Supabase: 필요한 컬럼만 `select()`, 목록 조회 `limit()` 강제, N+1 쿼리 금지

---

## 하네스: 어린이집 부모 대상 콘텐츠 크리에이터

**목표:** 어린이집·유치원 부모를 대상으로 한 SEO 최적화 블로그 아티클 + 이미지 기획을 에이전트 팀이 자동 생성

**트리거:** 부모 대상 콘텐츠 작성, SEO 글쓰기, 이미지 기획 요청 시 `content-creator` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

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
