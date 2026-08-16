---
name: seo-manager
description: kidzly-web을 구글·네이버·다음 3사 기준으로 기술 SEO 진단하고, 승인 시 코드에 반영한다. 메타데이터·구조화 데이터(JSON-LD)·sitemap/robots·Scaled Content Abuse 리스크를 점검한다. "SEO 점검해줘", "SEO 감사", "검색 노출 점검", "구조화 데이터 추가해줘", "네이버/다음/구글 SEO 확인", "메타태그 점검" 등의 요청에 이 스킬을 사용한다. 글 단위 SEO 카피라이팅은 content-creator 스킬을 사용한다.
---

# seo-manager 오케스트레이터

## 파이프라인 개요

```
Phase 0: 컨텍스트 확인
Phase 1: seo-auditor   → apps/web/_workspace/seo/01_seo_audit.md
Phase 2: 감사 결과 보고 + 적용 여부 확인   ← 기본은 여기서 멈춘다
Phase 3 (승인 시): seo-engineer → 코드 반영 + apps/web/_workspace/seo/02_seo_changes.md
Phase 4 (Phase 3 실행 시): lint/typecheck/build 검증, 실패 시 재호출(최대 2회)
Phase 5: 최종 보고
```

**실행 모드:** 서브 에이전트 순차 파이프라인
**모델:** 오케스트레이터 상속, 서브 에이전트 `sonnet`
**범위:** 사이트 구조·기술 SEO만. 블로그 글 카피/키워드는 `content-creator` 스킬(`seo-writer`)이 담당하므로 겹치지 않는다.
**API 자격증명 없음이 전제** — Search Console/서치어드바이저/Daum 검색등록 API 연동은 하지 않는다. 사람이 포털에서 해야 할 일은 감사 리포트의 "수동 조치 체크리스트"로만 생성한다.

---

## Phase 0: 컨텍스트 확인

`apps/web/_workspace/seo/` 존재 여부로 실행 모드 결정:

| 상태 | 처리 |
|------|------|
| 없음 | 초기 실행 → Phase 1부터 |
| 있음 + "감사만/다시 점검" 요청 | Phase 1만 재실행 |
| 있음 + "적용해줘/반영해줘" 요청 (이전 감사 결과 존재) | Phase 3부터 (Phase 1 재실행 없이 기존 `01_seo_audit.md` 사용) |
| 있음 + 새로운 범위/주제로 재요청 | 기존 `seo/`를 `seo_{YYYYMMDD_HHMMSS}/`로 이동 후 새로 생성 |

---

## Phase 1: SEO 감사 (seo-auditor.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 seo-auditor 에이전트입니다.
    /.claude/agents/seo-auditor.md를 읽고 지시에 따라 작업하세요.

    필독:
    - .claude/skills/seo-manager/references/naver-daum-google-seo-guide.md
    - CLAUDE.md (§22, §25, §27)

    분석 범위: apps/web/app/ 전체, apps/web/app/sitemap.ts, apps/web/public/robots.txt
    출력: apps/web/_workspace/seo/01_seo_audit.md

    코드를 수정하지 마세요 — 진단과 이슈 목록 작성만 합니다.
    """
)
```

완료 확인: `apps/web/_workspace/seo/01_seo_audit.md` 존재

---

## Phase 2: 감사 결과 보고 + 승인 확인

`01_seo_audit.md`를 읽고 사용자에게 보고한다:

1. P0/P1/P2 건수와 요약 평가 (특히 Scaled Content Abuse 리스크 수준)
2. P0 이슈 목록 (파일:라인, 문제, 영향 엔진)
3. 수동 조치 체크리스트 요약
4. **"코드에 반영할까요, 감사 리포트로 마무리할까요?"** 를 사용자에게 명시적으로 묻는다

사용자가 적용을 승인하지 않으면 여기서 종료. `apps/web/_workspace/seo/` 는 보존한다(삭제 금지).

---

## Phase 3: SEO 반영 (seo-engineer.md) — 승인 시에만

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 seo-engineer 에이전트입니다.
    /.claude/agents/seo-engineer.md를 읽고 지시에 따라 작업하세요.

    입력:
    - apps/web/_workspace/seo/01_seo_audit.md (반영할 이슈 목록)
    - .claude/skills/seo-manager/references/naver-daum-google-seo-guide.md

    반영 범위: P0 + P1 (사용자가 P2 또는 특정 항목만 별도 지시했다면 그에 따름)
    출력: 수정된 코드 + apps/web/_workspace/seo/02_seo_changes.md

    완료 전 pnpm lint / pnpm typecheck / pnpm build 로 직접 검증하세요.
    """
)
```

---

## Phase 4: 빌드 검증

`02_seo_changes.md`의 검증 결과 확인:
- lint/typecheck/build 모두 ✅ → Phase 5
- 하나라도 ❌ → seo-engineer 재호출 (최대 2회)
- 2회 후에도 실패 → `02_seo_changes.md`에 미해결로 기록하고 Phase 5로 진행, 사용자에게 명확히 경고

---

## Phase 5: 최종 보고

사용자에게 보고:

1. **감사 요약** (P0/P1/P2 건수, Scaled Content Abuse 리스크 평가)
2. **반영 여부** — Phase 3을 실행했다면 변경 파일 목록과 검증(lint/typecheck/build) 통과 여부
3. **미해결 항목** — 코드 변경만으로 불가능한 것(콘텐츠 기획 필요 등), 재검증 한도 초과 항목
4. **수동 조치 체크리스트** — 사람이 각 포털에서 해야 할 일
5. `apps/web/_workspace/seo/` 보존 (삭제 금지)

---

## 부분 재실행 가이드

- "SEO 감사만 다시 해줘" → Phase 0(기존 보존) → Phase 1 → Phase 2
- "지난번 감사 결과 반영해줘" → Phase 0 → Phase 3(기존 `01_seo_audit.md` 재사용) → Phase 4 → Phase 5
- "daycare 상세만 다시 점검해줘" → Phase 1을 범위 한정 프롬프트로 재호출

---

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| seo-auditor가 라이브 URL 확인(WebFetch) 실패 | 로컬 코드 기준으로만 진단, 리포트에 "라이브 확인 실패" 명시 |
| seo-engineer가 감사 리포트와 실제 코드 구조 불일치 발견 | 해당 이슈 스킵, `02_seo_changes.md`에 사유 기록 |
| 빌드 실패가 SEO 변경과 무관한 기존 이슈 | 수정하지 않고 "기존 이슈, 범위 밖"으로 명시 후 보고 |
| Phase 3에서 되돌리기 어려운 변경(sitemap 구조 전환 등) 필요 | 진행 전 사용자에게 별도 확인 |

---

## 테스트 시나리오

### 정상 흐름 (감사만)
1. 사용자: "SEO 점검해줘"
2. Phase 1: seo-auditor가 daycare 상세의 구조화 데이터 부재를 P0(Scaled Content Abuse 연관)로 지적
3. Phase 2: 요약 보고 후 "반영할까요?" 질문 → 사용자가 "리포트만 보고 싶다"고 답함 → 종료

### 정상 흐름 (감사+반영)
1. 사용자: "SEO 점검하고 바로 고쳐줘"
2. Phase 1~2: 감사 및 요약 보고, 승인으로 간주하고 Phase 3 진행
3. Phase 3: seo-engineer가 `LocalBusiness`/`Article` JSON-LD 추가, sitemap 누락 라우트 보완
4. Phase 4: lint/typecheck/build 통과
5. Phase 5: 변경 파일 목록 + "고유 데이터 훅 부재는 콘텐츠 기획 필요 — 코드로 미해결" 보고

### 부분 재실행
1. 사용자: "저번에 감사한 거 반영해줘"
2. Phase 0: `apps/web/_workspace/seo/01_seo_audit.md` 존재 확인 → Phase 3부터 시작
3. Phase 3~5 진행
