---
name: supabase-guide
description: kidzly-web Supabase 클라이언트 설정, 환경변수 관리, 타입 생성, 쿼리 패턴, 마이그레이션 가이드. Supabase JS v2 사용, 인증 없는 공개 읽기 전용 구조. domain-engineer, code-reviewer, qa-engineer가 참조하는 내부 스킬.
---

# Supabase 가이드 — kidzly-web

> 구조: `@supabase/supabase-js` 직접 사용. 인증 없음. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`로 공개 읽기 전용.  
> `@supabase/ssr` 미사용 (쿠키 기반 세션 불필요).

---

## 1. 클라이언트 설정

### Browser Client

```ts
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createBrowserClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set');
    return createClient<Database>(url, key);
}
```

### Server Client

```ts
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set');
    return createClient<Database>(url, key);
}
```

**규칙:**
- non-null assertion(`!`) 절대 금지 — 누락 시 즉시 에러 throw
- 브라우저/서버 모두 동일 `publishable key` 사용 (공개 안전)

### apis 레이어에서 클라이언트 선택

```ts
// domain/daycare/apis/daycare.api.ts
import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/client';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}
```

서버 전용 함수(prefetch, sitemap 등)는 `createServerClient()`를 직접 호출.

---

## 2. 환경변수 관리

| 변수 | 노출 | 용도 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 OK | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개 OK | anon key (RLS가 보호) |

```bash
# .env.local (git 제외 — .gitignore 확인)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

**`NEXT_PUBLIC_` 없는 변수를 Client Component에서 참조하면 P0 위반.**

---

## 3. 타입 생성

```bash
# 로컬 Supabase (supabase start 후)
pnpm supabase gen types typescript --local > apps/web/lib/supabase/types.ts

# 원격 프로젝트
pnpm supabase gen types typescript --project-id <PROJECT_ID> > apps/web/lib/supabase/types.ts
```

**스키마 변경 후 반드시 재생성.** 타입 생성 전 로컬 `supabase start` 상태 확인.

### 타입 활용 패턴

```ts
// lib/supabase/types.ts — 자동 생성, 직접 수정 금지
export type Database = { public: { Tables: { daycares: { Row: { ... } } } } }

// 도메인에서 사용
import type { Database } from '@/lib/supabase/types';
type DaycareRow = Database['public']['Tables']['daycares']['Row'];
```

도메인 타입(`DaycareListItem`)은 DB Row 타입과 분리 — parser에서 변환:

```ts
// parser/daycare.parser.ts
import type { Database } from '@/lib/supabase/types';
import type { DaycareListItem } from '../types';

type DaycareRow = Database['public']['Tables']['daycares']['Row'];

export function toDaycareListItem(row: DaycareRow): DaycareListItem {
    return {
        id: row.daycare_code,
        name: row.name,
        // snake_case → camelCase 변환
    };
}
```

**UI에서 DB Row 타입 직접 사용 금지 — 반드시 parser를 통해 도메인 타입으로 변환.**

---

## 4. 쿼리 패턴

### 기본 쿼리

```ts
export async function fetchDaycareDetail(id: string): Promise<DaycareDetail> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('daycares')
        .select('daycare_code, name, address, phone') // ← 필요한 컬럼만
        .eq('daycare_code', id)
        .single();

    if (error) throw new Error(error.message);
    return toDaycareDetail(data);
}
```

### 필터링 쿼리

```ts
export async function fetchDaycares(params: DaycareListParams): Promise<DaycareListItem[]> {
    const supabase = createSupabaseClient();
    let req = supabase
        .from('daycares')
        .select(LIST_COLUMNS)
        .eq('status', '정상');

    if (params.query) {
        req = req.or(`name.ilike.%${params.query}%,address.ilike.%${params.query}%`);
    }
    if (params.sido) {
        req = req.eq('sido_name', params.sido);
    }

    const { data, error } = await req.limit(params.limit ?? 20); // 상한 강제
    if (error) throw new Error(error.message);
    return (data ?? []).map(toDaycareListItem);
}
```

### 컬럼 목록 상수화

```ts
// 컬럼 목록은 상수로 분리 — 중복 방지, 타입 추론 개선
const LIST_COLUMNS = 'daycare_code, name, type_name, address, latitude, longitude' as const;
const DETAIL_COLUMNS = 'daycare_code, name, sido_name, sigungu_name, type_name, ...' as const;
```

---

## 5. 쿼리 품질 규칙

### N+1 쿼리 방지

```ts
// ❌ 루프 내 단건 쿼리
for (const id of ids) {
    const { data } = await supabase.from('daycares').select('...').eq('id', id);
}

// ✅ in() 으로 배치 조회
const { data } = await supabase.from('daycares').select('...').in('daycare_code', ids);
```

### 목록 조회 상한 강제

```ts
// 무제한 조회 금지 — 항상 limit() 적용
const { data } = await req.limit(params.limit ?? 20);
```

### maybeSingle vs single

- 결과가 없을 수 있으면: `.maybeSingle()` (data: T | null)
- 반드시 존재해야 하면: `.single()` (없으면 error 반환)

### 에러 처리 패턴

```ts
// 항상 error 체크 후 throw — React Query가 error state 처리
const { data, error } = await supabase.from('...').select('...').eq(...);
if (error) throw new Error(error.message);
return data ?? [];

// 조용한 실패 금지
if (error) {
    console.error('[fetchDaycares]', error.message); // 서버 로그
    throw new Error(error.message);                  // React Query로 전파
}
```

---

## 6. 마이그레이션

```bash
# 초기화
pnpm supabase init
pnpm supabase start

# 마이그레이션 생성
pnpm supabase migration new add-daycares-table

# 로컬 적용
pnpm supabase db push

# 타입 재생성 (변경 후 항상)
pnpm supabase gen types typescript --local > apps/web/lib/supabase/types.ts
```

- `supabase/migrations/`는 git 커밋
- 프로덕션 마이그레이션은 staging 먼저 검증

---

## 7. 체크리스트

### 코드 작성 시

- [ ] non-null assertion(`!`) 없음 — 명시적 null 체크
- [ ] 필요한 컬럼만 `select()` (전체 컬럼 `select('*')` 최소화)
- [ ] 목록 조회에 `limit()` 적용
- [ ] N+1 쿼리 없음 — 배치 조회 사용
- [ ] `if (error) throw` 패턴 일관 사용
- [ ] UI에서 DB Row 타입 직접 사용 금지 — parser 통과

### 스키마 변경 시

- [ ] `supabase/migrations/` 파일 커밋
- [ ] `pnpm supabase gen types` 재실행
- [ ] `lib/supabase/types.ts` 업데이트 커밋
- [ ] 필터 컬럼에 인덱스 추가 여부 확인

### 환경변수

- [ ] `.env.local` `.gitignore` 제외 확인
- [ ] `NEXT_PUBLIC_` 없는 변수는 서버 전용으로만 사용
- [ ] Client Component에서 서버 전용 env var 참조 없음
