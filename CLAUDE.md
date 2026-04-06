# CLAUDE.md
> Next.js + React Query project instructions for Claude Code
> Target: Lighthouse score ≥ 90

---

## 1. Stack & Goals

### Tech Stack
- Next.js (App Router)
- React (Function Components only)
- TypeScript (strict mode)
- TanStack React Query
- nuqs (query string management)
- Tailwind CSS

### Core Goals
- Lighthouse score ≥ 90
- Minimize client-side JavaScript
- Predictable data flow
- Domain-driven architecture

---

## 2. Architecture Principles

- Domain-based directory structure (MANDATORY)
- Server Components by default
- Client Components are minimized and explicit
- Server data state is managed ONLY by React Query
- UI components contain no data-fetching logic
- No database access — data comes from external API only

---

## 3. Domain-based Directory Structure

All logic must be grouped by **domain**.

### 3.1 Directory Structure

```
domain/
  article/
    ├── index.ts                     # Client-safe public API
    ├── server.ts                    # Server-only public API (import "server-only")
    ├── types/
    │   └── index.ts                 # Domain types (entities, request/response shapes)
    ├── apis/
    │   └── {domain}.api.ts          # fetch calls to external API
    ├── parser/
    │   └── {domain}.parser.ts       # API response → domain type transformations
    ├── query-keys/
    │   └── {domain}.query-keys.ts   # Query key factories
    ├── query-options/
    │   └── {domain}.query-options.ts # queryOptions factories (reused by hooks & prefetch)
    ├── hooks/
    │   └── {domain}.hooks.ts        # Client-side React Query hooks
    └── prefetch/
        └── {domain}.prefetch.ts     # Server-only prefetch (import "server-only")
```

### 3.2 Layer Responsibilities

| Layer | 역할 | 의존성 |
|-------|------|--------|
| **types** | 타입 정의 | 없음 |
| **apis** | 외부 API 호출 (fetch) | types |
| **parser** | API 응답 → 도메인 타입 변환 | types |
| **query-keys** | Query Key 팩토리 | types |
| **query-options** | queryOptions 팩토리 | query-keys, apis, parser |
| **hooks** | Client-side React Query hooks | query-options, query-keys |
| **prefetch** | SSR prefetch (server-only) | query-options |

### 3.3 Entry Point Rules

도메인 루트에는 **두 개의 entry point**를 둔다.

| 파일 | 용도 | 포함 대상 |
|------|------|-----------|
| `index.ts` | 클라이언트 안전 public API | types, hooks, queryKeys, queryOptions |
| `server.ts` | 서버 전용 public API | prefetch |

`server.ts` 와 `prefetch` 는 반드시 `import "server-only"` 를 최상단에 선언한다.

| 디렉토리 | index.ts | 이유 |
|----------|----------|------|
| **루트** | ✅ 필수 | 클라이언트 public API |
| **types** | ✅ 필수 | 외부에서 타입 import |
| **hooks** | ❌ 불필요 | 루트에서 직접 export |
| **apis** | ❌ 불필요 | 내부에서만 사용 |
| **parser** | ❌ 불필요 | 내부에서만 사용 |
| **query-keys** | ❌ 불필요 | 루트에서 직접 export |
| **query-options** | ❌ 불필요 | 루트에서 직접 export |
| **prefetch** | ❌ 불필요 | server.ts에서 export |

### 3.4 Import Rules

- One domain = one responsibility
- deep import 금지, `export *` 금지
- 클라이언트 컴포넌트는 `index.ts` entry point만 사용
- 서버 컴포넌트(page.tsx)는 서버 전용 데이터가 필요할 때 `server.ts` entry point 사용

```ts
// ❌ deep import
import { articlePrefetch } from "@/domain/article/prefetch/article.prefetch"

// ✅ client component
import { useArticles, articleQueryOptions } from "@/domain/article"

// ✅ server component (page.tsx)
import { articlePrefetch } from "@/domain/article/server"
```

---

## 4. APIs Layer

### 4.1 Rules

- `apis` 레이어는 외부 API 호출만 담당한다
- 비즈니스 로직 없음 — 단순 fetch + parser 호출
- 인증 헤더 등 공통 처리는 공유 fetch 유틸리티 사용

### 4.2 Example

```ts
// article.api.ts
import { parseArticleList, parseArticleDetail } from '../parser/article.parser'
import type { ArticleListParams, ArticleList, ArticleDetail } from '../types'

export async function fetchArticleList(params: ArticleListParams): Promise<ArticleList> {
    const res = await apiClient.get('/articles', { params })
    return parseArticleList(res.data)
}

export async function fetchArticleDetail(articleId: number): Promise<ArticleDetail> {
    const res = await apiClient.get(`/articles/${articleId}`)
    return parseArticleDetail(res.data)
}
```

---

## 5. React Query Strategy

### 5.1 Query Keys (STRICT)

#### Rules
- Query keys must be arrays
- Stable & serializable only
- NEVER inline query keys
- Params must be a single object

#### Naming Convention
```
['domain', 'scope', params?]
```

#### Stability Rules
- Params must be serialization-safe
- Remove undefined fields
- Sort keys when derived from URL
- Never pass uncontrolled objects directly

Never:
```ts
useQuery(['articles', filters]) // filters from uncontrolled object
```

Always:
```ts
useQuery(articleQueryOptions.list(normalizedFilters))
```

#### Example
```ts
// article.query-keys.ts
export const articleQueryKeys = {
    all: ['article'] as const,

    list: (params: { page: number; category?: string }) =>
        [...articleQueryKeys.all, 'list', params] as const,

    detail: (articleId: number) =>
        [...articleQueryKeys.all, 'detail', articleId] as const,
}
```

---

### 5.2 Query Options (MANDATORY)

- All queries MUST use shared query option factories
- No inline `useQuery({ ... })`
- Query options must define:
  - queryKey
  - queryFn
  - staleTime (optional - uses global default if omitted)
  - gcTime (optional - uses global default if omitted)

#### useInfiniteQuery 예외

`useInfiniteQuery`는 `getNextPageParam` 등 클라이언트 전용 옵션이 필요하므로 `queryOptions` 팩토리로 공유하지 않고 **hooks 파일에 직접 정의**한다.
queryKey는 반드시 `queryKeys` 팩토리를 사용한다.

```ts
// ✅ useInfiniteQuery는 hooks에 직접 정의
export function useArticlesInfinite(filters: ArticleListFilters = {}) {
    return useInfiniteQuery({
        queryKey: articleQueryKeys.list(filters),
        queryFn: ({ pageParam }) => fetchArticleList({ ...filters, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    })
}
```

#### When to Override Cache Settings
- ✅ Override: 실시간 데이터 (짧은 staleTime 필요)
- ✅ Override: 정적 데이터 (긴 staleTime으로 캐시 효율화)
- ❌ Skip: 일반적인 리스트/상세 (global 설정 사용)

#### Example
```ts
// article.query-options.ts
import { articleQueryKeys } from '../query-keys/article.query-keys'
import { fetchArticleList, fetchArticleDetail } from '../apis/article.api'

export const articleQueryOptions = {
    // 기본 케이스: global 설정 사용 (staleTime/gcTime 생략)
    list: (params: ArticleListParams) => ({
        queryKey: articleQueryKeys.list(params),
        queryFn: () => fetchArticleList(params),
    }),

    // 특수 케이스: global과 다른 캐시 전략이 필요할 때만 override
    detail: (articleId: number) => ({
        queryKey: articleQueryKeys.detail(articleId),
        queryFn: () => fetchArticleDetail(articleId),
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
    }),
}
```

---

## 6. Prefetch Strategy (IMPORTANT)

### Prefetch Philosophy
- Prefetch strategy is defined per **domain**
- Pages/layouts must NOT define prefetch logic directly
- Pages only call domain prefetch functions

---

### 6.1 When to Prefetch

#### ✅ MUST Prefetch
- List pages (SEO, LCP critical) — infinite query 리스트도 **첫 페이지는 prefetch**
- Detail pages reached via internal navigation
- Primary route data

#### ⚠️ OPTIONAL Prefetch
- Secondary tabs
- Non-critical related data

#### ❌ DO NOT Prefetch
- Infinite scroll **이후 페이지** (2페이지~)
- Highly volatile or user-specific data
- Modal-only data

---

### 6.2 runPrefetch Utility

`runPrefetch`는 QueryClient 생성 + dehydrate를 캡슐화하는 유틸리티입니다.
페이지에서 직접 QueryClient를 다루지 않습니다.

```ts
// lib/react-query/prefetch.ts
import { dehydrate } from '@tanstack/react-query'
import { getQueryClient } from './query-client'

export async function runPrefetch(
    ...prefetchers: Array<(qc: QueryClient) => Promise<void>>
) {
    const qc = getQueryClient()
    await Promise.all(prefetchers.map(fn => fn(qc)))
    return dehydrate(qc)
}
```

---

### 6.3 Domain Prefetch Pattern

Prefetch 함수는 **curried 형태**로 작성합니다.
`(params?) => (queryClient) => Promise<void>` — `runPrefetch`와 자연스럽게 조합됩니다.

`{domain}.prefetch.ts` 는 반드시 `import "server-only"` 를 선언합니다.
외부에서는 `domain/server.ts` entry point를 통해서만 접근합니다.

#### queryOptions를 재사용하는 이유

Prefetch의 `queryKey`와 클라이언트 `useQuery`의 `queryKey`가 동일해야 dehydration이 올바르게 매칭됩니다.
`queryOptions`를 그대로 전달하면 `queryKey`와 `queryFn`이 항상 동일하게 유지되어 divergence가 없습니다.

```ts
// article.prefetch.ts
import "server-only"
import type { QueryClient } from '@tanstack/react-query'
import { articleQueryOptions } from '../query-options/article.query-options'

export const articlePrefetch = {
    list(params: ArticleListParams) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(articleQueryOptions.list(params))
        }
    },

    detail(articleId: number) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(articleQueryOptions.detail(articleId))
        }
    },
}
```

```ts
// domain/article/server.ts
import "server-only"
export { articlePrefetch } from "./prefetch/article.prefetch"
```

---

### 6.4 Page Usage

서버 컴포넌트(page.tsx)에서 `server.ts` entry point를 통해 import합니다.

```ts
// app/(main)/article/page.tsx
import { runPrefetch } from "@/lib/react-query/prefetch"
import { articlePrefetch } from "@/domain/article/server"   // ← server entry point

// 단일 prefetch
const state = await runPrefetch(
    articlePrefetch.list({ page: 1 })
)

// 복수 prefetch (병렬 실행)
const state = await runPrefetch(
    articlePrefetch.list({ page: 1 }),
    anotherPrefetch.something(),
)
```

---

## 7. Cache Layer Rules

This project uses a multi-layer cache strategy.

### L0 – Next fetch cache
- Used for cross-request persistence (ISR, revalidateTag)
- Must NOT be relied on for client freshness

### L1 – React cache() memoization
- Dedupes identical fetches within a single RSC render
- Never used for persistence

### L2 – React Query cache
- Single source of truth for UI state
- All UI must read from React Query only

Rule:
Server data is considered fresh only after React Query hydration.

---

## 8. Mutation & Invalidation Rules

Mutations call the external API directly via `useMutation`.

- Never mutate UI state directly after mutation
- Always invalidate using query keys
- Use domain query key factories only

Flow:
`useMutation` → external API call → `invalidateQueries` → UI refetch

Forbidden:
- Manually updating UI state after mutation
- Calling router.refresh() as primary update mechanism

#### Example
```ts
// article.hooks.ts
export function useCreateArticle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateArticleBody) => createArticle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: articleQueryKeys.all })
        },
    })
}
```

---

## 9. Pagination & Infinite Queries

- Infinite query **첫 페이지는 prefetch** (SEO, LCP 목적) — `prefetchInfiniteQuery` 사용
- Infinite query **이후 페이지는 prefetch 금지** — 스크롤 트리거로만 로드
- Page index must be part of query key
- Changing filters resets page to 1

Cache rule:
filter change = new cache
page change = same cache group

---

## 10. Server / Client Boundary

### Server Side
- Responsible for prefetching and SEO-critical data
- No React Query hooks
- Import from `@/domain/{name}/server` for server-only exports

### Client Side
- `useQuery` only with shared `queryOptions`
- No data-fetching logic in UI components
- Import from `@/domain/{name}` (client-safe entry point only)

### server-only 규칙

| 레이어 | server-only |
|--------|-------------|
| `prefetch` | ✅ 필수 |
| `server.ts` | ✅ 필수 (prefetch re-export) |
| `apis` | ❌ 불필요 (클라이언트/서버 모두 사용) |
| `hooks` | ❌ 불필요 (클라이언트 전용) |

---

## 11. Suspense & Streaming Policy

Use Suspense ONLY for async boundaries that affect layout stability.

Use Suspense:
- Main content blocks
- Route-level data sections

Do NOT use Suspense:
- Small UI fragments
- User-triggered refetch
- Pagination loading

Skeleton rules:
- Must match final layout size
- Prevent layout shift (CLS)

---

## 12. Loading / Error / Empty States

### Loading
- Initial load handled by Server Components
- Client loading only for pagination or manual refetch

### Error
- Errors must be explicit and domain-aware
- No silent failures

### Empty
- Empty state is NOT an error
- Must explain why data is empty

---

## 13. URL & Query Strings

- Use `nuqs` only
- Shared parsers are mandatory
- `null` removes the query param
- Enum defaults must be explicit
- Query params must map 1:1 to query keys

---

## 14. Error Handling Strategy

### API Calls

- 조회(Query): 에러를 throw → React Query가 error state로 처리
- 변경(Mutation): `useMutation`의 `onError` 또는 `mutateAsync` try/catch로 처리

#### Rules
- 인증 에러: 401 응답 시 공통 인터셉터에서 처리
- 비즈니스 에러: 사용자 친화 메시지로 변환 후 표시
- 원본 Error 객체를 UI에 직접 노출하지 않음

### Client Side

- Query 에러: React Query의 error state + ErrorBoundary
- Mutation 에러: `isError` / `error` 분기로 처리

---

## 15. TypeScript Rules

- ❌ any
- ❌ non-null assertion (!)
- Prefer type over interface
- Narrow types early

---

## 16. Code Formatting Rules (MANDATORY)

- All code MUST use **4 spaces for indentation**
- Tabs (`\t`) are NOT allowed
- 2-space indentation is NOT allowed
- Applies to:
    - TypeScript
    - JavaScript
    - JSON
    - Tailwind class formatting
    - React / JSX / TSX

Example:
```ts
function example() {
    if (true) {
        console.log('4 spaces only')
    }
}
```

---

## 17. Mobile-First Design (MANDATORY)

- All UI must be designed **mobile-first**
- Use responsive Tailwind classes (`sm:`, `md:`, `lg:`) starting from the smallest screen
- Touch targets must be at least 44×44px
- Avoid hover-only interactions — ensure tap-friendly alternatives
- Prefer vertical stacking on mobile; use grid/flex row layouts only from `sm:` breakpoint up
- Tables that don't fit on mobile must use `overflow-x-auto` or be redesigned as card lists

---

## 18. Performance Guardrails

To maintain Lighthouse ≥ 90:

Forbidden:
- Client-side data fetching in useEffect
- Dynamic imports inside frequently rendered components
- Passing large objects through props across boundaries
- Non-memoized array/object props to client components

Required:
- Prefer Server Components
- Serialize minimal data only
- Keep hydration payload small
- Avoid unnecessary client providers

---

## 19. What Claude Must Do

When generating code:
1. Follow domain-based structure strictly
2. Reuse query keys, options, and prefetch
3. Optimize for Lighthouse ≥ 90
4. Explain performance decisions briefly

When unsure:
- Ask ONE precise question only
