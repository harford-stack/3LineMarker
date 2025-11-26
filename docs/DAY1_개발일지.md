# 📋 3-LINE MARKER 개발일지 - DAY 1

## 📅 작업일: 2025년 11월 24일 (일)

## 🎯 주제: 프로젝트 기획 및 백엔드 인증 시스템 구축

---

## 🏆 핵심 성과

| 구분            | 내용                                          |
| --------------- | --------------------------------------------- |
| 프로젝트 기획   | 3-Line Marker SNS 컨셉 및 MVP 기능 정의       |
| DB 설계         | MySQL 5개 테이블 스키마 설계 (외래 키 미사용) |
| 백엔드 세팅     | Node.js + Express 프로젝트 초기화             |
| 인증 시스템     | bcrypt 비밀번호 해싱, JWT 토큰 발급           |
| 프론트엔드 세팅 | React + Redux Toolkit 프로젝트 초기화         |

---

## 📍 프로젝트 개요

### 3-Line Marker란?

- 지도 위에 나만의 **3줄 코멘트**를 남기는 위치 기반 SNS
- 특정 장소에 발자취를 찍고, 다른 사용자들과 소통
- 좋아요, 댓글, 팔로우를 통한 커뮤니티 형성

### MVP 핵심 기능

1. 🚪 로그인/회원가입
2. 📌 좌표 마커 생성 (3줄 코멘트 + 사진)
3. 🗺️ 지도에서 마커 조회
4. 💬 댓글 기능
5. 🤝 팔로우/팔로워
6. ❤️ 좋아요 기능
7. 🔍 검색 기능

---

## 📊 데이터베이스 설계

### LM_USERS (사용자 테이블)

```sql
CREATE TABLE LM_USERS (
    USER_ID VARCHAR(50) PRIMARY KEY COMMENT '사용자 고유 아이디',
    PASSWORD VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    USERNAME VARCHAR(100) NOT NULL COMMENT '닉네임',
    PROFILE_IMAGE_URL VARCHAR(2048) DEFAULT 'default_profile.png',
    STATUS_MESSAGE VARCHAR(200) DEFAULT '',
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### LM_MARKERS (마커 테이블)

```sql
CREATE TABLE LM_MARKERS (
    MARKER_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID VARCHAR(50) NOT NULL,
    LATITUDE DECIMAL(10, 8) NOT NULL,
    LONGITUDE DECIMAL(11, 8) NOT NULL,
    LINE1 TEXT NOT NULL COMMENT '3줄 글 첫째 줄',
    LINE2 TEXT COMMENT '3줄 글 둘째 줄',
    LINE3 TEXT COMMENT '3줄 글 셋째 줄',
    IMAGE_URL VARCHAR(2048) DEFAULT NULL,
    LIKE_COUNT INT DEFAULT 0,
    COMMENT_COUNT INT DEFAULT 0,
    IS_PUBLIC BOOLEAN DEFAULT TRUE,
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### LM_FOLLOWS, LM_COMMENTS, LM_LIKES

- 팔로우 관계, 댓글, 좋아요를 저장하는 테이블 설계 완료
- 외래 키 제약 조건 미사용 (백업/복원 유연성 확보)

---

## 💻 백엔드 구현 내용

### 1. 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js     # MySQL 연결 설정
│   │   └── jwt.js          # JWT 설정
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   └── passwordUtils.js
│   └── index.js
├── .env
└── package.json
```

### 2. 비밀번호 해싱 (`passwordUtils.js`)

```javascript
const bcrypt = require("bcrypt");

exports.hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

exports.comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
```

### 3. 인증 컨트롤러 (`authController.js`)

```javascript
// 회원가입
exports.register = async (req, res) => {
  const { userId, password, username } = req.body;

  // 중복 체크
  const [existing] = await pool.query(
    "SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?",
    [userId]
  );
  if (existing.length > 0) {
    return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
  }

  // 비밀번호 해싱 후 저장
  const hashedPassword = await hashPassword(password);
  await pool.query(
    "INSERT INTO LM_USERS (USER_ID, PASSWORD, USERNAME) VALUES (?, ?, ?)",
    [userId, hashedPassword, username]
  );

  res.status(201).json({ message: "회원가입 성공!" });
};

// 로그인
exports.login = async (req, res) => {
  const { userId, password } = req.body;

  const [users] = await pool.query("SELECT * FROM LM_USERS WHERE USER_ID = ?", [
    userId,
  ]);

  if (
    users.length === 0 ||
    !(await comparePassword(password, users[0].PASSWORD))
  ) {
    return res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  // JWT 토큰 발급
  const token = jwt.sign({ id: users[0].USER_ID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({
    message: "로그인 성공!",
    token,
    user: { userId: users[0].USER_ID, username: users[0].USERNAME },
  });
};
```

### 4. 환경 변수 설정 (`.env`)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=****
DB_DATABASE=3linemarker

JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

FRONTEND_ORIGIN=http://localhost:3000
PORT=3010
```

---

## ⚛️ 프론트엔드 구현 내용

### 1. Redux Toolkit 설정

#### Store 구성 (`app/store.js`)

```javascript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

#### Auth Slice (`features/auth/authSlice.js`)

```javascript
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("authToken", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    },
    loadUserFromLocalStorage: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  loadUserFromLocalStorage,
} = authSlice.actions;
export default authSlice.reducer;
```

---

## 🐛 해결한 주요 에러

### 에러 1: `Module not found: Can't resolve 'react-redux'`

**원인:** 필요한 라이브러리 미설치  
**해결:**

```bash
npm install @reduxjs/toolkit react-redux react-router-dom
```

### 에러 2: `Cannot find module 'bcrypt'`

**원인:** 백엔드에 bcrypt 미설치  
**해결:**

```bash
cd backend
npm install bcrypt jsonwebtoken mysql2
```

### 에러 3: `.env` 파일 로드 실패

**원인:** `dotenv.config()` 경로 문제  
**해결:**

```javascript
// backend/src/config/database.js
require("dotenv").config({ path: "../../.env" });
```

### 에러 4: JSON 파싱 에러 (Thunder Client)

```
SyntaxError: Unexpected token '"', ""userId" :"... is not valid JSON
```

**원인:** API 테스트 시 잘못된 JSON 형식  
**해결:** Thunder Client에서 Body 탭 → JSON 선택 후 정확한 문법 사용

---

## 📁 생성된 파일 목록

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   └── passwordUtils.js
│   └── index.js
├── .env
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   └── store.js
│   ├── features/auth/
│   │   └── authSlice.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── App.js
└── package.json
```

---

## 📝 내일 할 일

- [ ] 로그인/회원가입 UI 완성
- [ ] 프론트엔드-백엔드 완벽 연동
- [ ] 로그아웃 기능 구현
- [ ] Material-UI 도입

---

## 💡 오늘의 회고

프로젝트의 기반이 되는 인증 시스템을 구축했다. bcrypt와 JWT를 활용한 보안 인증 플로우를 이해하게 되었고, Redux Toolkit의 slice 패턴으로 상태 관리를 체계적으로 구성했다. 환경 변수 관리와 dotenv 경로 설정의 중요성도 배웠다.
