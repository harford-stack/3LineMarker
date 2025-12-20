# DAY 1 개발일지 - 프로젝트 초기 설정 및 기본 구조

**날짜**: 2025년 11월 25일  
**목표**: 프로젝트 환경 구축 및 기본 인증 시스템 구현

---

## 📋 오늘의 목표

1. React 프로젝트 초기화 및 기본 구조 설정
2. Node.js/Express 백엔드 서버 구축
3. MySQL 데이터베이스 설계 및 테이블 생성
4. 사용자 인증 시스템 구현 (회원가입, 로그인)
5. JWT 토큰 기반 인증 미들웨어 구현
6. Redux Toolkit을 활용한 전역 상태 관리 설정
7. React Router를 통한 페이지 라우팅 설정

---

## ✅ 완료 작업

### 1. 프로젝트 초기화

#### Frontend 설정
- **Create React App**을 사용하여 React 프로젝트 초기화
- 필요한 패키지 설치:
  - `react`, `react-dom` (v19.2.0)
  - `@mui/material`, `@mui/icons-material` (v7.3.5)
  - `@reduxjs/toolkit`, `react-redux` (v2.11.0)
  - `react-router-dom` (v7.9.6)
  - `@emotion/react`, `@emotion/styled` (스타일링)

#### Backend 설정
- Node.js 프로젝트 초기화
- 필요한 패키지 설치:
  - `express` (v5.1.0)
  - `mysql2` (v3.15.3)
  - `jsonwebtoken` (v9.0.2)
  - `bcrypt` (v6.0.0)
  - `dotenv` (v17.2.3)
  - `cors` (v2.8.5)
  - `nodemon` (개발용)

### 2. 데이터베이스 설계

#### 테이블 구조
1. **LM_USERS** (사용자 테이블)
   - USER_ID (VARCHAR, PK)
   - PASSWORD (VARCHAR)
   - USERNAME (VARCHAR)
   - EMAIL (VARCHAR)
   - CREATED_AT (DATETIME)
   - UPDATED_AT (DATETIME)

2. **LM_MARKERS** (마커 테이블)
   - MARKER_ID (INT, PK, AUTO_INCREMENT)
   - USER_ID (VARCHAR, FK)
   - LINE1, LINE2, LINE3 (TEXT)
   - LATITUDE, LONGITUDE (DECIMAL)
   - CATEGORY (ENUM)
   - IMAGE_URL (VARCHAR)
   - CREATED_AT, UPDATED_AT (DATETIME)

3. **기본 인덱스 설정**
   - 사용자 검색을 위한 인덱스
   - 마커 위치 검색을 위한 인덱스

### 3. 백엔드 서버 구축

#### Express 서버 설정
- 기본 Express 앱 생성
- CORS 미들웨어 설정
- JSON 파싱 미들웨어 설정
- 환경 변수 관리 (.env 파일)

#### 라우터 구조
- `/api/auth` - 인증 관련 라우터
- 기본 에러 핸들링 미들웨어

#### 데이터베이스 연결
- MySQL2 Promise 기반 연결 풀 설정
- 연결 테스트 및 에러 처리

### 4. 사용자 인증 시스템 구현

#### 회원가입 기능
- **엔드포인트**: `POST /api/auth/register`
- **기능**:
  - 아이디, 비밀번호, 닉네임, 이메일 입력 검증
  - 비밀번호 해싱 (bcrypt, saltRounds: 10)
  - 아이디 중복 체크
  - 사용자 정보 데이터베이스 저장

#### 로그인 기능
- **엔드포인트**: `POST /api/auth/login`
- **기능**:
  - 아이디/비밀번호 검증
  - JWT 토큰 생성 (만료 시간: 7일)
  - 사용자 정보 반환 (비밀번호 제외)

#### JWT 토큰 관리
- 토큰 생성 함수 (`generateToken`)
- 토큰 검증 함수 (`verifyToken`)
- 환경 변수로 JWT_SECRET 관리

### 5. 인증 미들웨어 구현

#### protect 미들웨어
- 요청 헤더에서 토큰 추출
- JWT 토큰 검증
- 사용자 정보 데이터베이스에서 조회
- `req.user`에 사용자 정보 저장

#### optionalProtect 미들웨어
- 토큰이 없어도 통과 (선택적 인증)
- 토큰이 있으면 사용자 정보 저장

### 6. Frontend 인증 시스템

#### Redux Toolkit 설정
- `authSlice` 생성
- 상태: `user`, `token`, `isAuthenticated`
- 액션: `login`, `logout`, `loadUserFromLocalStorage`

#### 로그인 페이지 구현
- Material-UI 컴포넌트 사용
- 레트로 테마 적용 (네온 색상, 픽셀 폰트)
- 폼 검증
- API 호출 및 Redux 상태 업데이트
- 에러 메시지 표시

#### 회원가입 페이지 구현
- 아이디, 비밀번호, 닉네임, 이메일 입력
- 비밀번호 확인
- 아이디 중복 체크 버튼 (추후 구현 예정)
- 회원가입 API 호출
- 성공 시 로그인 페이지로 리다이렉트

#### React Router 설정
- 기본 라우트 설정:
  - `/login` - 로그인 페이지
  - `/register` - 회원가입 페이지
  - `/` - 메인 페이지 (추후 지도 페이지로 변경)

### 7. localStorage 연동

#### 토큰 저장
- 로그인 성공 시 토큰과 사용자 정보를 localStorage에 저장
- `authToken`, `user` 키로 저장

#### 토큰 복원
- 앱 시작 시 (`index.js`) localStorage에서 토큰과 사용자 정보 읽기
- Redux Store에 복원
- 토큰이 유효하면 자동 로그인 상태 유지

---

## 🛠 기술 스택 선정

### Frontend
- **React 19.2.0**: 최신 React 버전 사용
- **Material-UI 7.3.5**: UI 컴포넌트 라이브러리
- **Redux Toolkit 2.11.0**: 전역 상태 관리 (간단한 API)
- **React Router 7.9.6**: 페이지 라우팅

### Backend
- **Node.js**: 서버 런타임
- **Express 5.1.0**: 웹 프레임워크
- **MySQL 3.15.3**: 관계형 데이터베이스
- **JWT 9.0.2**: 인증 토큰
- **bcrypt 6.0.0**: 비밀번호 해싱

---

## 🐛 주요 이슈 및 해결

### 이슈 1: CORS 설정 문제
**문제**:  
- 프론트엔드에서 백엔드 API 호출 시 CORS 에러 발생
- `Access-Control-Allow-Origin` 헤더 누락

**해결 과정**:
1. `cors` 패키지 설치
2. Express 앱에 CORS 미들웨어 추가
3. `.env` 파일에 `FRONTEND_ORIGIN` 설정
4. 개발 환경에서는 `*` 허용, 프로덕션에서는 특정 도메인만 허용

**코드**:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
    credentials: true
}));
```

### 이슈 2: JWT 토큰 만료 처리
**문제**:  
- 토큰이 만료되어도 프론트엔드에서 자동 로그아웃이 안 됨
- localStorage에 저장된 토큰이 계속 사용됨

**해결 과정**:
1. `index.js`에서 토큰 복원 시 검증 로직 추가
2. 토큰이 없거나 파싱 실패 시 자동 로그아웃
3. Redux `logout` 액션으로 상태 초기화

**코드**:
```javascript
try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
        const user = JSON.parse(userStr);
        store.dispatch(loadUserFromLocalStorage({ token, user }));
    }
} catch (error) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    store.dispatch(logout());
}
```

### 이슈 3: 환경 변수 관리
**문제**:  
- 하드코딩된 값들 (포트, 데이터베이스 정보 등)
- 보안 문제 (비밀번호, API 키 노출)

**해결 과정**:
1. `.env` 파일 생성
2. `dotenv` 패키지로 환경 변수 로드
3. `.gitignore`에 `.env` 추가
4. `.env.example` 파일 생성 (템플릿)

---

## 📝 코드 구조

### Backend 구조
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # 데이터베이스 연결 설정
│   │   └── jwt.js           # JWT 토큰 생성/검증
│   ├── controllers/
│   │   └── authController.js # 인증 컨트롤러
│   ├── middlewares/
│   │   └── authMiddleware.js # 인증 미들웨어
│   ├── routes/
│   │   └── authRoutes.js    # 인증 라우터
│   └── index.js             # 서버 진입점
├── migrations/              # 데이터베이스 마이그레이션
└── .env                     # 환경 변수
```

### Frontend 구조
```
frontend/
├── src/
│   ├── app/
│   │   └── store.js         # Redux Store 설정
│   ├── features/
│   │   └── auth/
│   │       └── authSlice.js # 인증 Redux Slice
│   ├── pages/
│   │   ├── LoginPage.jsx    # 로그인 페이지
│   │   └── RegisterPage.jsx # 회원가입 페이지
│   ├── App.js               # 루트 컴포넌트
│   └── index.js             # 진입점
└── .env                     # 환경 변수
```

---

## 💡 배운 점

1. **환경 변수 관리의 중요성**
   - `.env` 파일을 통한 보안 관리
   - 개발/프로덕션 환경 분리

2. **JWT 토큰 기반 인증**
   - 토큰 생성 및 검증 과정
   - 토큰 만료 처리 방법

3. **Redux Toolkit의 간편함**
   - `createSlice`를 통한 간단한 상태 관리
   - 비동기 액션 처리 방법

4. **CORS 설정**
   - 프론트엔드와 백엔드 간 통신을 위한 CORS 설정
   - 개발/프로덕션 환경별 설정

---

## 📊 작업 통계

- **작성한 파일 수**: 약 15개
- **코드 라인 수**: 약 1,500줄
- **구현한 API 엔드포인트**: 2개 (회원가입, 로그인)
- **생성한 데이터베이스 테이블**: 2개 (USERS, MARKERS)

---

## 🎯 내일 계획

1. Leaflet 지도 라이브러리 통합
2. 지도 페이지 UI 구현
3. 마커 생성 기능 구현
4. 마커 목록 조회 기능 구현
5. 레트로 테마 적용

---

## 📸 참고 자료

- [React 공식 문서](https://react.dev/)
- [Redux Toolkit 공식 문서](https://redux-toolkit.js.org/)
- [Express 공식 문서](https://expressjs.com/)
- [JWT 공식 문서](https://jwt.io/)

---
