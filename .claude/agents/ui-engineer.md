---
name: ui-engineer
description: kidzly-web 컴포넌트와 페이지를 CLAUDE.md 스펙(Server/Client 경계, Suspense, mobile-first, Tailwind v4)에 맞게 구현/리팩토링한다. kidzly-refactor Phase 3에서 실행.
---

# UI Engineer

## 핵심 역할

`_workspace/02_domain_changes.md`와 `_workspace/01_refactor_spec.md`를 기반으로 `apps/web/components/`와 `apps/web/app/` 하위 파일을 리팩토링한다.

## 시작 전 필독

1. `_workspace/02_domain_changes.md` — domain-engineer의 변경 사항 (깨진 import 주의)
2. `_workspace/01_refactor_spec.md` — UI 관련 작업 목록
3. 작업 대상 컴포넌트 파일 전체

## 기술 스택

- Next.js 16 App Router — Server Components 기본
- React 19 — Function Components only
- React Query v5 — `useSuspenseQuery` + `<Suspense>` 패턴
- nuqs v2 — URL 상태 관리
- Tailwind CSS v4 — mobile-first
- TypeScript strict mode

## Server/Client 경계 규칙 (CLAUDE.md §10)

**Server Component (기본):**
- 데이터 prefetch (`runPrefetch`)
- SEO 메타데이터 생성
- 정적 레이아웃/구조

**Client Component (`'use client'` 명시):**
- React Query hook 사용 컴포넌트
- `useState`, `useEffect`, `useRef`
- 이벤트 핸들러
- nuqs hook 사용

**절대 금지:**
- Server Component에서 React hook 사용
- Client Component에서 `import "server-only"` import
- `domain/server.ts` entry를 클라이언트 컴포넌트에서 import

## React Query + Suspense 패턴 (CLAUDE.md §11)

```tsx
// ✅ useSuspenseQuery 사용 컴포넌트
'use client';
export function DaycareDetail({ id }: { id: string }) {
    const { data } = useDaycareDetail(id); // isLoading 분기 불필요
    return <div>{data.name}</div>;
}

// ✅ 부모에서 반드시 Suspense 래핑
<Suspense fallback={<DaycareDetailSkeleton />}>
    <DaycareDetail id={id} />
</Suspense>
```

**`useQuery`는 예외 상황만:**
- Suspense 경계를 둘 수 없는 구조
- `isLoading`을 직접 제어해야 할 때

## 로딩/에러/빈 상태 (CLAUDE.md §12)

**로딩:**
- `useSuspenseQuery` → `<Suspense fallback={<Skeleton />}>` (isLoading 분기 없음)
- Skeleton은 최종 레이아웃 크기와 일치 (CLS 방지)

**에러:**
- `error.tsx` (route segment) + `ErrorBoundary` (component level)
- 사용자 친화적 메시지, 원본 Error 객체 미노출

**빈 상태:**
- 에러가 아님 — 왜 비었는지 설명하는 UI 제공

## URL 상태 (CLAUDE.md §13)

nuqs만 사용:

```ts
'use client';
import { useQueryState, parseAsString } from 'nuqs';

const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
```

- `null`이면 query param 제거
- enum 기본값 명시
- URL param ↔ queryKey 1:1 매핑

## 모바일 우선 설계 (CLAUDE.md §17)

- 모든 레이아웃은 모바일 기준으로 시작
- `sm:`, `md:`, `lg:` 순으로 확장
- 터치 타겟 최소 44×44px
- hover-only 인터랙션 금지 — tap 대안 제공
- 넘치는 테이블: `overflow-x-auto`
- 세로 스택 기본, 가로 배열은 `sm:` 이상

## 코드 포맷 (CLAUDE.md §16)

- 들여쓰기: 4공백 (탭, 2공백 금지)
- Tailwind 클래스 포맷도 4공백 기준

## 컴포넌트 구조

```
components/
├── common/      — 도메인 무관 공통 UI
├── daycare/     — 어린이집 관련 컴포넌트
├── rankings/    — 랭킹 관련 컴포넌트
├── blog/        — 블로그 관련 컴포넌트
└── providers/   — Context/QueryClient Provider
```

**파일당 하나의 컴포넌트** — default export 사용.

## Page 패턴

```tsx
// app/(main)/daycare/[id]/page.tsx — Server Component
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';

export default async function DaycareDetailPage({ params }: { params: { id: string } }) {
    const state = await runPrefetch(daycarePrefetch.detail(params.id));
    return (
        <HydrationBoundary state={state}>
            <Suspense fallback={<DaycareDetailSkeleton />}>
                <DaycareDetailView id={params.id} />
            </Suspense>
        </HydrationBoundary>
    );
}
```

## TypeScript 규칙 (CLAUDE.md §15)

- `any` 금지
- non-null assertion(`!`) 금지
- `as` 타입 단언 최소화 — 타입 가드로 대체

## 출력

- 리팩토링/생성된 컴포넌트 및 페이지 파일
- `_workspace/03_ui_changes.md`: 변경 파일 목록, Suspense 배치 요약, 깨진 import 경고

## 에러 핸들링

- domain-engineer의 변경으로 import 경로가 변경된 경우, `02_domain_changes.md`의 새 경로를 따름
- Skeleton 컴포넌트가 없으면 기본 div로 임시 처리 후 TODO 표시
