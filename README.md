# AI와 함께하는 Vibe Coding — NIA 직원 실무형 교육

> AI 코딩 도구(Claude, Antigravity, Gemini)를 활용해 자연어만으로 실무 도구와 프로토타입을 직접 만들어보는 실습형 강의

🌐 **강의 웹사이트**: [https://namojo.github.io/vibe-coding-lec/](https://namojo.github.io/vibe-coding-lec/)

## 개요

| 항목 | 내용 |
|------|------|
| **대상** | NIA(한국지능정보사회진흥원) 직원 — 비개발자 + 개발자 |
| **총 소요 시간** | 약 8시간 (모듈별 독립 수강 가능) |
| **모듈 수** | 9개 모듈, 21개 실무형 사례 |
| **AI 도구** | Claude, Antigravity, Gemini |
| **난이도 분포** | 초급 38% · 중급 38% · 고급 24% |

## 학습 트랙

### 비개발자 트랙 (약 5시간)
> 모듈 1 → 2 → 3 → 4 → 5 → 6 → 7

### 개발자 트랙 (약 8시간, 전체)
> 모듈 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

## 모듈 구성

| 모듈 | 제목 | 난이도 | 도구 | 사례 수 |
|------|------|--------|------|---------|
| 1 | [Vibe Coding이란 무엇인가?](src/module-01-intro/) | 초급 | 공통 | 이론 |
| 2 | [첫 번째 성공 경험 — 나만의 웹페이지](src/module-02-first-webpage/) | 초급 | Claude, Antigravity | 2 |
| 3 | [문서 자동화 — 회의록부터 보고서까지](src/module-03-document-automation/) | 초급 | Claude, Gemini | 3 |
| 4 | [데이터를 눈에 보이게 — 시각화와 분석](src/module-04-data-visualization/) | 초급~중급 | Claude, Gemini | 2 |
| 5 | [업무 자동화 — 반복 작업에서 해방](src/module-05-automation/) | 초급~중급 | Gemini, Claude | 2 |
| 6 | [인터랙티브 웹앱 만들기](src/module-06-webapp/) | 중급 | Gemini, Claude | 3 |
| 7 | [외부 서비스 연동 — Sheets와 공공데이터](src/module-07-external-integration/) | 중급 | Gemini, Antigravity | 2 |
| 8 | [개발자 심화 — 본격 개발 도구 활용](src/module-08-api-integration/) | 중급~고급 | Claude Code, Antigravity | 3 |
| 9 | [풀스택 프로젝트 — AI로 서비스 만들기](src/module-09-project/) | 고급 | Claude Code, Claude | 3 |

## 소스코드 구조

```
src/
├── module-01-intro/           # Vibe Coding 소개 (이론)
├── module-02-first-webpage/   # 포트폴리오, 팀소개 페이지
│   ├── portfolio.html
│   └── team-page.html
├── module-03-document-automation/  # 문서 자동화
│   ├── meeting-minutes.html       # 회의록 정리기
│   ├── policy-briefing.html       # 정책 브리핑 생성기
│   └── translator.html            # 번역 도우미
├── module-04-data-visualization/   # 데이터 시각화
│   ├── chart-maker.html           # CSV 차트 시각화
│   └── survey-analyzer.html       # 설문 분석 대시보드
├── module-05-automation/           # 업무 자동화
│   ├── email-classifier.html      # 이메일 분류기
│   └── schedule-extractor.html    # 일정 추출 캘린더
├── module-06-webapp/               # 인터랙티브 웹앱
│   ├── unit-converter.html        # 다기능 변환기
│   ├── presentation.html          # 웹 프레젠테이션
│   └── data-to-report.html       # 데이터→보고서 변환기
├── module-07-external-integration/ # 외부 서비스 연동
│   ├── sheets-dashboard.html      # Google Sheets 대시보드
│   └── public-data-dashboard.html # 공공데이터 대시보드
├── module-08-api-integration/      # 개발자 심화
│   ├── file-organizer/            # 파일 정리 CLI 도구
│   ├── notification-bot/          # Slack/Teams 알림봇
│   └── report-pipeline/           # 보고 자동화 파이프라인
└── module-09-project/              # 풀스택 프로젝트
    ├── chatbot.html               # NIA 업무 챗봇
    ├── monitoring-dashboard.html  # 실시간 모니터링
    └── setup-guide.md             # React 프로젝트 가이드
```

## 실행 방법

### HTML 파일 (모듈 2~7, 9)
HTML 파일을 브라우저에서 직접 열거나:
```bash
cd src/module-02-first-webpage
open portfolio.html    # macOS
# 또는 브라우저로 드래그 앤 드롭
```

### Node.js 프로젝트 (모듈 8)
```bash
# 파일 정리 도구
cd src/module-08-api-integration/file-organizer
node organize.js /path/to/folder --dry-run

# 알림봇
cd src/module-08-api-integration/notification-bot
npm install
node bot.js

# 보고 파이프라인
cd src/module-08-api-integration/report-pipeline
node pipeline.js
```

## 기술 스택

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **차트**: [Chart.js](https://www.chartjs.org/) (CDN)
- **백엔드** (모듈 8): Node.js
- **강의 사이트**: GitHub Pages

## 라이선스

이 교육 자료는 NIA 직원 교육을 위해 제작되었습니다.
