# 시군구 SEO 허브 — 구조 개선 (2차) : `/region/[sido]` 인덱스 페이지 신설 + 상세페이지 역링크

> 1차 구현(`/region/[sido]/[sigungu]` 허브, `/rankings/[sido]` 칩 섹션)은 이미 완료·커밋 대기 중.
> 이번은 그 구조를 개선하는 2차 작업. **신규 도메인 API는 불필요** — `domain/region`의
> `fetchSigunguListBySido(sido)`가 이미 구현되어 있고 그대로 재사용한다. UI/라우트 레이어만 작업.

## Context — 왜 구조를 바꾸나

1차 구현에서 `/rankings/[sido]` 페이지 하단에 시군구 칩 25개를 직접 나열했는데, 이러면
"OO 어린이집 랭킹"이라는 검색 의도를 가진 페이지에 "전체 목록 찾기"라는 다른 의도의 콘텐츠가
섞여 페이지의 키워드 집중도가 흐려진다. 사용자와 논의 후 아래 구조로 개선하기로 확정:

```
/rankings/[sido]            — TOP10 랭킹 전용 (시군구 칩 섹션 제거, "지역별 전체 목록 보기" 링크 카드 1개만 남김)
/region/[sido]               — (신규) 해당 시도의 시군구 전체 칩 목록 (기존 SigunguLinksSection 내용물 이사)
/region/[sido]/[sigungu]     — 기존 그대로 (어린이집 전체 목록, 변경 없음)
/daycare/[id]                — (신규) "OO구 어린이집 전체보기" 링크 1개 추가 — 상세페이지 24,592개
                                전부가 자기 지역 허브로 링크를 쏘게 되어 가장 파급력 큰 내부링크
```

## 작업 범위

### 1. 신규 — `app/region/[sido]/page.tsx` + `loading.tsx`
- `generateStaticParams`: `SIDO_LIST`(17개) 기반 — `domain/region`의 기존 `SIDO_LIST` 재사용
- `dynamicParams = false`, `resolveSido()` 패턴 재사용(`/rankings/[sido]/page.tsx`와 동일 원칙 — decode+NFC, `isValidSido` 검증)
- `generateMetadata`: 시도명 기반 title/description/canonical (예: "서울특별시 어린이집 지역별 전체 목록 - 키즐리")
- 본문: `components/region/RegionSidoIndexView.tsx`(신규, 서버 async) — `fetchSigunguListBySido(sido)` 직접 호출, `SigunguLinksSection.tsx`의 칩 렌더링 로직을 그대로 이 페이지 본문으로 이사(그리드/칩 스타일 그대로 재사용 — 새 디자인 불필요, 컴포넌트만 옮기는 리팩터링)
- Breadcrumb(기존 `components/common/Breadcrumb.tsx` 재사용): 홈 > OO 랭킹 > 지역별 목록
- JSON-LD `ItemList`(시군구 목록) + `BreadcrumbList` — 기존 `RegionHubPageView.tsx`/`RankingsPageView.tsx` 패턴 그대로 복제

### 2. 수정 — `components/rankings/RankingsPageView.tsx`
- 기존 `<SigunguLinksSection sido={sido} />` 삽입 블록을 제거
- 대신 `sido`가 있을 때만, `/daycare/[id]` 하단의 기존 "🏆 랭킹" CTA 카드와 같은 톤으로 **"📍 {sido} 지역별 전체 목록 보기" 카드 1개**를 `/region/${encodeURIComponent(sido)}`로 링크
- `components/rankings/SigunguLinksSection.tsx`, `SigunguLinksSectionSkeleton.tsx`는 삭제(내용물은 `RegionSidoIndexView.tsx`로 이사했으므로 중복 코드 남기지 않음)

### 3. 신규 — `app/sitemap.ts` 확장
- `SIDO_LIST.map(sido => ({ url: `${BASE_URL}/region/${encodeURIComponent(sido)}`, lastModified: now, changeFrequency: "weekly", priority: 0.68 }))` — 기존 `/region/[sido]/[sigungu]` 블록 근처에 추가 (17개 엔트리)

### 4. 수정 — `components/daycare/detail/DaycareDetailView.tsx`
- 범위 매우 좁게: 기존 "🏆 {sido} 어린이집 랭킹" CTA 카드 바로 위 또는 아래에 **"📍 {sigunguName} 어린이집 전체보기"** 카드 1개만 추가
- `href`: `domain/region`의 `buildRegionPath(detail.sidoName, detail.sigunguName)` 재사용 (단, `sidoName`/`sigunguName`이 `null`일 수 있으므로 둘 다 존재할 때만 렌더)
- 기존 카드 스타일(`rounded-xl bg-gray-50 p-4 hover:bg-gray-100`) 그대로 복제, 새 컴포넌트 만들 필요 없이 인라인 JSX 블록 하나 추가면 충분
- **주의**: 이 파일은 1차 계획에서 "건드리지 않음"으로 명시했던 파일 — 이번엔 사용자 승인 하에 범위를 좁게(카드 1개 추가만) 확장. 기존 "같은 지역 다른 어린이집" 섹션이나 다른 로직은 절대 건드리지 말 것.

### 5. `domain/region/index.ts` — 필요 시 `isValidSido` re-export 확인
- 이미 export되어 있음(기존 `SIDO_LIST`/`isValidSido` 그대로 사용), 신규 코드 불필요

## CLAUDE.md 준수
- §11 Suspense/에러경계, §12 빈 상태(해당 시도에 시군구 없음 — 사실상 발생 안 하지만 방어), §15 4공백, §16 mobile-first(카드 `min-h-11`), §18 접근성(Breadcrumb 시맨틱)
- 신규 페이지도 `dynamicParams=false` + `generateStaticParams` SSG 패턴 준수

## 범위 밖
- `/daycare/[id]`의 다른 부분(같은 지역 다른 어린이집 섹션 등) 일체 수정 금지
- `/region` 루트 인덱스(전국 시도 목록) — 이번에도 범위 밖, 필요하면 별도 후속

## 검증
1. `npx tsc --noEmit`
2. `curl http://localhost:3000/region/서울특별시` → 시군구 25개 칩 링크 SSR 노출 확인
3. `curl http://localhost:3000/rankings/서울특별시` → 칩 섹션 사라지고 "지역별 전체 목록 보기" 카드 1개만 있는지 확인
4. `curl http://localhost:3000/daycare/{임의 id}` → "OO 어린이집 전체보기" 링크 SSR 노출 확인
5. `curl http://localhost:3000/sitemap.xml | grep -c '/region/[^/]*"'` (2단 미만, 시도 인덱스만) → 17개 확인
