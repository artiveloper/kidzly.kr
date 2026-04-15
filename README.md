# kidzly.kr

지도 기반으로 내 주변 어린이집을 빠르게 찾고, 유형·운영시간·서비스를 한눈에 비교할 수 있는 검색 서비스

## 주요 기능

- **지도 기반 탐색** — 현재 지도 영역의 어린이집을 실시간으로 조회
- **필터링** — 어린이집 유형, 서비스 유형(시간제, 장애아 등)으로 필터링
- **상세 정보** — 정원, 현원, 연령별 대기 현황, CCTV, 차량 운행 등 공공데이터 기반 상세 정보 제공
- **인터셉트 라우트** — 목록에서 상세 진입 시 모달로 표시, 직접 URL 접근 시 전용 페이지로 표시

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Data Fetching | TanStack React Query v5 |
| URL State | nuqs |
| Styling | Tailwind CSS v4 |
| Map | Naver Maps |
| Backend | Supabase |
| Monorepo | Turborepo + pnpm |
| Deploy | Vercel |

## 아키텍처

### 도메인 기반 구조

데이터 흐름과 책임을 명확히 하기 위해 **도메인 기반 디렉토리 구조**를 채택했습니다.

```
apps/web/domain/
└── daycare/
    ├── index.ts           # 클라이언트 public API
    ├── server.ts          # 서버 전용 public API (server-only)
    ├── types/             # 도메인 타입 정의
    ├── apis/              # 외부 API 호출 (fetch)
    ├── parser/            # API 응답 → 도메인 타입 변환
    ├── query-keys/        # Query Key 팩토리
    ├── query-options/     # queryOptions 팩토리 (hooks & prefetch 공유)
    ├── hooks/             # Client-side React Query hooks
    └── prefetch/          # SSR prefetch (server-only)
```

### 서버/클라이언트 분리

- **Server Components** 기본 — 불필요한 클라이언트 JavaScript 최소화
- **SSR Prefetch** — 페이지 진입 시 React Query로 prefetch → dehydrate → hydrate, SEO와 LCP 확보
- **`queryOptions` 공유** — prefetch와 `useQuery`가 동일한 queryKey/queryFn을 사용하여 hydration 불일치 방지

### 멀티 레이어 캐시 전략

```
L0: Next.js fetch cache  (ISR / revalidateTag)
L1: React cache()        (RSC 렌더링 내 중복 요청 제거)
L2: React Query cache    (UI 상태의 단일 출처)
```

## 시작하기

**필요 환경:** Node.js ≥ 20, pnpm 9

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

환경 변수는 `apps/web/.env.local` 에 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
```

## 프로젝트 구조

```
kidzly.kr/
├── apps/
│   └── web/               # Next.js 앱
│       ├── app/           # App Router (pages, layouts, intercepting routes)
│       ├── components/    # UI 컴포넌트 (도메인별 분류)
│       ├── domain/        # 도메인 로직 (API, Query, Prefetch)
│       ├── hooks/         # 공통 hooks
│       └── lib/           # 유틸리티 (React Query 설정 등)
└── packages/
    ├── ui/                # 공유 UI 컴포넌트 (shadcn/ui 기반)
    ├── eslint-config/     # 공유 ESLint 설정
    └── typescript-config/ # 공유 TypeScript 설정
```
