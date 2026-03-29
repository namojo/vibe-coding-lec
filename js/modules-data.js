/* ============================================
   모듈 콘텐츠 데이터
   ============================================ */

const MODULES_DATA = [
  {
    id: 1,
    number: "Module 01",
    title: "Vibe Coding이란 무엇인가?",
    description: "Vibe Coding의 개념, AI 코딩 도구 3종(Claude, Antigravity, Gemini)의 특성과 차이점, 효과적인 프롬프트 작성법 기초",
    difficulty: "beginner",
    difficultyLabel: "초급",
    tools: ["claude", "antigravity", "gemini"],
    track: "공통",
    duration: "30분",
    wow: "",
    cases: [],
    page: "pages/module-01.html"
  },
  {
    id: 2,
    number: "Module 02",
    title: "첫 번째 성공 경험 — 나만의 웹페이지 만들기",
    description: "AI와 대화만으로 나만의 웹페이지를 처음부터 완성까지 만들어 본다. 비개발자도 10분 안에 결과물을 확인할 수 있는 WOW 경험 제공",
    difficulty: "beginner",
    difficultyLabel: "초급",
    tools: ["claude", "antigravity"],
    track: "공통",
    duration: "50분",
    wow: "코드를 한 줄도 안 썼는데 진짜 웹페이지가 나온다!",
    cases: [
      { id: "2-1", title: "나만의 포트폴리오 웹페이지 만들기", tool: "claude", difficulty: "beginner", difficultyLabel: "초급", track: "공통" },
      { id: "2-2", title: "팀 소개 페이지 만들기", tool: "antigravity", difficulty: "beginner", difficultyLabel: "초급", track: "공통" }
    ],
    page: "pages/module-02.html"
  },
  {
    id: 3,
    number: "Module 03",
    title: "문서 자동화 — 회의록부터 보고서까지",
    description: "매일 반복하는 문서 작업을 AI로 자동화한다. 회의록 정리, 정책 브리핑 생성 등 NIA 업무에 바로 적용 가능한 사례",
    difficulty: "beginner",
    difficultyLabel: "초급",
    tools: ["claude", "gemini"],
    track: "공통",
    duration: "60분",
    wow: "30분 걸리던 회의록 정리가 1분이면 끝난다",
    cases: [
      { id: "3-1", title: "AI로 회의록 자동 정리기 만들기", tool: "claude", difficulty: "beginner", difficultyLabel: "초급", track: "공통" },
      { id: "3-2", title: "정책 브리핑 자동 생성기", tool: "gemini", difficulty: "beginner", difficultyLabel: "초급", track: "공통" },
      { id: "3-3", title: "다국어 문서 번역 도우미", tool: "gemini", difficulty: "beginner", difficultyLabel: "초급", track: "공통" }
    ],
    page: "pages/module-03.html"
  },
  {
    id: 4,
    number: "Module 04",
    title: "데이터를 눈에 보이게 — 시각화와 분석",
    description: "CSV, 엑셀 데이터를 차트와 대시보드로 변환한다. 숫자 나열 대신 한눈에 파악 가능한 시각적 결과물 생성",
    difficulty: "beginner",
    difficultyLabel: "초급~중급",
    tools: ["claude", "gemini"],
    track: "공통",
    duration: "50분",
    wow: "엑셀 파일 하나 던졌더니 인터랙티브 차트가 나온다",
    cases: [
      { id: "4-1", title: "CSV 데이터를 차트로 시각화하기", tool: "claude", difficulty: "beginner", difficultyLabel: "초급", track: "공통" },
      { id: "4-2", title: "설문조사 결과 자동 분석기", tool: "gemini", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" }
    ],
    page: "pages/module-04.html"
  },
  {
    id: 5,
    number: "Module 05",
    title: "업무 자동화 — 반복 작업에서 해방",
    description: "이메일 분류, 일정 관리 등 반복적인 업무를 AI가 생성한 스크립트로 자동화한다",
    difficulty: "beginner",
    difficultyLabel: "초급~중급",
    tools: ["gemini", "claude"],
    track: "공통",
    duration: "50분",
    wow: "매일 하던 이메일 정리를 AI가 대신 해준다",
    cases: [
      { id: "5-1", title: "이메일 자동 분류/요약 도우미", tool: "gemini", difficulty: "beginner", difficultyLabel: "초급", track: "공통" },
      { id: "5-2", title: "일정 관리 자동화 스크립트", tool: "claude", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" }
    ],
    page: "pages/module-05.html"
  },
  {
    id: 6,
    number: "Module 06",
    title: "인터랙티브 웹앱 만들기",
    description: "단순 웹페이지를 넘어, 사용자 입력을 받고 결과를 보여주는 웹앱을 만든다. 계산기, 변환기, 프레젠테이션 등",
    difficulty: "intermediate",
    difficultyLabel: "중급",
    tools: ["gemini", "claude"],
    track: "공통",
    duration: "60분",
    wow: "PPT 없이 AI로 인터랙티브 프레젠테이션을 만들었다",
    cases: [
      { id: "6-1", title: "간단한 계산기/변환기 웹앱", tool: "gemini", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" },
      { id: "6-2", title: "인터랙티브 프레젠테이션 만들기", tool: "claude", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" },
      { id: "6-3", title: "엑셀 데이터를 보고서로 변환하기", tool: "claude", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" }
    ],
    page: "pages/module-06.html"
  },
  {
    id: 7,
    number: "Module 07",
    title: "외부 서비스 연동 — Google Sheets와 공공데이터",
    description: "외부 API와 서비스를 연동하여 실시간 데이터를 활용하는 도구를 만든다. Google Sheets 자동화, 공공데이터 API 활용",
    difficulty: "intermediate",
    difficultyLabel: "중급",
    tools: ["gemini", "antigravity"],
    track: "공통 + 개발자",
    duration: "50분",
    wow: "공공데이터 포털의 데이터가 실시간 대시보드로 변한다",
    cases: [
      { id: "7-1", title: "Google Sheets 연동 자동화", tool: "gemini", difficulty: "intermediate", difficultyLabel: "중급", track: "공통" },
      { id: "7-2", title: "공공데이터 API로 대시보드 만들기", tool: "antigravity", difficulty: "intermediate", difficultyLabel: "중급", track: "개발자" }
    ],
    page: "pages/module-07.html"
  },
  {
    id: 8,
    number: "Module 08",
    title: "개발자를 위한 심화 — 본격 개발 도구 활용",
    description: "CLI 기반 코딩(Claude Code), 파일 자동화, API 서버 구축 등 개발자가 AI를 실무 개발에 통합하는 방법",
    difficulty: "intermediate",
    difficultyLabel: "중급~고급",
    tools: ["claude", "antigravity"],
    track: "개발자",
    duration: "60분",
    wow: "터미널에서 AI와 대화하면서 코딩하는 새로운 개발 경험",
    cases: [
      { id: "8-1", title: "파일 정리 자동화 도구", tool: "claude", difficulty: "intermediate", difficultyLabel: "중급", track: "개발자" },
      { id: "8-2", title: "Slack/Teams 알림봇 만들기", tool: "claude", difficulty: "intermediate", difficultyLabel: "중급", track: "개발자" },
      { id: "8-3", title: "반복 보고 자동화 파이프라인", tool: "antigravity", difficulty: "advanced", difficultyLabel: "고급", track: "개발자" }
    ],
    page: "pages/module-08.html"
  },
  {
    id: 9,
    number: "Module 09",
    title: "풀스택 프로젝트 — AI로 서비스 만들기",
    description: "앞서 배운 기술을 종합하여 실제 서비스 수준의 프로젝트를 만든다. 관리 대시보드, 챗봇, 실시간 모니터링 등",
    difficulty: "advanced",
    difficultyLabel: "고급",
    tools: ["claude"],
    track: "개발자",
    duration: "60분",
    wow: "AI와 대화만으로 풀스택 웹 서비스를 완성했다",
    cases: [
      { id: "9-1", title: "React 기반 관리 대시보드", tool: "claude", difficulty: "advanced", difficultyLabel: "고급", track: "개발자" },
      { id: "9-2", title: "챗봇 프로토타입 만들기", tool: "claude", difficulty: "advanced", difficultyLabel: "고급", track: "개발자" },
      { id: "9-3", title: "실시간 통계 모니터링 페이지", tool: "claude", difficulty: "advanced", difficultyLabel: "고급", track: "개발자" }
    ],
    page: "pages/module-09.html"
  }
];

const TOOL_LABELS = {
  claude: "Claude",
  antigravity: "Antigravity",
  gemini: "Gemini"
};
