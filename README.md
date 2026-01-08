# 🎬 유튜브 소재 발굴기

AI 기반 유튜브 콘텐츠 분석 도구로, 바이럴 가능성이 높은 영상을 발굴하고 새로운 콘텐츠 아이디어를 얻을 수 있습니다.

![유튜브 소재 발굴기](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ 주요 기능

### 1. 🔍 바이럴 영상 검색
- 키워드로 유튜브 영상 검색
- **바이럴 비율** (조회수 / 구독자수 × 100) 계산
- 숏폼/롱폼 필터링
- 바이럴 비율 범위 설정

### 2. 💬 AI 댓글 분석
- 영상 댓글 자동 수집 (최대 100개)
- **감정 분석**: 긍정/중립/부정 비율
- **키워드 추출**: 자주 언급된 키워드
- **관심사 파악**: 시청자 관심 주제 도출

### 3. 💡 소재 추천
- 댓글 분석 기반 **5개 추천 키워드**
- 각 키워드별 추천 이유 및 잠재력 점수

### 4. 📝 대본 목차 생성
- 선택한 키워드로 **자동 대본 목차 생성**
- 후킹, 본문, 마무리, CTA 포함
- 마크다운 복사/다운로드 지원

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 API 키를 설정하세요:

```env
# YouTube Data API Key
YOUTUBE_API_KEY=your_youtube_api_key_here

# GLM API Key (Z.AI)
GLM_API_KEY=your_glm_api_key_here
```

#### API 키 발급 방법

**YouTube Data API Key:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키"
4. YouTube Data API v3 활성화
5. 생성된 API 키를 `.env` 파일에 복사

**GLM API Key (Z.AI):**
1. [Z.AI Developer Platform](https://z.ai/) 접속
2. 계정 로그인 또는 회원가입
3. "API Keys" 메뉴에서 새 키 생성
4. 생성된 API 키를 `.env` 파일에 복사

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 📖 사용 방법

### Step 1: 키워드 검색
1. 찾고 싶은 콘텐츠 주제를 검색창에 입력
2. 필터 버튼(⚙️)을 클릭하여 옵션 설정
   - **콘텐츠 유형**: 전체/숏폼/롱폼
   - **바이럴 비율**: 원하는 범위 설정
3. "검색" 버튼 클릭

### Step 2: 영상 선택 및 분석
1. 검색 결과에서 분석할 영상 선택
2. "댓글 분석하기" 버튼 클릭
3. AI가 자동으로 댓글을 수집하고 분석

### Step 3: 소재 추천 확인
1. 분석 결과 확인 (감정 분석, 키워드, 관심사)
2. AI가 추천하는 5개 키워드 확인
3. 마음에 드는 키워드 선택

### Step 4: 대본 목차 생성
1. 선택한 키워드로 자동 대본 목차 생성
2. 복사 또는 마크다운 파일로 다운로드

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **API**: YouTube Data API v3
- **AI**: GLM-4.7 (Z.AI)
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── search/      # 영상 검색 API
│   │   ├── comments/    # 댓글 수집 API
│   │   ├── analyze/     # AI 댓글 분석 API
│   │   ├── recommend/   # 키워드 추천 API
│   │   └── script/      # 대본 생성 API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SearchBar.tsx    # 검색바 컴포넌트
│   ├── VideoCard.tsx    # 영상 카드 컴포넌트
│   ├── AnalysisResult.tsx # 분석 결과 컴포넌트
│   └── ScriptOutline.tsx  # 대본 목차 컴포넌트
└── types/
    └── index.ts         # TypeScript 타입 정의
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

Made with ❤️ for YouTube Creators
