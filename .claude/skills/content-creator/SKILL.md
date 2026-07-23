---
name: content-creator
description: "어린이집·유치원 부모를 대상으로 한 SEO 블로그 글, 아티클, 포스팅, 콘텐츠 작성 요청 시 반드시 이 스킬을 사용한다. 키워드 리서치, SEO 최적화 글쓰기, 이미지 기획, 팩트체크, 최종 콘텐츠 패키지 생성까지 에이전트 팀이 자동 수행한다. '부모 대상 글 써줘', '어린이집 블로그 포스팅', '콘텐츠 작성해줘', '아티클 만들어줘', '다시 써줘', '글 보완해줘', '이미지 방향 다시', '팩트체크 다시', '이전 결과 수정' 등의 표현이 포함되면 이 스킬을 트리거한다."
---

# 어린이집 부모 대상 콘텐츠 크리에이터

어린이집·유치원 부모를 대상으로 한 SEO 최적화 콘텐츠를 에이전트 팀이 협업하여 제작한다.
리서치 → 글쓰기 + 이미지 기획 → 팩트체크 → 통합 4단계로 출처가 검증된 발행 준비 완료 패키지를 산출한다.

## 실행 모드: 하이브리드

| Phase | 모드 | 이유 |
|-------|------|------|
| Phase 2 (리서치) | 서브 에이전트 | 단독 WebSearch 작업 |
| Phase 3 (글쓰기 + 이미지) | 에이전트 팀 | writer와 image-director가 섹션별 실시간 협업 |
| Phase 4 (팩트체크) | 서브 에이전트 | 독립적 검증 (팀 영향 없이 글을 객관적으로 읽어야 함) |
| Phase 5 (통합) | 서브 에이전트 | 단독 조합 작업 |

## 에이전트 구성

| 에이전트 | 역할 | 출력 파일 |
|---------|------|----------|
| content-researcher | 키워드·주제·출처 리서치 | `_workspace/01_researcher_brief.md` |
| seo-writer | SEO 최적화 글쓰기 + 인라인 출처 표기 | `_workspace/02_writer_article.md` |
| image-director | HTML/CSS 이미지 제작 + Playwright PNG 캡처 | `_workspace/03_image_director_prompts.md`, `_workspace/images/*.png` |
| fact-checker | 사실 주장 검증 + 수정안 제시 | `_workspace/04_fact_check_report.md` |
| content-integrator | 팩트체크 반영 + 최종 패키지 통합 | `_workspace/final/{topic}_package.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인

`_workspace/` 디렉토리 존재 여부를 확인하여 실행 모드를 결정한다:

- **`_workspace/` 미존재** → 초기 실행. Phase 1로 진행
- **`_workspace/` 존재 + 부분 수정 요청** (예: "글만 다시 써줘", "팩트체크 다시", "이미지 수정") → 해당 에이전트만 재호출. 이후 Phase는 연쇄 재실행 (글 수정 → 팩트체크 재실행 → 통합 재실행)
- **`_workspace/` 존재 + 새 주제 제공** → 새 실행. 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동한 뒤 새 `_workspace/` 생성

**연쇄 재실행 규칙:** 글(02)이 수정되면 → 팩트체크(04) 재실행 → 통합(05) 재실행. 이미지(03)만 수정되면 → 통합(05)만 재실행.

### Phase 1: 입력 분석 및 준비

1. 사용자 입력에서 파악한다:
   - **주제/키워드**: 명시되지 않으면 사용자에게 1가지만 질문
   - **목표 독자**: 기본값 = "어린이집 부모 일반"
   - **콘텐츠 목적**: 기본값 = "정보 제공 + 신뢰 구축"
   - **추가 지시**: 톤, 분량, 강조할 내용 등

2. `_workspace/` 디렉토리와 `_workspace/images/`, `_workspace/final/` 하위 디렉토리 생성

3. `_workspace/00_input.md`에 사용자 요청을 구조화하여 저장

### Phase 2: 리서치
**실행 모드:** 서브 에이전트

```
Agent(
  description: "어린이집 부모 대상 콘텐츠 리서치 + 출처 수집",
  prompt: "agents/content-researcher.md를 읽고 역할에 따라 작업을 수행하라.

  입력: _workspace/00_input.md 를 읽어 주제·목표 독자·목적을 파악할 것.

  작업:
  - WebSearch로 키워드 트렌드, 부모 커뮤니티 인사이트, 경쟁 콘텐츠를 조사한다
  - 보건복지부, 육아정책연구소, 한국보육진흥원 등 공신력 있는 기관에서
    사실·통계·법령 근거를 수집하고 URL을 함께 기록한다
  - 출처 없는 정보는 '리서치 한계' 섹션에만 기록하고 검증된 사실 목록에는 포함하지 않는다
  - 결과를 _workspace/01_researcher_brief.md 에 저장한다",
  model: "sonnet"
)
```

### Phase 3: 글쓰기 + 이미지 기획
**실행 모드:** 에이전트 팀

#### 팀 생성

```
TeamCreate(
  team_name: "content-creation-team",
  members: [
    {
      name: "seo-writer",
      agent_type: "general-purpose",
      model: "sonnet",
      prompt: "agents/seo-writer.md를 읽고 역할에 따라 작업을 수행하라.

      입력: _workspace/01_researcher_brief.md 를 읽을 것.
      특히 '검증된 사실과 출처' 섹션의 내용만 사실로 제시하고,
      나머지 사실 주장에는 [출처 필요]를 표시한다.

      작업:
      1. 글 작성 전 image-director에게 주제·예상 구조를 SendMessage로 공유
      2. 각 H2 섹션 완성마다 image-director에게 SendMessage
      3. 완성 글을 _workspace/02_writer_article.md 에 저장
      4. 오케스트레이터에게 완성 알림 + [출처 필요] 항목 수 보고"
    },
    {
      name: "image-director",
      agent_type: "general-purpose",
      model: "sonnet",
      prompt: "agents/image-director.md와 skills/content-creator/references/image-html-template.md를 읽고 역할에 따라 작업을 수행하라.

      입력: _workspace/01_researcher_brief.md 를 읽어 주제 맥락 파악.

      이미지 스펙: 1080×1080px, HTML+CSS 코딩 후 Python Playwright PNG 캡처.
      캡처 명령: python skills/content-creator/scripts/capture.py <html경로> <png경로>
      캡처 후 Read 도구로 PNG를 열어 시각적 검수 (최대 3회 반복).

      작업:
      1. seo-writer 주제 알림 수신 → 시각적 컨셉 SendMessage 회신
      2. 섹션 알림 수신 → HTML 코딩 → 캡처 → 시각 검수 → PNG 확정
      3. 모든 섹션 완성 후 썸네일 제작
      4. 기획서를 _workspace/03_image_director_prompts.md 에 저장
      5. 오케스트레이터에게 PNG 목록 알림"
    }
  ]
)
```

#### 작업 등록

```
TaskCreate(tasks: [
  {
    title: "SEO 아티클 작성",
    description: "리서치 브리프 기반 SEO 최적화 글 작성. 검증된 사실만 단정적으로 제시, 나머지는 [출처 필요] 표시. _workspace/02_writer_article.md 저장",
    assignee: "seo-writer"
  },
  {
    title: "이미지 제작 및 캡처",
    description: "섹션별 HTML/CSS 이미지 코딩 + Playwright PNG 캡처 + 시각 검수. _workspace/images/ 저장 및 기획서 작성",
    assignee: "image-director"
  }
])
```

#### 팀 정리

두 작업 완료 확인 후:
```
TeamDelete("content-creation-team")
```

### Phase 4: 팩트체크
**실행 모드:** 서브 에이전트

```
Agent(
  description: "어린이집 부모 대상 콘텐츠 사실 검증",
  prompt: "agents/fact-checker.md를 읽고 역할에 따라 작업을 수행하라.

  입력:
  - _workspace/02_writer_article.md (검증 대상 글)
  - _workspace/01_researcher_brief.md (기존 출처 목록 참조)

  작업:
  - 글의 모든 사실 주장을 추출한다 ([출처 필요] 표시 항목 + 인라인 출처 항목 모두)
  - WebSearch로 각 주장을 보건복지부, 육아정책연구소, 국가법령정보센터 등
    공신력 있는 기관에서 검증한다
  - 판정: ✅ 검증완료 / ⚠️ 출처필요 / 🔄 수정필요 / ❌ 삭제권고
  - 결과를 _workspace/04_fact_check_report.md 에 저장한다
  - 🔄 또는 ❌ 항목이 있으면 오케스트레이터에게 수정 필요 항목 수를 보고한다",
  model: "sonnet"
)
```

**팩트체크 후 분기:**
- 🔄 수정 필요 또는 ❌ 삭제 권고 항목이 있으면 → seo-writer를 서브 에이전트로 재호출하여 수정 반영
- ⚠️ 출처 필요만 남아 있으면 → 통합 단계에서 경고 표시로 처리하고 진행
- 모든 항목 ✅ → Phase 5로 바로 진행

**seo-writer 수정 재호출 (필요 시):**
```
Agent(
  description: "팩트체크 수정 사항 반영",
  prompt: "agents/seo-writer.md를 읽고 _workspace/04_fact_check_report.md의
  🔄 수정 필요와 ❌ 삭제 권고 항목을 _workspace/02_writer_article.md 에 반영하라.
  수정 이력을 파일 하단에 기록한다.",
  model: "sonnet"
)
```

### Phase 5: 통합
**실행 모드:** 서브 에이전트

```
Agent(
  description: "콘텐츠 패키지 최종 통합",
  prompt: "agents/content-integrator.md를 읽고 역할에 따라 작업을 수행하라.

  입력 파일:
  - _workspace/01_researcher_brief.md
  - _workspace/02_writer_article.md (팩트체크 수정 반영본)
  - _workspace/03_image_director_prompts.md
  - _workspace/04_fact_check_report.md

  작업:
  - 네 파일을 읽고 발행 준비 완료 콘텐츠 패키지를 생성한다
  - 팩트체크 보고서의 '검증된 출처 목록'을 패키지 '참고 자료' 섹션에 포함한다
  - ⚠️ 출처 필요 항목이 남아 있으면 발행 전 체크리스트에 경고를 표시한다
  - _workspace/final/{topic}_package.md 로 저장한다",
  model: "sonnet"
)
```

### Phase 6: 결과 보고

1. `_workspace/final/` 에서 생성된 패키지 파일 경로 확인
2. 사용자에게 보고:
   - 최종 파일 경로
   - 메타 제목 / 예상 읽기 시간
   - 팩트체크 결과 요약 (검증 완료 N개 / 수정 반영 N개 / 미해결 ⚠️ N개)
   - 이미지 PNG 생성 개수
   - 발행 권고 상태 (즉시 발행 가능 / 출처 보완 후 발행 가능 / 발행 보류)
3. `_workspace/` 디렉토리 보존 (삭제 금지)

### Phase 7: 실제 발행 (사용자가 발행을 요청한 경우)

패키지를 실제 `apps/web/content/blog/{slug}.mdx`로 옮기고 이미지를 `apps/web/public/blog/{slug}/`에 배치한 뒤,
**커밋 전에 반드시** 아래를 실행하여 MDX 컴파일 검증을 마친다:

```bash
cd apps/web && npx velite build
```

- ⚠️ 체크리스트(`~` 이스케이프, `<strong>` 처리 등)는 사람/에이전트의 자가 점검이라 놓칠 수 있다 — `velite build`가 실제 게이트다
- 에러 없이 빌드 완료 → `.velite/blog.json`에 해당 글이 포함됐는지 `publishedAt`/`slug`로 확인 후 커밋 진행
- 에러 발생 → 에러 메시지의 파일·라인을 읽고 해당 `.mdx`를 직접 수정한 뒤 재빌드. 에러가 사라질 때까지 커밋하지 않는다
- 자주 나오는 에러 원인: 이스케이프 안 된 `~` (subscript/strikethrough 오인식), `**`/`<strong>` 닫힘 직전 구두점, 닫히지 않은 JSX 태그

## 데이터 흐름

```
[사용자 요청]
      ↓
[Phase 1: 00_input.md]
      ↓
[Phase 2: content-researcher (서브)]
      ↓
[01_researcher_brief.md — 검증된 출처 목록 포함]
      ↓
[Phase 3: seo-writer ←SendMessage→ image-director (팀)]
      ↓                    ↓
[02_writer_article]   [03_image_director_prompts + images/*.png]
      ↓
[Phase 4: fact-checker (서브)]
      ↓
[04_fact_check_report.md]
      ↓ (🔄/❌ 있으면 seo-writer 재호출 → 02 수정)
[Phase 5: content-integrator (서브)]
      ↓
[final/{topic}_package.md — 출처 목록 포함]
      ↓
[Phase 6: 결과 보고]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| researcher WebSearch 실패 | 1회 재시도. 재실패 시 출처 목록 없이 브리프 작성, 팩트체커가 보완 |
| seo-writer [출처 필요] 과다 (5개 이상) | 팩트체커가 최대한 보완. 미해결 항목은 체크리스트에 표시 |
| fact-checker 검증 불가 항목 | ⚠️ 출처 필요로 분류, 통합 단계에서 경고 표시 |
| 팩트체크 후 수정 범위가 너무 클 때 | 오케스트레이터가 사용자에게 보고 후 진행 여부 확인 |
| image-director 시각 검수 3회 실패 | 최선 버전 유지 + 수동 검토 필요 표시 |
| 통합 시 팩트체크 보고서 누락 | "팩트체크 미완료 — 발행 전 수동 검토 필수" 경고 포함 후 통합 진행 |
| Phase 7 `velite build` 실패 | 발행 중단. 에러 위치의 `.mdx` 수정 → 재빌드 → 통과 확인 후에만 커밋 (체크리스트 통과만으로 발행 완료 처리 금지) |

## 테스트 시나리오

### 정상 흐름
1. 사용자: "어린이집 CCTV 의무 설치 기준에 대한 부모 가이드 글 써줘"
2. Phase 2: researcher가 영유아보육법 제15조의4, 보건복지부 자료 출처 수집
3. Phase 3: writer가 법령 출처 포함 글 작성, image-director가 인포그래픽 제작
4. Phase 4: fact-checker가 법령 조항 검증 — CCTV 예외 조항 누락 발견, 🔄 수정 필요 판정
5. seo-writer 재호출 → 예외 조항 추가 반영
6. Phase 5: integrator가 검증된 출처 포함 패키지 생성
7. Phase 6: "즉시 발행 가능" 보고

### 에러 흐름
1. Phase 4에서 writer가 쓴 통계 수치가 확인 불가 → ❌ 삭제 권고 1건, ⚠️ 출처 필요 2건
2. seo-writer 재호출 → 삭제 권고 항목 제거, 출처 필요 2건은 표현 완화로 처리
3. Phase 5에서 integrator가 체크리스트에 "⚠️ 출처 필요 2건 — 발행 후 보완 가능" 표시
4. Phase 6에서 "출처 보완 후 발행 가능" 상태로 보고

### 부분 재실행 흐름
1. 사용자: "팩트체크만 다시 해줘"
2. Phase 0: `_workspace/` 존재 + 부분 수정 → Phase 4만 재실행
3. 팩트체크 재실행 → Phase 5 통합 재실행 (연쇄)
4. 새 패키지 파일 생성
