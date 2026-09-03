# kidzly.kr

지도 기반으로 내 주변 어린이집을 빠르게 찾고, 유형·운영시간·서비스를 한눈에 비교할 수 있는 검색 서비스

## 주요 기능

- **지도 기반 탐색** — 현재 지도 영역의 어린이집을 실시간으로 조회
- **필터링** — 어린이집 유형, 서비스 유형(시간제, 장애아 등)으로 필터링
- **상세 정보** — 정원, 현원, 연령별 대기 현황, CCTV, 차량 운행 등 공공데이터 기반 상세 정보 제공
- **지역별 목록·랭킹** — 시도·시군구 단위로 어린이집을 모아보고 순위 비교
- **인터셉트 라우트** — 목록에서 상세 진입 시 모달로 표시, 직접 URL 접근 시 전용 페이지로 표시
- **콘텐츠(블로그)** — 어린이집 부모를 위한 보육 제도·지원금·원 생활 가이드를 MDX로 발행

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
| Content | Velite (MDX) |
| Monorepo | Turborepo + pnpm |
| Deploy | Vercel |

## 아키텍처

### 도메인 기반 구조

데이터 흐름과 책임을 명확히 하기 위해 **도메인 기반 디렉토리 구조**를 채택했습니다.

```
apps/web/domain/
├── daycare/              # 어린이집 검색·상세 (핵심 도메인)
│   ├── index.ts          # 클라이언트 public API
│   ├── server.ts         # 서버 전용 public API (server-only)
│   ├── types/            # 도메인 타입 정의
│   ├── apis/             # 외부 API 호출 (fetch)
│   ├── parser/           # API 응답 → 도메인 타입 변환
│   ├── query-keys/       # Query Key 팩토리
│   ├── query-options/    # queryOptions 팩토리 (hooks & prefetch 공유)
│   ├── hooks/            # Client-side React Query hooks
│   └── prefetch/         # SSR prefetch (server-only)
├── article/              # 블로그 아티클 조회
├── naver-blog/           # 네이버 블로그 검색 연동
└── region/               # 시도·시군구 지역 데이터
```

도메인마다 필요한 레이어만 둡니다. 예를 들어 `region`은 서버에서만 쓰이므로 `apis`·`hooks`가 없습니다.

### 서버/클라이언트 분리

- **Server Components** 기본 — 불필요한 클라이언트 JavaScript 최소화
- **SSR Prefetch** — 페이지 진입 시 React Query로 prefetch → dehydrate → hydrate, SEO와 LCP 확보
- **`queryOptions` 공유** — prefetch와 `useQuery`가 동일한 queryKey/queryFn을 사용하여 hydration 불일치 방지

### 라우트

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 서비스 소개·검색 진입·FAQ |
| `/map` | 지도 기반 어린이집 탐색 |
| `/daycares` | 어린이집 목록 — 시도 선택·인허가예정 탭(`?tab=upcoming`) |
| `/daycares/[sido]`, `/daycares/[sido]/[sigungu]` | 지역별 어린이집 목록 (옛 `?sido=`·`?arcode=` 쿼리 URL은 308로 이전) |
| `/daycare/[id]` | 어린이집 상세 (목록에서 진입 시 `@modal`로 인터셉트) |
| `/rankings`, `/rankings/[sido]` | 지역별 어린이집 랭킹 |
| `/contents`, `/contents/[slug]` | 블로그 목록·상세 |
| `/about`, `/about/editorial` | 서비스 소개·편집 정책 |
| `/terms`, `/privacy-policy` | 이용약관·개인정보 처리방침 |
| `/api/naver/blog` | 네이버 블로그 검색 프록시 |
| `/api/article/[uuid]/view`, `/api/article/[uuid]/like` | 아티클 조회수·좋아요 집계 |

### 콘텐츠 파이프라인

블로그 글은 `apps/web/content/blog/*.mdx`에 두고 **Velite**가 빌드 타임에 컴파일합니다. 스키마는 `apps/web/velite.config.ts`에 정의되어 있으며, frontmatter 필드가 하나라도 빠지면 빌드가 실패합니다.

발행 이력과 발행 계획은 [`docs/content/`](./docs/content/)에서 관리합니다. **새 글을 기획하기 전에 이 폴더를 먼저 확인하세요.**

| 문서 | 내용 |
|------|------|
| [README](./docs/content/README.md) | 발행 워크플로, frontmatter 스키마, 카테고리 체계, 집필 규칙 |
| [발행-완료](./docs/content/발행-완료.md) | 발행된 글 인벤토리 |
| [발행-예정](./docs/content/발행-예정.md) | 후보 주제, 우선순위, 집필 전 검증 사항 |

`.mdx`를 커밋하기 전에는 반드시 `npx velite build`로 컴파일을 확인합니다.

## 시작하기

**필요 환경:** Node.js ≥ 20, pnpm 9

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

환경 변수는 `apps/web/.env.local` 에 설정합니다. (`apps/web/.env.local.example` 참고)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=

# 네이버 블로그 검색 프록시(/api/naver/blog)에만 필요 (서버 전용)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

### 스크립트

루트에서 실행하면 Turborepo가 모든 워크스페이스에 전파합니다.

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 (Turbopack) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier |

작업을 마치기 전에 `pnpm lint`, `pnpm typecheck`, `pnpm build`를 통과시킵니다.

## 프로젝트 구조

```
kidzly.kr/
├── apps/
│   └── web/               # Next.js 앱
│       ├── app/           # App Router (pages, layouts, intercepting routes)
│       ├── components/    # UI 컴포넌트 (도메인별 분류)
│       ├── content/       # 블로그 MDX 원문
│       ├── domain/        # 도메인 로직 (API, Query, Prefetch)
│       ├── hooks/         # 공통 hooks
│       ├── lib/           # 유틸리티 (React Query 설정, 날짜 포맷, 구조화 데이터 등)
│       ├── types/         # 전역 타입 선언
│       └── velite.config.ts
├── packages/
│   ├── ui/                # 공유 UI 컴포넌트 (shadcn/ui 기반)
│   ├── supabase/          # Supabase 클라이언트·타입 (@workspace/supabase)
│   ├── eslint-config/     # 공유 ESLint 설정
│   └── typescript-config/ # 공유 TypeScript 설정
└── docs/
    └── content/           # 콘텐츠 발행 관리 문서
```

## 데이터베이스

Supabase(PostgreSQL)를 **읽기 전용**으로 사용합니다. 인증은 없습니다.

**스키마는 이 저장소가 관리하지 않습니다.** 테이블·인덱스·뷰 전부
[kidzly-sync](https://github.com/artiveloper/kidzly-sync)의 Flyway 마이그레이션이 소유합니다.
웹이 쓰는 조회 인덱스와 필터 옵션 뷰도 마찬가지입니다. Supabase SQL 에디터에서 직접 만들지 마세요 —
이력에 남지 않아 재현이 불가능해집니다.

이 저장소가 갖는 것은 스키마의 **타입 표현**뿐입니다.

| | 위치 |
|---|---|
| 스키마 정의(원본) | kidzly-sync `src/main/resources/db/migration/` |
| 스키마 스냅샷 | kidzly-sync `schema.sql` (pg_dump 생성, 손으로 고치지 않음) |
| 타입 (이 저장소) | `packages/supabase/src/types.ts` |

컬럼을 추가·변경해야 하면 kidzly-sync에 마이그레이션을 넣고, **운영에 적용된 것을 확인한 뒤**
`types.ts`를 갱신하고 배포합니다. 절차는 kidzly-sync README의 "데이터베이스 스키마" 절에 있습니다.

## 개발 규칙

코드 작성 규칙은 [`CLAUDE.md`](./CLAUDE.md)에 정리되어 있습니다. 핵심만 옮기면 다음과 같습니다.

- 들여쓰기는 **4공백**, 타입은 `type` 사용, `any`·non-null assertion(`!`) 금지
- 서버 데이터 상태는 React Query만 사용하고 `useState` + fetch를 쓰지 않습니다
- URL 상태(필터·정렬·페이지·탭)는 nuqs로 관리합니다
- 도메인 import는 entry point(`index.ts` / `server.ts`)만 사용하고 deep import를 금지합니다
- 날짜 표시는 `lib/format.ts`의 `formatDate`(KST)를 씁니다
- Mobile-first로 작성하고 터치 타겟은 최소 44×44px를 확보합니다
