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

### 유형 1: 썸네일 (앱 아이콘 스타일)

**실제 노출 위치는 리스트의 96~112px 정사각형이다.** 이 크기에서는 어떤 텍스트도 읽히지 않으므로, 텍스트 없이 **포인트 컬러 + 대표 이모지**의 대비만으로 아티클을 구분시킨다. (1080px 원본에서 예뻐 보이는 디자인이 아니라, 96px로 축소했을 때 구분되는 디자인이 기준이다.)

```html
<div class="canvas" style="background: #F1F5F9; display: flex;
            align-items: center; justify-content: center;">
  <div style="width: 820px; height: 820px; border-radius: 220px;
              background: linear-gradient(145deg, {포인트컬러-밝음} 0%, {포인트컬러-어두움} 100%);
              box-shadow: 0 40px 80px -20px {포인트컬러-어두움}66;
              display: flex; align-items: center; justify-content: center;">
    <div style="font-size: 420px; line-height: 1;">{대표 이모지}</div>
  </div>
</div>
```

**색상·이모지 선택 규칙**
- 아티클의 핵심 주제 키워드 하나를 골라 대표 이모지를 정한다 (예: 집=🏠, 이용권/선물=🎁, 아이=👶, 급여/돈=💰, 서류=📋, 일정=📅, 병원=🏥, 책=📚)
- 같은 카테고리(예: "영유아 지원금") 안에서도 아티클마다 색을 다르게 배정한다 — 목표는 리스트에서 나란히 봤을 때 전부 다른 색으로 보이는 것
- 이 레이어에는 절대 텍스트를 넣지 않는다 (96px에서 읽히지 않음)
- 이모지 폰트 크기는 항상 칩(820px) 대비 약 51%(420px)로 고정 — 더 작으면 리스트에서 존재감이 사라짐

**포인트 컬러 팔레트** (그라디언트 밝은색 → 어두운색, 아티클마다 순환 배정)

| 이름 | 밝은색 | 어두운색 |
|------|--------|----------|
| 앰버 | `#F59E0B` | `#B45309` |
| 바이올렛 | `#8B5CF6` | `#6D28D9` |
| 에메랄드 | `#10B981` | `#047857` |
| 블루 | `#3B82F6` | `#1D4ED8` |
| 로즈 | `#F43F5E` | `#BE123C` |
| 틸 | `#14B8A6` | `#0F766E` |
| 오렌지 | `#F97316` | `#C2410C` |
| 인디고 | `#6366F1` | `#4338CA` |

> 유형 2·3(인포그래픽, 강조 카드)은 블로그 본문 안에서 1080px 그대로 크게 노출되므로 텍스트 기반 레이아웃을 그대로 사용한다. 텍스트 축소 문제는 리스트 썸네일(유형 1)에만 해당한다.

---

### 유형 2: 인포그래픽 (리스트형)

체크리스트, 순서, 항목 나열에 사용한다.

```html
<div class="canvas" style="background: #F9FAFB; padding: 80px;">
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
                background: #FFFFFF; border-radius: 20px; padding: 28px 36px;">
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

- 배경 밝음(캔버스): `#F9FAFB` (gray-50) — **순백 `#FFFFFF`를 캔버스 배경으로 쓰지 않는다.** 아티클 본문 배경이 흰색이라 이미지 경계가 사라지고, 이미지 안쪽 여백이 글 여백에 겹쳐 표가 안으로 밀려 보인다
- 밝은 캔버스 위의 카드·콜아웃: `#FFFFFF` — 캔버스가 gray-50이므로 카드를 흰색으로 두면 자연스럽게 떠 보인다. 반대로 하지 않는다
- 배경 밝음(보조): `#EEF4FF`
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
