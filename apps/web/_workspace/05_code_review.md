# 코드 리뷰 보고서 — 지역별 조회 sigungu_code(arcode) 전환

리뷰 일시: 2026-08-17
대상: 워킹트리 미커밋 변경분 10개 파일 (`git diff`)
기준: `CLAUDE.md`, `.claude/agents/code-reviewer.md`

## 요약

P0: 1개 | P1: 3개 | P2: 10개

전환 자체는 잘 설계됐다. sido/arcode 배타 규칙, arcode 접두 파싱 회피, 서버·클라이언트 동일 검증 기준이 코드와 주석에 일관되게 반영됐고, prefetch↔hook queryKey는 필터 없는 기본 경로에서 해시 수준까지 정확히 일치한다(아래 검증 참조). P0 1건은 이번 전환과 무관한 워킹트리 오염(자격증명 평문 파일)이며, 커밋 전에 반드시 처리해야 한다.

**참고**: `_workspace/04_qa_report.md`는 이번 변경분에 대한 QA 보고서가 아니다. 워킹트리에서 삭제된 상태이고, `_workspace_20260817/04_qa_report.md`에 남은 사본은 2026-08-06자 SEO 허브 작업(`/region/[sido]` 신설)에 대한 것이다. 즉 **이번 arcode 전환은 QA 단계를 거치지 않았다** — 이 리뷰에는 중복 회피 대상이 없으며, 그만큼 아래 항목을 QA 대체로 읽어야 한다.

---

## P0 이슈 (즉시 수정)

### [P0] DB 슈퍼유저 자격증명이 평문으로 저장소 루트에 있고 .gitignore에도 없다

**파일:** `D:\sources\kidzly\kidzly.kr\database.txt` (untracked)
**확인:**
```
$ git check-ignore -v database.txt
exit=1   # 무시 대상 아님
```
파일 내용은 Supabase 풀러 host/port/database/**user(postgres.xuhhyuwuljmiuotdqehz)/password 평문** 5줄이다.

**이유:** 현재 untracked라 아직 히스토리에는 없지만, `.gitignore` 어디에도 매칭되지 않으므로 `git add .` 한 번이면 공개 커밋에 포함된다. 이 자격증명은 anon key가 아니라 **DB 직결 계정**이라 RLS를 우회한다. 리뷰 대상 브랜치의 워킹트리 상태이므로 여기서 보고한다.

**수정:**
1. `.gitignore`에 `database.txt`(또는 `*.credentials`, `secrets/` 규칙) 추가.
2. 파일을 저장소 밖으로 옮기고 `.env.local`(이미 gitignore 대상) 또는 비밀 관리자로 이전.
3. 노출 정황이 조금이라도 있으면 Supabase 대시보드에서 DB 비밀번호 회전.

---

## P1 이슈 (권고)

### [P1] 필터가 URL에 있는 채로 arcode 딥링크 진입 시 prefetch가 무효화된다 — SSR 중복 fetch + 하이드레이션 시 스켈레톤 플래시

**파일:**
- `apps/web/app/daycares/page.tsx:130-137`
- `apps/web/components/region/RegionDaycareList.tsx:25-35`

**검증 (React Query `hashKey` 동작 재현):**

| 경로 | 해시된 queryKey | 일치 |
|------|----------------|------|
| prefetch `{ sigunguCode: '11680' }` | `["daycare","regionList",{"sigunguCode":"11680"}]` | 기준 |
| hook, 필터 없음 `{ sigunguCode, vehicleOperation: undefined, services: undefined, ages: undefined }` | `["daycare","regionList",{"sigunguCode":"11680"}]` | ✅ 일치 |
| hook, `?vehicle=true` 동반 | `["daycare","regionList",{"sigunguCode":"11680","vehicleOperation":true}]` | ❌ 불일치 |

`hashKey`는 plain object 키를 정렬한 뒤 `JSON.stringify`하므로 `undefined` 값 프로퍼티는 직렬화에서 탈락한다. 따라서 **필터가 없는 기본 딥링크(`/daycares?arcode=11680`)는 완전히 일치**하고 hydration mismatch도 재요청도 없다 — 이 부분은 문제없다.

**문제는 필터가 함께 있는 경우다.** `/daycares?arcode=11680&vehicle=true`(사용자가 필터를 켠 채 새로고침하거나 그 URL을 공유한 경우)로 진입하면:
1. 서버는 `{ sigunguCode }` 키로만 prefetch → 캐시에 필터 조합 키가 없음.
2. SSR 중 `useSuspenseQuery`가 캐시 미스로 suspend → React가 promise를 await하며 **서버에서 한 번 더 fetch**.
3. 클라이언트가 하이드레이트할 때 dehydrated state에는 필터 조합 키가 없으므로 다시 suspend → React가 해당 Suspense 경계의 서버 HTML을 버리고 `RegionDaycareListSkeleton`으로 교체 → **목록이 떴다가 사라졌다 다시 나타난다** + 클라이언트에서 세 번째 fetch.

즉 prefetch가 무효일 뿐 아니라 CLS와 중복 쿼리를 만든다. `revalidate = 3600`이 있어도 `/daycares`는 실제로 동적 렌더링된다(빌드 산출물 `apps/web/.next/server/app/daycares/`에 `.html`/`.rsc`가 없고 prerender-manifest에도 없음)이므로 매 요청마다 발생한다.

**참고:** 전환 이전 코드도 `{ sido, sigungu }`만 prefetch했으므로 새로 생긴 결함은 아니다. 다만 이번 커밋이 prefetch 시그니처를 손대는 지점이라 지금 같이 정리하는 편이 싸다.

**수정:** `RegionSection`이 `searchParams`의 `vehicle`/`services`/`age`도 읽어 `RegionDaycareList`가 만드는 파라미터와 **동일한 정규화**를 거쳐 prefetch에 전달한다. 정규화 규칙(`vehicleOperation: vehicle || undefined`, `services: len>0 ? arr : undefined`, `ages: age !== null ? [Number(age)] : undefined`)이 서버·클라이언트 두 곳에 중복되면 다시 어긋나므로, `domain/daycare`에 `buildRegionListParams(searchParams-like)` 같은 단일 팩토리를 두고 양쪽이 호출하는 형태를 권한다. (`type` 필터는 클라이언트 전용이라 파라미터에 들어가지 않으므로 대상 아님.)

---

### [P1] 이 diff를 그대로 커밋하면 무관한 tracked 문서 4개가 저장소에서 사라진다 (§3 외과적 변경)

**파일:**
- `apps/web/_workspace/04_qa_report.md` (D)
- `apps/web/_workspace/05_code_review.md` (D)
- `apps/web/_workspace/seo/01_seo_audit.md` (D)
- `apps/web/_workspace/seo/02_seo_changes.md` (D)

**이유:** 이 4개는 git이 추적 중인 파일이고 삭제로 스테이징 대기 상태다. 대체본으로 보이는 `apps/web/_workspace_20260817/`은 **untracked**라 `.gitignore` 여부와 무관하게 "삭제만 커밋되고 사본은 안 들어가는" 사고가 나기 쉽다. 특히 `seo/01_seo_audit.md`·`seo/02_seo_changes.md`는 이번 arcode 전환과 아무 관련이 없는 seo-manager 하네스 산출물이다. CLAUDE.md §3은 "건드려야 하는 것만 건드린다"를 요구한다.

**수정:** 아카이빙이 의도였다면 `git mv`로 이동해 rename으로 기록하거나, `_workspace_20260817/`을 함께 `git add`한다. 아카이빙 의도가 아니었다면 `git restore apps/web/_workspace/seo/` 로 SEO 문서만이라도 되살린다.

---

### [P1] `img.png` 삭제가 이번 변경과 무관하다 (§3 외과적 변경)

**파일:** `img.png` (저장소 루트, D, 123KB)

**이유:** arcode 전환과 아무 관계가 없는 tracked 바이너리 삭제가 같은 워킹트리에 섞여 있다. 코드·문서 어디에서도 참조되지 않아(전체 grep 0건) 실제 영향은 없지만, §9 "원자적·의미 단위 커밋"에 따라 지역 조회 전환 커밋과 같이 들어가면 안 된다.

**수정:** 별도 커밋으로 분리하거나 `git restore img.png`.

---

## P2 이슈 (제안)

### [P2] 정렬 커버 인덱스가 사라졌다 — `(sigungu_code, name) WHERE status='정상'` 부분 인덱스 검토

**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:182-186`

기존 쿼리 `(sido_name, sigungu_name) + order by name`은 `schema.sql:282` 의 `idx_daycares_sido_sigungu_name (sido_name, sigungu_name, name) WHERE status='정상'` 이 필터·정렬·부분조건을 전부 커버했다. 새 쿼리 `(sigungu_code) + order by name`이 쓸 수 있는 인덱스는 `idx_daycares_sigungu_code_status (sigungu_code, status)` (schema.sql:291) 뿐이라 **정렬은 인덱스로 못 받고 메모리 sort**로 떨어진다. 지역당 최대 779건이라 실측 영향은 작겠지만, 전환으로 인해 인덱스 커버리지가 후퇴한 것은 사실이다. 정렬 지연이 관측되면 `create index on daycares (sigungu_code, name) where status = '정상'` 추가를 권한다. (해당 컬럼 자체에 인덱스는 있으므로 체크리스트의 "필터 컬럼 인덱스 없음"에는 해당하지 않는다.)

### [P2] `encodeURIComponent` 누락 — 기존 링크 대비 방어 수준 후퇴

**파일:** `apps/web/components/daycare/detail/DaycareDetailView.tsx:206`

```tsx
href={`/daycares?arcode=${detail.sigunguCode}`}
```

`sigungu_code`는 `varchar(10) not null`(schema.sql:26)이고 실데이터는 숫자 문자열이라 현재는 안전하다. 다만 직전 코드는 `encodeURIComponent(detail.sidoName)` 형태로 DB 값을 항상 이스케이프했다. DB에서 온 값을 URL에 그대로 보간하는 형태는 컨벤션상 되돌아가는 방향이므로 `encodeURIComponent(detail.sigunguCode)`로 통일하는 편이 좋다.

### [P2] 무효 arcode 진입 시 아무 설명 없이 1단계 화면으로 떨어진다

**파일:** `apps/web/components/region/SidoChipList.tsx:43-58`

`selectedEntry`가 null이고 `sidoParam`도 없으면 시도 칩 목록만 렌더된다. 크래시 없이 폴백된다는 점은 **요구사항대로 정상 동작**한다(사각지대 4건 arcode 12110/12240/12300 및 오타·과거 코드 포함, 검증 완료). 다만 사용자에게는 "링크를 눌렀는데 아무 데도 안 갔다"로 보이고, URL에는 무효 arcode가 그대로 남아 있다가 다음 칩 클릭 시에만 정리된다. CLAUDE.md §21 "빈 상태는 왜 비었는지 설명하는 UI 제공" 취지에 맞춰, 폴백 시 "요청하신 지역을 찾을 수 없어 전체 목록을 보여드려요" 수준의 한 줄 안내를 검토할 만하다.

### [P2] 구 URL 형식 `?sido=X&sigungu=Y` 에 대한 호환 경로가 없다

**파일:** `apps/web/app/daycares/page.tsx:51`

`sigungu` 파라미터가 타입에서 제거돼 조용히 무시된다. 결과적으로 구 링크는 2단계(시도 칩) 화면까지만 복원되고 결과 목록은 안 뜬다. `app/sitemap.ts`에는 `/daycares` 단일 엔트리만 있어(색인된 조합 URL 없음) SEO 영향은 없지만, 외부 공유·북마크는 열화된다. `sigungu`가 들어오면 `entries`에서 `(sido, sigungu)`로 arcode를 역조회해 `?arcode=` 로 `redirect()`하는 6줄짜리 호환 처리가 가능하다. 트래픽이 없다고 판단되면 넘겨도 된다.

### [P2] `selectedEntry` 조회가 그룹핑된 Record를 다시 평탄화한다

**파일:** `apps/web/components/region/SidoChipList.tsx:43-50`

`page.tsx`는 flat `entries`를 이미 갖고 있는데 `groupBySido`로 묶은 것만 넘기고, 클라이언트는 그것을 `Object.values(...)` 중첩 루프로 되돌린다. arcode가 PK(schema.sql:343-344)라 결과는 정확하지만, 로직이 한 번 접혔다 펴진다. `domain/region`에 `findSigunguByArcode(entries, arcode)` 헬퍼를 두고 flat 배열도 함께 넘기거나, `Record<arcode, SigunguEntry>` 룩업 맵을 서버에서 만들어 넘기는 쪽이 단순하다.

### [P2] sido/arcode 배타 규칙이 세 군데에 손으로 흩어져 있다

**파일:** `apps/web/components/region/SidoChipList.tsx:70-71`, `86-87`, `101-102`

세 핸들러가 각각 `setArcodeParam`/`setSidoParam`을 짝지어 호출한다. 규칙 자체는 세 곳 모두 올바르고, nuqs v2는 같은 tick의 업데이트를 하나의 URL 쓰기로 병합하며 React 19 이벤트 핸들러 자동 배칭도 걸리므로 **중간 상태 플래시나 경쟁 상태는 발생하지 않는다**(검증 완료 — 두 파라미터가 동시에 URL에 남는 경우도 없다). 다만 향후 네 번째 진입점이 생기면 한쪽만 빠뜨리기 쉽다. `selectRegion(sido | null, arcode | null)` 헬퍼 하나로 묶으면 규칙이 코드에 한 번만 존재한다. (`useQueryStates`로 두 키를 한 훅에 묶는 것도 방법이다.)

### [P2] 시도→시군구 전이가 브라우저 히스토리에 남지 않는다

**파일:** `apps/web/components/region/SidoChipList.tsx:38-39`

`useQueryState`가 옵션 없이 쓰여 nuqs 기본값 `history: "replace"`, `shallow: true`가 적용된다(nuqs 2.8.9 dist 확인). 따라서 시도 선택·시군구 선택·"← 시도" 복귀가 모두 `replaceState`로 처리되어 **뒤로가기는 단계 되돌리기가 아니라 이전 페이지 이탈**이 된다. 상세 페이지 📍 링크 → `?arcode=` → 다른 시군구 선택 → 뒤로가기는 곧장 상세 페이지로 돌아간다. 화면 안에 "← 시도" 복귀 버튼이 명시적으로 있으므로 깨진 동작은 아니고 전환 전후 동일하지만, 모바일 사용자는 하드웨어 백을 단계 되돌리기로 기대한다. 단계 전이만 `{ history: 'push' }`로 바꾸는 선택지를 검토할 만하다. `shallow: true`는 서버 재렌더를 막아 prefetch 중복을 피하므로 **현재 값이 옳다**(변경 비권장).

### [P2] `fetchSigungus`에 `limit()`이 없다

**파일:** `apps/web/domain/daycare/apis/daycare.api.ts:455-470`

CLAUDE.md §19 "목록 조회 `limit()` 강제" 대상이다. 이번 변경이 만든 코드는 아니지만(§3에 따라 손대지 않는 것이 맞다), 이 전환으로 `/daycares`가 동적 렌더 경로에서 매 요청 이 쿼리를 타게 되어 노출도가 올라갔다. 254행 정적 참조 테이블이라 실질 위험은 없다. 기록 목적으로만 남긴다.

### [P2] 칩 터치 타겟이 40px로 44px 기준에 미달한다

**파일:** `apps/web/components/region/SidoChipList.tsx:30`, `apps/web/components/common/SidoFilterChips.tsx:22`

두 `chipClass` 모두 `h-10`(40px)이라 CLAUDE.md §25 최소 44×44px에 4px 모자란다. 이번 변경이 만든 것은 아니고 두 파일에 동일 함수가 중복 정의된 것도 기존 상태다. 지역 칩을 손보는 다음 작업에서 `h-11`로 올리고 `chipClass`를 한 곳으로 합치는 것을 제안한다.

### [P2] `apps/web/app/daycares/page.tsx:20`의 `revalidate = 3600`이 실질적으로 무효다

`searchParams`를 await하는 순간 이 라우트는 요청마다 동적 렌더된다 — 빌드 산출물에 `daycares.html`/`.rsc`가 없고 `prerender-manifest.json`의 routes·dynamicRoutes 어디에도 `/daycares`가 없는 것으로 확인했다. ISR 캐시를 기대하고 남겨둔 설정이라면 오해를 부른다. 이번 변경 이전부터 그런 상태이므로 이 커밋에서 건드릴 필요는 없고, 지역별 탭 성능을 다시 볼 때 함께 정리하면 된다.

---

## 명시적으로 이상 없음을 확인한 항목

| 확인 항목 | 결과 |
|----------|------|
| prefetch queryKey == hook queryKey (필터 없음) | ✅ `hashKey` 재현으로 문자열 동일 확인 — undefined 프로퍼티가 직렬화에서 탈락해 정확히 일치 |
| nuqs 2연속 set 경쟁 상태 / URL에 sido+arcode 동시 잔존 | ✅ 없음 (같은 tick 배칭 + React 이벤트 핸들러 자동 배칭) |
| 무효 arcode(사각지대 4건 포함) 크래시 | ✅ 없음 — `selectedEntry === null` 폴백으로 1단계 화면, 예외 미발생 |
| `?sido=` 단독 링크 (`RankingsPageView.tsx:137`) | ✅ 유효 — `sigunguBySido[sido]` 검증 후 2단계 진입, arcode 없어도 정상 |
| `/daycare/[id]` 📍 링크 (`DaycareDetailView.tsx:204-206`) | ✅ 유효한 URL 생성. 가드가 `sidoName` → `sigunguCode`로 바뀌어 `sidoName`이 null인 행에서도 카드가 노출되며, 카드 문구는 `sigunguName`만 쓰므로 문제 없음 |
| `import "server-only"` — `domain/region/server.ts`, `domain/daycare/server.ts`, `daycare.prefetch.ts` | ✅ 전부 1행에 존재 |
| `parser/` 단수형, `export *` 사용 | ✅ 규격 준수 / 사용 0건 |
| `any` · non-null assertion(`!`) · `interface` | ✅ 변경 파일 전체에서 0건 |
| 4공백 들여쓰기 | ✅ 10개 파일 전부 준수 |
| queryKey 팩토리 / queryOptions 팩토리 경유 | ✅ inline 작성 없음, prefetch도 `daycareQueryOptions.regionList` 재사용 |
| `select('*')` / `limit()` (지역 목록 쿼리) | ✅ `REGION_LIST_COLUMNS` 4개 컬럼만, `DEFAULT_REGION_LIST_LIMIT` 적용 |
| DB Row 타입 UI 직접 사용 | ✅ 없음 — parser 경유 |
| 날짜 KST 포맷 | ✅ 해당 없음 (변경분에 날짜 렌더 없음) |
| `sigungu_code` NOT NULL 주석의 사실 여부 | ✅ `schema.sql:26` `sigungu_code varchar(10) not null` — 주석이 정확 |
| `sigungus.arcode` 유일성 (선형 조회의 전제) | ✅ `schema.sql:343-344` PRIMARY KEY — 중복 arcode로 잘못된 시도가 잡힐 여지 없음 |

---

## 잘된 부분

- **arcode 접두 파싱을 하지 않는 결정이 코드와 주석 양쪽에 박혀 있다.** `SidoChipList.tsx:10-11`이 목포시 12110 / 광주 북구 29170이라는 반례를 직접 적어놔서, 다음 사람이 "그냥 앞 2자리 자르면 되잖아"로 회귀할 확률을 실질적으로 낮춘다. 결정의 근거가 결정과 같은 파일에 있다.
- **서버와 클라이언트가 동일한 검증 기준을 쓴다.** `page.tsx:130`의 `entries.find(...)`와 `SidoChipList.tsx:43-50`의 조회가 같은 데이터·같은 판정이라, "서버는 prefetch했는데 클라이언트는 무효 처리"하는 어긋남이 구조적으로 안 생긴다. 주석에도 "SidoChipList의 클라이언트 검증과 동일 기준"이라고 명시돼 있다.
- **prefetch가 queryOptions를 재사용해 키 일치가 타입으로 강제된다.** `DaycareRegionListParams` 하나가 query-keys·query-options·prefetch·hook을 관통하므로, `sido/sigungu` → `sigunguCode` 시그니처 변경이 어느 한 곳만 빠지면 컴파일이 깨진다. CLAUDE.md §15 의도대로 동작하고 있다.
- **사각지대를 숨기지 않고 수치와 함께 코드에 남겼다.** `daycare.api.ts:167-169`와 `region/server.ts:9-12`가 순방향·역방향 불일치를 각각 기술하고, 60,223건 중 4건(0.0066%)이라는 근거와 "무시하기로 확정" 판단까지 적어놨다. 나중에 데이터가 나빠졌을 때 재평가할 기준선이 생겼다.
- **`RegionDaycareList`의 prop 축소가 결합도를 낮췄다.** `sido`+`sigungu` 두 문자열 → `sigunguCode` 하나로 줄면서, 이 컴포넌트가 지역 명칭 체계를 전혀 몰라도 되는 상태가 됐다.
- **`DaycareFilters`를 Suspense 경계 밖 형제로 둔 기존 구조가 그대로 보존됐다** (`SidoChipList.tsx:114-121`). 이유를 적은 주석과 함께 유지돼, 필터 변경 시 필터 바까지 스켈레톤에 먹히는 회귀가 방지되고 있다.
