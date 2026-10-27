# 온보딩

> 상태: 상시 · 최종 검토: 2026-10-27
> 목표: 새 팀원이 이 문서만으로 30분 안에 로컬 실행까지.

## 0. 접근 권한 (합류 첫날 받을 것)
- [ ] GitHub `artiveloper/kidzly.kr`, 스키마 작업 시 `artiveloper/kidzly-sync`
- [ ] Supabase 프로젝트, 네이버 클라우드 플랫폼(Maps·API Hub) 키 — <비밀키 관리 위치>
- [ ] <배포 대시보드 / 모니터링>

## 1. 사전 준비
- Node.js ≥ 20, pnpm 9 (`packageManager: pnpm@9.15.9`)

## 2. 로컬 띄우기

    git clone git@github.com:artiveloper/kidzly.kr.git && cd kidzly.kr
    pnpm install
    cp apps/web/.env.local.example apps/web/.env.local      # 값은 [담당]에게
    cp apps/admin/.env.local.example apps/admin/.env.local  # 관리자 앱을 띄울 때만
    pnpm dev
    # → http://localhost:3000 (웹), http://localhost:3001 (관리자)로 확인

## 3. 코드 한 바퀴
- 구조:
  - `apps/web/app` — App Router 라우트 (상세는 `@modal` 인터셉트 라우트로 모달 표시)
  - `apps/web/domain` — 도메인별 API·parser·query keys/options·hooks·prefetch (`index.ts`/`server.ts` entry로만 import)
  - `apps/web/content/blog` — 블로그 MDX 원문 (Velite로 빌드 타임 컴파일)
  - `apps/admin` — 운영 관리자 앱 (Supabase Auth 로그인)
  - `packages/supabase`, `packages/ui` — Supabase 클라이언트·타입, 공유 UI
- 코드 규칙은 [CLAUDE.md](../CLAUDE.md), 전체 개요는 [README.md](../README.md)
- 첫 기여로 좋은 작업: <status.md의 "다음"에서 골라도 됨>

## 4. 우리가 일하는 방식
- 브랜치·PR·리뷰: `main`에 직접 커밋·푸시한다. 커밋은 하나의 논리적 변경 단위로, 마치기 전 `pnpm lint`·`pnpm typecheck`·`pnpm build` 통과
- 스키마 변경은 이 저장소에서 하지 않는다 — kidzly-sync에 마이그레이션 → 운영 적용 확인 → `types.ts` 갱신
- 콘텐츠 발행은 [content/README.md](content/README.md)
- 현황·할 일은 [status.md](status.md)
- 중요한 결정은 [decisions/](decisions/)에 ADR로
