// ✅ 1. .env 파일 로드 (모든 곳에서 접근 가능하도록 가장 상단에 위치)
require('dotenv').config(); // src/index.js에서 .env 파일은 상위 폴더에 있습니다.

// 2. 필요한 모듈 임포트
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // HTTP 서버 생성용
const { Server } = require('socket.io'); // Socket.io 서버

// ✅ 라우터 임포트 (각 기능별 라우터 파일)
const authRouter = require('./routes/authRoutes');      // 인증 (로그인/회원가입)
const userRouter = require('./routes/userRoutes');      // 사용자 프로필
const markerRouter = require('./routes/markerRoutes');  // 마커 CRUD
const searchRouter = require('./routes/searchRoutes');  // 검색 기능
const likeRouter = require('./routes/likeRoutes');      // 좋아요 기능
const commentRouter = require('./routes/commentRoutes'); // 댓글 기능
const followRouter = require('./routes/followRoutes');  // 팔로우 기능
const notificationRouter = require('./routes/notificationRoutes'); // 알림 기능
const feedRouter = require('./routes/feedRoutes');      // 피드 기능
const bookmarkRouter = require('./routes/bookmarkRoutes'); // 북마크 기능
const weatherRouter = require('./routes/weatherRoutes'); // 날씨 기능
const chatRouter = require('./routes/chatRoutes'); // 채팅 기능

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
app.use("/api/auth", authRouter);       // /api/auth 로 시작하는 요청은 authRouter가 처리
app.use("/api/users", userRouter);      // /api/users 로 시작하는 요청은 userRouter가 처리
app.use("/api/markers", markerRouter);  // /api/markers 로 시작하는 요청은 markerRouter가 처리
app.use("/api/search", searchRouter);   // /api/search 로 시작하는 요청은 searchRouter가 처리
app.use("/api/likes", likeRouter);      // /api/likes 로 시작하는 요청은 likeRouter가 처리
app.use("/api/comments", commentRouter); // /api/comments 로 시작하는 요청은 commentRouter가 처리
app.use("/api/follows", followRouter);  // /api/follows 로 시작하는 요청은 followRouter가 처리
app.use("/api/notifications", notificationRouter); // /api/notifications 로 시작하는 요청
app.use("/api/feed", feedRouter);       // /api/feed 로 시작하는 요청은 feedRouter가 처리
app.use("/api/bookmarks", bookmarkRouter); // /api/bookmarks 로 시작하는 요청
app.use("/api/weather", weatherRouter); // /api/weather 로 시작하는 요청
app.use("/api/chat", chatRouter); // /api/chat 로 시작하는 요청

// 6. 정적 파일 서비스 (업로드된 이미지 파일)
// ✅ 주의: 이 부분은 파일 저장 방식에 따라 달라집니다!
// 학원 코드의 uploads 폴더를 직접 서버에서 서비스하는 방식
app.use("/uploads", express.static(path.join(__dirname, '../uploads'))); // 'uploads' 폴더는 backend 폴더 안에 생성했다고 가정

// ✅ 하지만, 실제 운영에서는 클라우드 스토리지 (AWS S3 등) 사용을 강력히 권장합니다.
//    클라우드 스토리지에 저장된 이미지는 해당 스토리지의 URL을 통해 바로 접근 가능하므로
//    별도로 express.static으로 서비스할 필요가 없어집니다.
//    이 코드는 서버의 로컬 폴더에 이미지를 저장하고 서비스할 때만 필요합니다.

// 7. HTTP 서버 생성 (Socket.io를 사용하기 위해)
const PORT = process.env.PORT || 3010; // ✅ .env 파일에서 PORT 가져오기 (기본값 3010)
const server = http.createServer(app); // Express 앱을 HTTP 서버로 변환

// 8. Socket.io 서버 설정
/**
 * Socket.io 서버 초기화
 * 
 * CORS 설정:
 * - origin: 프론트엔드 주소 허용
 * - credentials: 쿠키/인증 정보 전송 허용
 * - methods: 허용할 HTTP 메서드
 */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// 9. Socket.io 연결 및 채팅 이벤트 처리
/**
 * Socket.io 연결 관리 및 채팅 이벤트 처리
 * 
 * 작동 흐름:
 * 1. 클라이언트가 Socket.io 서버에 연결
 * 2. 클라이언트가 인증 토큰과 함께 'authenticate' 이벤트 전송
 * 3. 서버가 토큰을 검증하고 사용자 정보를 socket에 저장
 * 4. 클라이언트가 'join-room' 이벤트로 채팅방에 입장
 * 5. 클라이언트가 'send-message' 이벤트로 메시지 전송
 * 6. 서버가 메시지를 데이터베이스에 저장하고 상대방에게 전송
 */
const { verifyToken } = require('./config/jwt');
const pool = require('./config/database');

// 연결된 사용자들을 저장하는 맵
// key: socket.id, value: { userId, username, roomId }
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] 클라이언트 연결: ${socket.id}`);

  /**
   * 인증 이벤트 처리
   * 
   * 클라이언트가 연결되면 먼저 인증 토큰을 전송해야 합니다.
   * 토큰이 유효하면 사용자 정보를 socket에 저장합니다.
   */
  socket.on('authenticate', async (data) => {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('error', { message: '인증 토큰이 필요합니다.' });
        return;
      }

      // 토큰 검증
      const decoded = verifyToken(token);
      
      // 사용자 정보 조회
      const [users] = await pool.query(
        'SELECT USER_ID, USERNAME FROM LM_USERS WHERE USER_ID = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        socket.emit('error', { message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      const user = users[0];
      
      // socket에 사용자 정보 저장
      socket.userId = user.USER_ID;
      socket.username = user.USERNAME;
      
      // 연결된 사용자 맵에 추가
      connectedUsers.set(socket.id, {
        userId: user.USER_ID,
        username: user.USERNAME,
        roomId: null,
      });

      console.log(`[Socket.io] 사용자 인증 완료: ${user.USER_ID} (${socket.id})`);
      
      // 인증 성공 이벤트 전송
      socket.emit('authenticated', {
        userId: user.USER_ID,
        username: user.USERNAME,
      });

    } catch (error) {
      console.error('[Socket.io] 인증 오류:', error);
      socket.emit('error', { message: '인증에 실패했습니다.' });
    }
  });

  /**
   * 채팅방 입장 이벤트 처리
   * 
   * 클라이언트가 특정 채팅방에 입장할 때 실행됩니다.
   * 같은 채팅방에 있는 사용자들끼리만 메시지를 주고받을 수 있도록
   * Socket.io의 room 기능을 사용합니다.
   */
  socket.on('join-room', async (data) => {
    try {
      const { roomId } = data;

      if (!socket.userId) {
        socket.emit('error', { message: '먼저 인증해주세요.' });
        return;
      }

      if (!roomId) {
        socket.emit('error', { message: '채팅방 ID가 필요합니다.' });
        return;
      }

      // 채팅방 존재 및 권한 확인
      const [rooms] = await pool.query(
        'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)',
        [roomId, socket.userId, socket.userId]
      );

      if (rooms.length === 0) {
        socket.emit('error', { message: '채팅방을 찾을 수 없거나 접근 권한이 없습니다.' });
        return;
      }

      // 이전 방에서 나가기
      if (socket.roomId) {
        socket.leave(`room-${socket.roomId}`);
      }

      // 새 방에 입장
      socket.roomId = roomId;
      socket.join(`room-${roomId}`);
      
      // 연결된 사용자 맵 업데이트
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        userInfo.roomId = roomId;
      }

      console.log(`[Socket.io] 사용자 ${socket.userId}가 채팅방 ${roomId}에 입장 (${socket.id})`);

      // 입장 성공 이벤트 전송
      socket.emit('joined-room', { roomId });

    } catch (error) {
      console.error('[Socket.io] 채팅방 입장 오류:', error);
      socket.emit('error', { message: '채팅방 입장에 실패했습니다.' });
    }
  });

  /**
   * 메시지 전송 이벤트 처리
   * 
   * 클라이언트가 메시지를 전송할 때 실행됩니다.
   * 메시지를 데이터베이스에 저장하고, 같은 채팅방에 있는 모든 사용자에게 전송합니다.
   */
  socket.on('send-message', async (data) => {
    try {
      const { roomId, message } = data;

      if (!socket.userId) {
        socket.emit('error', { message: '먼저 인증해주세요.' });
        return;
      }

      if (!roomId || !message || message.trim() === '') {
        socket.emit('error', { message: '채팅방 ID와 메시지 내용이 필요합니다.' });
        return;
      }

      // 채팅방 존재 및 권한 확인
      const [rooms] = await pool.query(
        'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)',
        [roomId, socket.userId, socket.userId]
      );

      if (rooms.length === 0) {
        socket.emit('error', { message: '채팅방을 찾을 수 없거나 접근 권한이 없습니다.' });
        return;
      }

      // 메시지를 데이터베이스에 저장
      const [result] = await pool.query(
        'INSERT INTO LM_CHAT_MESSAGES (ROOM_ID, SENDER_ID, MESSAGE) VALUES (?, ?, ?)',
        [roomId, socket.userId, message.trim()]
      );

      // 채팅방 정보 업데이트 (마지막 메시지)
      await pool.query(
        `UPDATE LM_CHAT_ROOMS 
         SET LAST_MESSAGE = ?, LAST_MESSAGE_TIME = NOW() 
         WHERE ROOM_ID = ?`,
        [message.trim().substring(0, 100), roomId]
      );

      // 저장된 메시지 정보 조회
      const [messages] = await pool.query(
        'SELECT * FROM LM_CHAT_MESSAGES WHERE MESSAGE_ID = ?',
        [result.insertId]
      );

      const savedMessage = {
        messageId: messages[0].MESSAGE_ID,
        roomId: messages[0].ROOM_ID,
        senderId: messages[0].SENDER_ID,
        message: messages[0].MESSAGE,
        createdAt: messages[0].CREATED_AT,
        isRead: messages[0].IS_READ === 1,
      };

      console.log(`[Socket.io] 메시지 전송: ${socket.userId} -> 채팅방 ${roomId}`);

      // 같은 채팅방에 있는 모든 사용자에게 메시지 전송
      io.to(`room-${roomId}`).emit('new-message', savedMessage);

    } catch (error) {
      console.error('[Socket.io] 메시지 전송 오류:', error);
      socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
    }
  });

  /**
   * 메시지 읽음 처리 이벤트
   * 
   * 클라이언트가 메시지를 읽었을 때 실행됩니다.
   * 상대방이 보낸 읽지 않은 메시지들을 읽음 처리합니다.
   */
  socket.on('mark-messages-read', async (data) => {
    try {
      const { roomId } = data;

      if (!socket.userId || !roomId) return;

      // 읽지 않은 메시지들을 읽음 처리
      await pool.query(
        `UPDATE LM_CHAT_MESSAGES 
         SET IS_READ = 1 
         WHERE ROOM_ID = ? AND SENDER_ID != ? AND IS_READ = 0`,
        [roomId, socket.userId]
      );

      // 상대방에게 읽음 처리 알림 (선택사항)
      socket.to(`room-${roomId}`).emit('messages-read', { roomId, userId: socket.userId });

    } catch (error) {
      console.error('[Socket.io] 메시지 읽음 처리 오류:', error);
    }
  });

  /**
   * 연결 해제 이벤트 처리
   * 
   * 클라이언트가 연결을 끊을 때 실행됩니다.
   * 연결된 사용자 맵에서 제거합니다.
   */
  socket.on('disconnect', () => {
    console.log(`[Socket.io] 클라이언트 연결 해제: ${socket.id}`);
    
    // 연결된 사용자 맵에서 제거
    connectedUsers.delete(socket.id);
  });
});

// 10. 서버 시작
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
    console.log(`Socket.io server ready!`);
});