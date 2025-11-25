// ✅ 1. .env 파일 로드 (모든 곳에서 접근 가능하도록 가장 상단에 위치)
require('dotenv').config(); // src/index.js에서 .env 파일은 상위 폴더에 있습니다.

// 2. 필요한 모듈 임포트
const express = require('express');
const cors = require('cors');
const path = require('path');

// ✅ 라우터 임포트 (각 기능별 라우터 파일)
const authRouter = require('./routes/authRoutes');      // 인증 (로그인/회원가입)
const userRouter = require('./routes/userRoutes');      // 사용자 프로필, 팔로우 등
const markerRouter = require('./routes/markerRoutes');  // 마커 CRUD, 좋아요, 댓글
const searchRouter = require('./routes/searchRoutes');  // 검색 기능

// 3. Express 애플리케이션 생성
const app = express();

// 4. 미들웨어 설정
// CORS 설정
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "*", // ✅ .env 파일에서 프론트엔드 주소 가져오기 (보안 권장)
    credentials: true
}));
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

// ✅ 5. 라우터 연결
app.use("/api/auth", authRouter);      // /api/auth 로 시작하는 요청은 authRouter가 처리
app.use("/api/users", userRouter);      // /api/users 로 시작하는 요청은 userRouter가 처리
app.use("/api/markers", markerRouter);  // /api/markers 로 시작하는 요청은 markerRouter가 처리
app.use("/api/search", searchRouter);   // /api/search 로 시작하는 요청은 searchRouter가 처리

// 6. 정적 파일 서비스 (업로드된 이미지 파일)
// ✅ 주의: 이 부분은 파일 저장 방식에 따라 달라집니다!
// 학원 코드의 uploads 폴더를 직접 서버에서 서비스하는 방식
app.use("/uploads", express.static(path.join(__dirname, '../uploads'))); // 'uploads' 폴더는 backend 폴더 안에 생성했다고 가정

// ✅ 하지만, 실제 운영에서는 클라우드 스토리지 (AWS S3 등) 사용을 강력히 권장합니다.
//    클라우드 스토리지에 저장된 이미지는 해당 스토리지의 URL을 통해 바로 접근 가능하므로
//    별도로 express.static으로 서비스할 필요가 없어집니다.
//    이 코드는 서버의 로컬 폴더에 이미지를 저장하고 서비스할 때만 필요합니다.

// 7. 서버 시작
const PORT = process.env.PORT || 3010; // ✅ .env 파일에서 PORT 가져오기 (기본값 3010)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});