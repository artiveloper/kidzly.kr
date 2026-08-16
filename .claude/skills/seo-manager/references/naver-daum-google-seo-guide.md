# 네이버·다음·구글 SEO 가이드 (2026)

최종 갱신일: 2026-08-16 (WebSearch 리서치 기준). 6개월 이상 경과했으면 `seo-auditor` 실행 전 핵심 항목(코어 업데이트, 스팸 정책 변경 여부)만 재검색해서 갱신할 것.

이 문서는 `seo-auditor`, `seo-engineer`가 판단 근거로 인용하는 고정 참고 자료다. 키즐리는 네이버 블로그가 아니라 Next.js 독립 웹사이트이므로, 네이버 항목은 "일반 웹사이트(문서) 기준"과 "블로그/카페(UGC) 알고리즘 — 참고용"을 분리해서 읽는다.

---

## 1. 구글

### 1.1 2026년 3월 코어 업데이트 핵심

- **Information Gain** 신호 재조정 — 기존 상위 노출 콘텐츠 대비 얼마나 새로운 정보를 더하는지 평가. 원본 데이터·1차 경험·케이스 스터디가 유리.
- **YMYL(Your Money or Your Life)** 카테고리 타격이 가장 큼. 어린이집 정보는 부모의 자녀 안전·법령 판단에 영향을 주는 성격이라 이 카테고리에 가깝게 취급될 수 있다.
- 제3자 인벤토리를 인덱싱·나열만 하는 비교/집계형 사이트의 입지가 축소되는 추세.

### 1.2 ⚠️ Scaled Content Abuse — 키즐리 직접 리스크 (P0급)

2026년 3월 업데이트에서 "템플릿에 변수만 갈아끼운 대량 페이지" 생성을 스팸 정책 위반으로 명시했다. 이 패턴에 해당하는 사이트는 순위가 하루아침에 60~90% 하락한 사례가 보고됐다. AI·자동화·사람 중 누가 만들었는지는 무관하게 적용된다.

**위반으로 분류되는 패턴:** 대량 AI 페이지 생성(편집 검수 없음), 순수 템플릿+변수 치환, 원본 데이터에 맥락을 더하지 않는 어그리게이터.

**구제 조건:** 검증된 리스팅을 가진 로컬 비즈니스 디렉토리·실데이터 기반 비교 도구는 계속 순위를 유지한다. 단, 각 페이지가 원본 비교표·실제 후기 같은 **고유 데이터 훅**을 갖추고 있어야 한다.

키즐리는 공공 데이터로 어린이집 상세(`/daycare/[id]`)·지역별 랭킹(`/rankings/[sido]`)을 대량 생성하는 구조라 이 정책의 사정권에 든다. 판단 기준은 "어린이집별로 실제로 달라지는 정보(대기 현황, 운영시간, 평점/후기, 주변 시설 비교 등)가 페이지마다 채워지는가"이다. 단순히 공공데이터 원문을 그대로 뿌린 페이지는 위험 신호로 본다.

### 1.3 Core Web Vitals (2026 기준)

- LCP < 2.5초, **INP < 200ms** (2024.3 FID 완전 대체, 페이지 생애주기 전체 인터랙션 중 최악값 기준이라 FID보다 엄격), CLS < 0.1.
- 실사용자 필드 데이터(75th percentile) 기준 — Lighthouse 랩 데이터와는 별개로 확인 필요 (CLAUDE.md의 "Lighthouse ≥ 90" 목표와 방향은 같지만 소스가 다름).
- 3개 지표 모두 통과 시 경쟁 키워드에서 8~15% 노출 상승 사례.

### 1.4 구조화 데이터 (JSON-LD)

- 구글이 명시적으로 **JSON-LD를 권장 포맷**으로 지정.
- 우선순위 5종이 대부분의 요구를 커버: **LocalBusiness, FAQPage, Review, Article, Product**.
- `LocalBusiness`는 가능한 가장 구체적인 서브타입 사용 권장. schema.org에 어린이집 전용 타입은 없어 `LocalBusiness` + 필요 시 `additionalType`으로 보완하는 방식이 실무에서 쓰인다.
- **경고**: FAQPage 스키마를 실제 FAQ가 아닌 마케팅 문구에 씌운 페이지들이 2026년 3월 업데이트에서 대규모 강등당함. **페이지에 눈에 보이는 내용과 구조화 데이터가 반드시 일치**해야 한다 — 안 보이는 FAQ를 스키마에만 넣는 것은 위반.

### 1.5 AI Overview / AI Mode

- 구글은 "AI Overview 전용 랭킹 팩터"를 공식적으로 발표한 적 없음 — 기존 SEO 원칙이 그대로 적용된다는 입장.
- 관찰된 상관관계: 시맨틱 완결성(질문에 대한 답을 페이지 안에서 완결적으로 제공), 멀티모달 요소(이미지·표·영상 동반), E-E-A-T, 엔터티 명확성, 구조화 데이터.
- AI Overview 인용의 47%가 검색 결과 5위 밖 페이지에서 나옴 — 전통적 순위와 AI 인용은 다른 게임.

### 1.6 E-E-A-T / Helpful Content

- Helpful Content가 주기적 업데이트가 아니라 코어 랭킹 알고리즘에 상시 통합된 상태.
- **사이트 전체(도메인 단위) 신호**로 작동 — 특정 페이지가 아니라 사이트 전반의 일관성·진정성을 본다.
- 저자 전문성의 "검증 가능한 이력"이 2026년 3월 업데이트에서 특히 강조됨.

---

## 2. 네이버

### 2.1 일반 웹사이트(문서) 기준 — 키즐리에 적용되는 기준

- **네이버 서치어드바이저** 등록이 출발점. HTML 태그 삽입 또는 파일 업로드로 소유 확인 후 사이트 등록.
- **사이트맵 1개만 제출 가능** — 콘텐츠가 계속 늘어나는 구조(어린이집 상세, 블로그 글)라면 사이트맵 인덱스 파일 형태로 전환 검토.
- **RSS 피드**는 "최근 등록된 중요 콘텐츠"를 빠르게 알리는 용도로, 사이트맵과 역할이 다르므로 둘 다 제출 권장.
- **Yeti 크롤봇** 기준 robots.txt 최적화 필요.
- title/description/OG 메타태그는 페이지 전체(홈뿐 아니라 각 상세 페이지)에 개별 적용해야 함.
- 콘텐츠 신선도(최신성)와 자연스러운 한국어 표현을 우대.

### 2.2 블로그/카페(UGC) 알고리즘 — 참고용, 직접 적용 대상 아님

`blog.naver.com` 채널을 별도로 운영하지 않는 한 아래는 직접 해당하지 않는다. 미래에 네이버 블로그 채널을 연동한다면 참고.

- **C-Rank**: 콘텐츠·맥락·체인(유입·전환) 3요소로 신뢰도 평가. 한 주제에 집중하는 채널이 유리.
- **D.I.A / D.I.A+**: 검색 의도와의 일치도 평가, 대표 이미지 크롤링해 시각 스니펫 생성.
- 저품질 신호: 유사 문서, 짧은 글, 과도한 상업성, 부자연스러운 활동 패턴.

### 2.3 2026년 변화

- 연관검색어 기능 4월 30일 폐지.
- **AI 브리핑**이 검색 결과의 약 20%에 적용 — 요약 인용을 노리려면 구조화된 답변(질문형 제목 + 40~60단어 핵심 답변)이 유리.
- **AI Tab** 베타 — 대화형 검색, UGC 기반 1인칭·경험 콘텐츠 선호(블로그 채널 운영 시 해당).
- 모바일 검색결과에 광고·쇼핑 영역 비중 확대.

---

## 3. 다음(Daum/카카오)

- 공식 SEO 가이드 문서가 네이버 대비 훨씬 빈약함.
- **검색등록(register.search.daum.net)**에서 사이트/RSS/사이트맵(Seed URL) 등록. RSS·Atom 피드·리스트페이지·사이트맵 URL 형식 지원.
- 등록해도 **노출 반영까지 수개월** 걸릴 수 있다고 공식 고지.
- 로컬(지역) 검색에 강점이 있다는 언급 반복 — 어린이집 정보 서비스인 키즐리 성격과 맞는 지점.
- 카카오 채널(카카오톡, 카카오스토리 등) 연동을 통한 유입이 다음 생태계 내 신뢰 신호로 작용한다는 언급.
- 2026년 다음은 업스테이지 LLM 'Solar' 연동 검증대 성격이 강해지는 추세 — 다음 자체의 AI 검색 통합이 진행형이라 가이드가 계속 바뀔 수 있음.
- 키즐리는 `robots.txt`에 `#DaumWebMasterTool` 인증 주석이 이미 있음 — 인증 만료·갱신 여부는 사람이 포털에서만 확인 가능.

---

## 4. 3사 비교

| 항목 | 구글 | 네이버 | 다음 |
|---|---|---|---|
| 2026년 핵심 리스크 | 템플릿형 대량 페이지 강등(Scaled Content Abuse) | AI 브리핑 확대로 전통 클릭 유입 감소 | 낮은 문서화, 반영 지연(수개월) |
| 구조화 데이터 | JSON-LD 필수급, 페이지 내용과 100% 일치해야 함 | 자체 UGC(블로그/카페) 알고리즘이 우선, 일반 웹문서는 메타태그·사이트맵 중심 | 명시적 요구사항 확인 안 됨 |
| 성능 지표 | LCP/INP/CLS 필드 데이터 | 명문화된 성능 기준 없음 | 확인 안 됨 |
| 등록 도구 | Search Console | 서치어드바이저 | 검색등록(전용 웹마스터 도구 없음) |
| 사이트맵 | 여러 개 가능 | 1개만(인덱스 파일 권장) | Seed URL로 제출 |
| 키즐리에 주는 시사점 | 어린이집 상세 페이지마다 고유 데이터 훅 필요, FAQ 스키마는 실제 FAQ에만 | 사이트맵 1개 제한 → 인덱스 파일 전환 검토, 이미지 alt·캡션 최적화 | 등록·인증 상태만 주기적 확인, 기술 투자 우선순위는 낮게 |

---

## 5. 출처

- [Naver SEO 2026: The Complete Guide for Marketers](https://www.theegg.com/seo/korea/naver-seo-guide-understanding-the-korean-search-engine/)
- [2026년 6월 네이버 검색 시장 리포트 - SEO NEWS](https://seonews.co.kr/naver-search-report-june-2026/)
- [네이버 서치어드바이저 설정 방법 완벽 가이드](https://weekerp.com/ko/blog/naver-search-advisor-setup)
- [네이버 서치어드바이저란? - 마케팅 인사이드](https://inside.ampm.co.kr/insight/9167)
- [2026 네이버 블로그 저품질 원인과 탈출 방법 총정리 - TILNOTE](https://tilnote.io/en/pages/69ce9379a5dad016ee58c5b9)
- [네이버 블로그 상위노출 체크리스트 - 로카포스팅](https://locaposting.com/blog/naver-seo-checklist)
- [다음, 네이버, 구글 각각 SEO를 따로 해줘야 하나요? - 마고자비 블로그](https://magomercy.com/web/%EB%8B%A4%EC%9D%8C-%EB%84%A4%EC%9D%B4%EB%B2%84-%EA%B5%AC%EA%B8%80-%EA%B0%81%EA%B0%81-SEO%EB%A5%BC-%EB%94%B0%EB%A1%9C-%ED%95%B4%EC%A4%98%EC%95%BC-%ED%95%98%EB%82%98%EC%9A%94-%EA%B2%80%EC%83%89%EC%97%94%EC%A7%84-%EC%B5%9C%EC%A0%81%ED%99%94-%EC%8B%9C-%EA%B3%A0%EB%A0%A4%ED%95%B4%EC%95%BC-%ED%95%A0-%EC%A0%90)
- [Daum 검색 도움말 - 고객센터](https://cs.daum.net/faq/15/9334.html?faqId=38563)
- [포털 다음 실검 재개…업스테이지 AI 시너지 주목 - ZDNet korea](https://zdnet.co.kr/view/?no=20260309143017)
- [한국 검색엔진 순위 및 점유율 (2026) - 인블로그 블로그](https://inblog.ai/ko/blog/korea-search-engine-rankings)
- [Google AI Overviews Ranking Factors: 2026 Guide - wellows](https://wellows.com/blog/google-ai-overviews-ranking-factors/)
- [Google's March 2026 Core Update: What Agencies Need to Know - seovendor](https://seovendor.co/google-march-2026-core-update-what-agencies-need-to-know-and-how-to-recover/)
- [Google's March 2026 Core Update: Winners, Losers & Analysis - Amsive](https://www.amsive.com/insights/seo/google-march-2026-core-update-winners-losers-analysis/)
- [Local Business Structured Data - Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Schema Markup Guide: SEO and AI Search in 2026 - Discoverability](https://discoverability.co/resources/schema-markup-guide/)
- [Google E-E-A-T Guidelines: 2026 Playbook - Keywords Everywhere](https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/)
- [Core Web Vitals 2026: What's Changed and How to Pass - Rivuletiq](https://www.rivuletiq.com/core-web-vitals-2026-whats-changed-and-how-to-pass/)
- [Programmatic SEO After March 2026: Scaled Content Survival - digitalapplied](https://www.digitalapplied.com/blog/programmatic-seo-after-march-2026-surviving-scaled-content-ban)
- [The Ultimate Guide to Google's Scaled Content Abuse Policies - Breakline](https://www.breaklineagency.com/guide-to-googles-scaled-content-abuse/)
