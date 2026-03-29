# 모듈 8: API 연동과 업무 자동화

## 사례 8-1: 파일 정리 CLI 도구 (file-organizer/)
**Node.js CLI 도구** - 지정 폴더의 파일을 자동으로 분류합니다.

### 주요 기능
- 확장자별 자동 분류 (이미지, 문서, 동영상 등 9개 카테고리)
- `--by-date`: 날짜별(YYYY-MM) 분류
- `--by-size`: 크기별(소형/중형/대형) 분류
- `--dry-run`: 실제 이동 없이 미리보기
- `--recursive`: 하위 폴더 포함
- 진행률 표시, 중복 파일 감지 (MD5), 작업 로그 저장
- `organize.config.json`으로 카테고리 커스터마이징

### 실행
```bash
cd file-organizer
node organize.js ~/Downloads --dry-run
node organize.js ~/Desktop --by-date --recursive
```

---

## 사례 8-2: 알림봇 (notification-bot/)
**Slack/Teams Webhook 알림봇** - 일정과 마감일을 모니터링하여 알림을 발송합니다.

### 주요 기능
- Slack / Microsoft Teams Webhook 알림 발송
- 일정 관리 (`schedule.json`) - 단일/반복 일정
- 마감일 모니터링 (`deadlines.json`) - 기한 초과/임박 감지
- 웹 관리 대시보드 (`server.js`) - 상태 확인 및 이력 조회
- CLI 명령: `--check`, `--send-test`, `--list-schedules`

### 실행
```bash
cd notification-bot
cp .env.example .env        # Webhook URL 설정
node bot.js --check          # 즉시 점검
node bot.js                  # 상시 모니터링
node server.js               # 웹 관리 페이지 (localhost:3000)
```

---

## 사례 8-3: 보고 자동화 파이프라인 (report-pipeline/)
**CSV → 통계 → HTML 보고서** 자동 생성 파이프라인입니다.

### 주요 기능
- CSV 파일 파싱 (한글 헤더 지원)
- 자동 통계 계산 (합계, 평균, 최소/최대, 중앙값)
- 부서별 그룹화 및 완료율 분석
- Chart.js 차트 포함 HTML 보고서 생성
- 인쇄/PDF 변환 최적화 스타일

### 실행
```bash
cd report-pipeline
node pipeline.js                    # 기본 데이터로 보고서 생성
node pipeline.js --open             # 생성 후 브라우저에서 열기
node pipeline.js --input mydata.csv # 커스텀 데이터 사용
```

---

## 공통 사항
- 모든 프로젝트는 외부 의존성 없이 Node.js 기본 모듈만 사용합니다.
- `npm install` 없이 바로 실행 가능합니다.
