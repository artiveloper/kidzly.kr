# 런북 (Runbook)

> 상태: 상시 · 최종 검토: 2026-10-27
> 새벽에 터졌을 때 아무나 이 문서로 복구할 수 있어야 한다.

## 배포
- 호스팅: Hostinger Node.js 앱(`output: standalone`, `.next/standalone/server.js` 실행), 앞단 Hostinger CDN(`hcdn`). 2026-10-25 Vercel에서 이전했고 DNS 네임서버도 Hostinger다
- 방법: <명령 또는 "main 머지 시 자동"> — 자동 배포 조건 확인 필요
- 빌드: `apps/web`은 `next build --webpack && node scripts/flatten-standalone.mjs` (Turbopack 빌드는 Hostinger에서 실패해 webpack 사용)
- 배포 전 로컬 확인: `pnpm lint`, `pnpm typecheck`, `pnpm build`. 콘텐츠 `.mdx`를 바꿨으면 `apps/web`에서 `npx velite build`
- 확인: <배포 후 헬스체크 방법>

## 롤백
- <이전 버전으로 되돌리는 정확한 절차>

## 자주 나는 장애
| 증상 | 원인 | 대응 |
|------|------|------|
| 배포 후 503, 로그에 `Cannot find module 'next'` | 모노레포라 `server.js`가 `.next/standalone/apps/web` 아래로 중첩되고 `next`가 상위 `node_modules` 심링크를 가리킴 | `scripts/flatten-standalone.mjs`가 빌드 직후 단일 앱 구조로 옮긴다. 빌드 스크립트에서 빠지지 않았는지 확인 |
| 서버에서 의존성 설치 실패 | 호스팅이 pnpm 11을 강제 — `packageManager`(pnpm 9)와 불일치, 승인 안 된 빌드 스크립트 차단 | `pnpm-workspace.yaml`의 `pmOnFail: ignore`, `allowBuilds` 목록 확인. 빌드 스크립트가 있는 의존성을 추가했으면 목록에 넣는다 |
| 빌드 중 타입체크 실패 `Cannot find type definition file` | 평평한 설치로 루트 `@types`에 생긴 타입 스텁(`@types/minimatch`)을 암묵 포함 | 웹 `tsconfig`의 `types`를 명시한 상태 유지 |
| 콘텐츠 글이 목록에서 조용히 빠짐 | MDX 컴파일 실패(이스케이프 안 된 `~` 등) — 빌드는 통과 | `npx velite build`로 에러 확인 후 수정 |
| 화면에 `**`가 그대로 노출 | 닫는 `**` 앞이 구두점이고 뒤가 한글 조사 | 구두점을 굵게 밖으로 뺀다. `grep -c '\*\*' apps/web/.velite/blog.json` → `0` |
| 서버 부하·DB 조회 급증 | 크롤러가 어린이집 상세 2만 4천여 건과 지역 경로를 콜드로 훑음, 사이트맵 statement timeout | 상세는 ISR 86400, robots의 쿼리 크롤 차단, 사이트맵 쿼리 확인. 배경은 Vercel 시절 기록 [perf/vercel-비용-최적화.md](perf/vercel-비용-최적화.md) |
| 어린이집 상세가 색인에서 빠짐 | 조회 실패를 noindex·soft 404로 응답 | 조회 실패는 5xx로 던지고, 행이 없을 때만 셸 렌더 전에 `notFound()` (`app/daycare/[id]/page.tsx`) |

## 접속·대시보드
- 로그: <어디서>
- 모니터링/알람: <Sentry/…>
- 클라우드 콘솔: Supabase 프로젝트, 네이버 클라우드 플랫폼(Maps, API Hub), <배포 호스팅 콘솔 링크>
- 검색: Google Search Console, <네이버 서치어드바이저 등 링크>

## 비상 연락
- 데이터 동기화(하루 1회, 새벽 3시경)·스키마: kidzly-sync 저장소 담당
- <서비스별 담당 / 외부 벤더 연락처>
