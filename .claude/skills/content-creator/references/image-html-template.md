# 이미지 HTML 템플릿 가이드

모든 이미지는 1080×1080px HTML + CSS로 제작 후 Playwright로 PNG 캡처한다.

## 기본 HTML 뼈대

모든 이미지 HTML의 최상단에 이 구조를 사용한다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080, height=1080">
<style>
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1080px;
    height: 1080px;
    overflow: hidden;
    font-family: 'Pretendard', -apple-system, 'Apple SD Gothic Neo',
                 'Malgun Gothic', '맑은 고딕', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .canvas {
    width: 1080px;
    height: 1080px;
    position: relative;
    /* 배경색·그라디언트는 이미지 유형별로 지정 */
  }
</style>
</head>
<body>
  <div class="canvas">
    <!-- 이미지 내용 -->
  </div>
</body>
</html>
```

---

## 이미지 유형별 레이아웃 패턴

### 유형 1: 썸네일 (타이틀 카드)

주제를 한눈에 전달하는 대표 이미지. 텍스트 + 배경색 + 브랜드 요소.

```html
<div class="canvas" style="background: linear-gradient(135deg, #EEF4FF 0%, #D6E8FF 100%);">
  <!-- 브랜드 로고 영역 (선택) -->
  <div style="position: absolute; top: 60px; left: 60px;
              font-size: 28px; font-weight: 700; color: #3B82F6; letter-spacing: -0.5px;">
    kidzly
  </div>

  <!-- 메인 콘텐츠 -->
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 900px; text-align: center;">
    <!-- 카테고리 뱃지 -->
    <div style="display: inline-block; background: #3B82F6; color: #fff;
                font-size: 24px; font-weight: 600; padding: 10px 28px;
                border-radius: 100px; margin-bottom: 40px; letter-spacing: 0.5px;">
      어린이집 가이드
    </div>

    <!-- 메인 타이틀 -->
    <h1 style="font-size: 72px; font-weight: 800; color: #1E293B;
               line-height: 1.25; letter-spacing: -2px; margin-bottom: 32px;">
      어린이집 적응 기간,<br>부모가 알아야 할<br>5가지
    </h1>

    <!-- 서브 텍스트 -->
    <p style="font-size: 32px; font-weight: 400; color: #64748B; letter-spacing: -0.5px;">
      우리 아이의 등원을 편하게 만드는 방법
    </p>
  </div>

  <!-- 하단 장식 -->
  <div style="position: absolute; bottom: 60px; left: 60px; right: 60px;
              height: 4px; background: linear-gradient(90deg, #3B82F6, #60A5FA);
              border-radius: 2px;">
  </div>
</div>
```

---

### 유형 2: 인포그래픽 (리스트형)

체크리스트, 순서, 항목 나열에 사용한다.

```html
<div class="canvas" style="background: #FFFFFF; padding: 80px;">
  <!-- 타이틀 -->
  <h2 style="font-size: 52px; font-weight: 800; color: #1E293B;
             letter-spacing: -1.5px; margin-bottom: 16px; line-height: 1.2;">
    어린이집 선택 체크리스트
  </h2>
  <p style="font-size: 28px; color: #94A3B8; margin-bottom: 56px; letter-spacing: -0.5px;">
    입소 전 반드시 확인하세요
  </p>

  <!-- 리스트 아이템 (최대 5~6개) -->
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <!-- 아이템 반복 구조 -->
    <div style="display: flex; align-items: center; gap: 28px;
                background: #F8FAFC; border-radius: 20px; padding: 28px 36px;">
      <div style="width: 56px; height: 56px; background: #3B82F6; border-radius: 50%;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 28px; font-weight: 800; color: #fff; flex-shrink: 0;">
        1
      </div>
      <div>
        <div style="font-size: 32px; font-weight: 700; color: #1E293B;
                    letter-spacing: -0.5px; margin-bottom: 6px;">
          원장님과 직접 면담 가능 여부
        </div>
        <div style="font-size: 24px; color: #64748B; letter-spacing: -0.3px;">
          투명한 소통 구조의 신뢰 지표
        </div>
      </div>
    </div>
    <!-- 아이템 반복... -->
  </div>

  <!-- 브랜드 -->
  <div style="position: absolute; bottom: 56px; right: 80px;
              font-size: 24px; font-weight: 700; color: #CBD5E1; letter-spacing: -0.3px;">
    kidzly
  </div>
</div>
```

---

### 유형 3: 강조 카드 (숫자·통계·인용)

핵심 수치나 명언을 크게 강조할 때.

```html
<div class="canvas" style="background: #1E293B;">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 900px; text-align: center;">
    <!-- 큰 숫자 -->
    <div style="font-size: 200px; font-weight: 900; color: #3B82F6;
                letter-spacing: -8px; line-height: 1; margin-bottom: 24px;">
      73%
    </div>
    <!-- 설명 -->
    <p style="font-size: 44px; font-weight: 600; color: #F1F5F9;
              letter-spacing: -1px; line-height: 1.4;">
      의 부모가 어린이집 선택 시<br>
      <span style="color: #60A5FA;">안전 환경</span>을 1순위로 꼽았습니다
    </p>
    <!-- 출처 -->
    <p style="font-size: 22px; color: #64748B; margin-top: 48px; letter-spacing: -0.3px;">
      육아정책연구소, 2024
    </p>
  </div>
</div>
```

---

## 폰트 사이즈 기준 (1080px 캔버스 기준)

| 용도 | 크기 | font-weight |
|------|------|-------------|
| 메인 헤드라인 | 64~96px | 800~900 |
| 서브 헤드라인 | 40~56px | 700 |
| 섹션 타이틀 | 32~44px | 700 |
| 본문 텍스트 | 24~32px | 400~500 |
| 캡션/출처 | 20~24px | 400 |
| 브랜드 마크 | 24~28px | 700 |

## 색상 팔레트 권장

- 배경 밝음: `#F8FAFC`, `#EEF4FF`
- 배경 어두움: `#1E293B`, `#0F172A`
- 포인트(Blue): `#3B82F6`, `#60A5FA`
- 텍스트 강: `#1E293B`
- 텍스트 중: `#64748B`
- 텍스트 약: `#94A3B8`

## 파일 저장 컨벤션

```
_workspace/images/
├── thumbnail.html          → thumbnail.png
├── section_01_{키워드}.html → section_01_{키워드}.png
├── section_02_{키워드}.html → section_02_{키워드}.png
└── ...
```
