---
name: kidzly-refactor
description: kidzly-web 전체 코드 리팩토링 및 도메인/UI 구현 자동화 오케스트레이터. architect → domain-engineer → ui-engineer → qa-engineer → code-reviewer 파이프라인 실행. "리팩토링해줘", "코드 정리해줘", "도메인 구현해줘", "전체 코드 리뷰해줘", "다시 리팩토링", "특정 도메인만 수정", "CLAUDE.md 스펙 맞춰줘", "전체 점검해줘" 등의 요청에 반드시 이 스킬을 사용한다.
---

# kidzly-refactor 오케스트레이터

## 파이프라인 개요

```
Phase 0: 컨텍스트 확인
Phase 1: architect   → _workspace/01_refactor_spec.md
Phase 2: domain-engineer → 도메인 리팩토링 + _workspace/02_domain_changes.md
         └─ 증분 QA (도메인 구조 검증)
Phase 3: ui-engineer → UI 리팩토링 + _workspace/03_ui_changes.md
         └─ 증분 QA (Server/Client 경계 검증)
Phase 4: qa-engineer → _workspace/04_qa_report.md
         └─ 실패 시 재실행 (최대 2회)
Phase 5: code-reviewer → _workspace/05_code_review.md
Phase 6: 완료 보고
```

**실행 모드:** 서브 에이전트 순차 파이프라인  
**모델:** 오케스트레이터 `opus`, 서브 에이전트 `sonnet`

---

## Phase 0: 컨텍스트 확인

`apps/web/_workspace/` 존재 여부를 확인하여 실행 모드 결정:

| 상태 | 처리 |
|------|------|
| `_workspace/` 없음 | 초기 실행 → Phase 1부터 전체 실행 |
| `_workspace/` 있음 + 사용자가 특정 Phase 재요청 | 부분 재실행 → 해당 Phase만 |
| `_workspace/` 있음 + 새 요청 | 아카이브 → `_workspace_{YYYYMMDD}/` 이동 후 Phase 1 |

사용자 요청에서 범위를 파악:
- "전체" → Phase 1~5 전체
- "도메인만" → Phase 1~2 + 4
- "UI만" → Phase 3 + 4
- "리뷰만" → Phase 5

---

## Phase 1: Architect (architect.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 architect 에이전트입니다.
    /.claude/agents/architect.md를 읽고 지시에 따라 작업하세요.

    작업 대상:
    - apps/web/domain/ 전체
    - apps/web/components/ 전체
    - apps/web/app/ 전체
    - apps/web/lib/ 전체
    - CLAUDE.md

    출력: apps/web/_workspace/01_refactor_spec.md
    """
)
```

완료 확인: `_workspace/01_refactor_spec.md` 존재

---

## Phase 2: Domain Engineer (domain-engineer.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 domain-engineer 에이전트입니다.
    /.claude/agents/domain-engineer.md를 읽고 지시에 따라 작업하세요.

    필독:
    - apps/web/_workspace/01_refactor_spec.md (작업 목록)
    - CLAUDE.md (§3, §5, §6, §15)
    - .claude/skills/kidzly-refactor/references/react-query-patterns.md
    - .claude/skills/supabase-guide/SKILL.md

    작업 범위: apps/web/domain/ 하위 전체
    출력: 리팩토링된 도메인 파일 + apps/web/_workspace/02_domain_changes.md
    """
)
```

**증분 QA (Phase 2 완료 후):**
도메인 구조와 import 규칙만 빠르게 검증:
- `parser/` 단수형 ✅/❌
- `server.ts` + `import "server-only"` ✅/❌
- `index.ts` entry point ✅/❌
- inline queryKey 없음 ✅/❌

실패 시 domain-engineer 재호출 (1회 한도).

---

## Phase 3: UI Engineer (ui-engineer.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 ui-engineer 에이전트입니다.
    /.claude/agents/ui-engineer.md를 읽고 지시에 따라 작업하세요.

    필독:
    - apps/web/_workspace/01_refactor_spec.md (UI 작업 목록)
    - apps/web/_workspace/02_domain_changes.md (변경된 import 경로)
    - CLAUDE.md (§10, §11, §12, §13, §16, §17)

    작업 범위: apps/web/components/, apps/web/app/
    출력: 리팩토링된 컴포넌트/페이지 + apps/web/_workspace/03_ui_changes.md
    """
)
```

**증분 QA (Phase 3 완료 후):**
Server/Client 경계와 Suspense 배치만 검증.

---

## Phase 4: QA Engineer (qa-engineer.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 qa-engineer 에이전트입니다.
    /.claude/agents/qa-engineer.md를 읽고 지시에 따라 작업하세요.

    Ground truth:
    - apps/web/_workspace/01_refactor_spec.md
    - apps/web/_workspace/02_domain_changes.md
    - apps/web/_workspace/03_ui_changes.md
    - CLAUDE.md

    검증 범위: apps/web/domain/, apps/web/components/, apps/web/app/
    출력: apps/web/_workspace/04_qa_report.md
    """
)
```

**실패 처리:**
- P0 또는 P1 실패 → 해당 에이전트 재호출 (domain-engineer 또는 ui-engineer)
- 재검증 최대 2회
- 2회 후에도 실패 시 `04_qa_report.md`에 미해결 이슈로 기록하고 Phase 5 진행

---

## Phase 5: Code Reviewer (code-reviewer.md)

```
Agent(
    subagent_type: "claude",
    model: "sonnet",
    prompt: """
    당신은 code-reviewer 에이전트입니다.
    /.claude/agents/code-reviewer.md를 읽고 지시에 따라 작업하세요.

    입력:
    - apps/web/_workspace/04_qa_report.md (QA 결과 — 중복 보고 금지)
    - 리팩토링된 전체 파일

    출력: apps/web/_workspace/05_code_review.md
    """
)
```

---

## Phase 6: 완료 보고

사용자에게 다음을 보고:

1. **변경 파일 목록** (`02_domain_changes.md` + `03_ui_changes.md` 요약)
2. **QA 결과** (`04_qa_report.md`의 통과/실패/갭 수)
3. **P0 이슈** (`05_code_review.md`의 P0 목록)
4. **미해결 이슈** (재검증 한도 초과 항목)
5. **권장 후속 작업** (남은 P1/P2 이슈, 추가 도메인 구현 제안)

---

## 부분 재실행 가이드

사용자가 "도메인 X만 다시" 또는 "UI 수정해줘" 요청 시:

```
Phase 0 → 컨텍스트 확인 (기존 _workspace 유지)
Phase {해당} → 해당 에이전트만 재호출
Phase 4 → QA 재실행
Phase 5 → Code review (선택)
```

---

## 에러 핸들링

- 에이전트 실패: 1회 재시도 → 실패 시 해당 Phase 결과 없이 계속, 보고서에 명시
- 파일 충돌: 기존 파일 덮어쓰기 전 Read로 내용 확인
- 타입 에러 발견: `// TODO: 타입 수정 필요` 주석 추가 후 계속 진행

---

## 테스트 시나리오

**정상 흐름:** "전체 코드 리팩토링해줘"
→ Phase 0~6 순서 실행, `_workspace/` 생성, 완료 보고

**부분 재실행:** "daycare 도메인만 다시 정리해줘"
→ Phase 0 (기존 _workspace 유지), Phase 1 (architect 재분석), Phase 2 (daycare만), Phase 4

**에러 흐름:** qa-engineer가 P0 실패 보고
→ 해당 에이전트 재호출 → 재검증 → 2회 후 미해결로 기록 후 Phase 5 진행
