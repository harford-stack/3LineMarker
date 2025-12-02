# DAY 6 개발일지 - 실시간 채팅 시스템 구현

**날짜**: 2025년 11월 30일  
**목표**: WebSocket을 활용한 실시간 채팅 기능 구현

---

## 📋 오늘의 목표

1. Socket.io 서버 설정
2. Socket.io 클라이언트 통합
3. 일대일 채팅 기능 구현
4. 채팅방 목록 조회
5. 실시간 메시지 전송 및 수신
6. 메시지 읽음 처리
7. 채팅 알림 시스템
8. 채팅방 나가기 기능

---

## ✅ 완료 작업

### 1. Socket.io 서버 설정

#### 서버 구성
- HTTP 서버 생성 (`http.createServer`)
- Socket.io 서버 생성 (`new Server(httpServer)`)
- CORS 설정 (프론트엔드 주소 허용)

#### 연결 이벤트 처리
- `connection` 이벤트: 클라이언트 연결
- `authenticate` 이벤트: JWT 토큰 인증
- `disconnect` 이벤트: 연결 해제

#### 인증 처리
- JWT 토큰 검증
- 사용자 정보 조회
- 소켓에 사용자 정보 저장

**코드 구조**:
```javascript
io.on('connection', (socket) => {
    socket.on('authenticate', async (token) => {
        try {
            const decoded = verifyToken(token);
            const user = await getUserById(decoded.user_id);
            socket.userId = user.user_id;
            socket.authenticated = true;
            socket.emit('authenticated', { success: true });
        } catch (error) {
            socket.emit('authenticated', { success: false, error: error.message });
        }
    });
});
```

### 2. Socket.io 클라이언트 통합

#### 클라이언트 설정
- `socket.io-client` 패키지 설치
- 서버 주소 연결
- 인증 토큰 전송

#### 연결 상태 관리
- 연결 상태 표시 (연결됨/연결 안 됨)
- 재연결 로직
- 에러 처리

**코드 구조**:
```javascript
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_BASE_URL, {
    transports: ['websocket'],
    autoConnect: false
});

useEffect(() => {
    if (token) {
        socket.connect();
        socket.on('connect', () => {
            socket.emit('authenticate', token);
        });
    }
    
    return () => {
        socket.disconnect();
    };
}, [token]);
```

### 3. 일대일 채팅 기능 구현

#### 데이터베이스 설계
- **LM_CHAT_ROOMS** 테이블
  - ROOM_ID (INT, PK, AUTO_INCREMENT)
  - USER1_ID (VARCHAR, FK) - 첫 번째 사용자
  - USER2_ID (VARCHAR, FK) - 두 번째 사용자
  - CREATED_AT (DATETIME)
  - UPDATED_AT (DATETIME)
  - UNIQUE KEY (USER1_ID, USER2_ID) - 중복 방지

- **LM_CHAT_MESSAGES** 테이블
  - MESSAGE_ID (INT, PK, AUTO_INCREMENT)
  - ROOM_ID (INT, FK)
  - SENDER_ID (VARCHAR, FK)
  - MESSAGE (TEXT)
  - CREATED_AT (DATETIME)
  - IS_READ (TINYINT) - 읽음 여부

#### 채팅방 생성/조회
- **API**: `GET /api/chat/room?otherUserId=...`
- 두 사용자 간 채팅방이 있으면 반환, 없으면 생성
- 사용자 ID 정렬 (USER1_ID < USER2_ID)

#### 채팅방 목록 조회
- **API**: `GET /api/chat/rooms`
- 현재 사용자가 참여한 채팅방 목록
- 마지막 메시지 및 시간 포함
- 최신 메시지 순 정렬

### 4. 실시간 메시지 전송 및 수신

#### 메시지 전송
- **Socket 이벤트**: `send-message`
- 메시지 내용, 채팅방 ID 전송
- 서버에서 데이터베이스에 저장
- 상대방에게 실시간 전송

#### 메시지 수신
- **Socket 이벤트**: `new-message`
- 실시간으로 메시지 수신
- 채팅방 목록 업데이트
- 메시지 목록에 추가

#### 코드 구조
```javascript
// 메시지 전송
const handleSendMessage = () => {
    if (!message.trim() || !selectedRoomId) return;
    
    // Optimistic UI 업데이트
    const tempMessage = {
        messageId: `temp-${Date.now()}`,
        senderId: user.userId,
        message: message,
        createdAt: new Date().toISOString(),
        isRead: false
    };
    setMessages(prev => [...prev, tempMessage]);
    setMessage('');
    
    // Socket으로 메시지 전송
    socket.emit('send-message', {
        roomId: selectedRoomId,
        message: message
    });
};

// 메시지 수신
socket.on('new-message', (data) => {
    if (data.roomId === selectedRoomId) {
        // 임시 메시지 교체 또는 새 메시지 추가
        setMessages(prev => {
            const filtered = prev.filter(m => !m.messageId.startsWith('temp-'));
            return [...filtered, data.message];
        });
    }
    
    // 채팅방 목록 업데이트
    loadChatRooms();
});
```

### 5. 메시지 읽음 처리

#### 읽음 처리 로직
- 메시지 목록 조회 시 읽음 처리
- **API**: `PUT /api/chat/messages/read`
- **Socket 이벤트**: `mark-messages-read`

#### 구현 세부사항
- 채팅방 선택 시 모든 메시지 읽음 처리
- 실시간으로 읽음 상태 업데이트
- 읽지 않은 메시지 수 계산

### 6. 채팅 알림 시스템

#### 알림 생성
- 새 채팅방 생성 시 알림 전송
- **알림 타입**: `CHAT`
- **알림 수신자**: 상대방 사용자

#### 알림 표시
- 헤더에 채팅 알림 배지
- 채팅 아이콘에 읽지 않은 메시지 수 표시
- 알림 클릭 시 채팅 페이지로 이동

#### 데이터베이스 마이그레이션
- `LM_NOTIFICATIONS` 테이블의 `TYPE` ENUM에 `CHAT` 추가
- 마이그레이션 파일: `add_chat_notification_type.sql`

### 7. 채팅방 나가기 기능

#### 채팅방 삭제
- **API**: `DELETE /api/chat/rooms/:roomId`
- 채팅방과 모든 메시지 삭제
- 권한 확인 (채팅방 참여자만 삭제 가능)

#### UI 구현
- 채팅 헤더에 "나가기" 버튼
- 레트로 스타일 확인 다이얼로그
- 삭제 후 채팅방 목록 새로고침

---

## 🐛 주요 이슈 및 해결

### 이슈 1: WebSocket 연결 안정성
**문제**:  
- 연결이 끊어졌을 때 메시지 전송 실패
- 재연결이 자동으로 되지 않음

**해결 과정**:
1. Socket.io의 자동 재연결 기능 활용
2. 연결 상태 모니터링
3. 재연결 시 인증 토큰 재전송

**코드**:
```javascript
socket.on('disconnect', () => {
    console.log('Socket 연결 끊김');
    setConnected(false);
});

socket.on('reconnect', () => {
    console.log('Socket 재연결');
    if (token) {
        socket.emit('authenticate', token);
    }
});
```

### 이슈 2: 메시지 정렬 문제
**문제**:  
- 메시지가 시간순으로 정렬되지 않음
- 새 메시지가 중간에 삽입됨

**해결 과정**:
1. 메시지 목록을 `CREATED_AT` 기준 정렬
2. 새 메시지 추가 시 정렬 유지
3. 스크롤 자동 이동

**코드**:
```javascript
const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
    );
}, [messages]);
```

### 이슈 3: 채팅방 생성 중복
**문제**:  
- 같은 사용자와 여러 개의 채팅방이 생성됨
- UNIQUE KEY 제약조건 위반

**해결 과정**:
1. 채팅방 생성 전 기존 채팅방 확인
2. 사용자 ID 정렬 (작은 값이 USER1_ID)
3. 중복 체크 쿼리

**코드**:
```javascript
const [user1Id, user2Id] = currentUserId < otherUserId 
    ? [currentUserId, otherUserId]
    : [otherUserId, currentUserId];

const [existingRooms] = await pool.query(
    'SELECT * FROM LM_CHAT_ROOMS WHERE USER1_ID = ? AND USER2_ID = ?',
    [user1Id, user2Id]
);

if (existingRooms.length > 0) {
    return existingRooms[0];
}
```

### 이슈 4: 메시지 정렬 및 스크롤
**문제**:  
- 새 메시지가 추가되어도 스크롤이 자동으로 이동하지 않음
- 사용자가 새 메시지를 놓침

**해결 과정**:
1. 메시지 목록 하단에 ref 배치
2. 새 메시지 추가 시 스크롤 이동
3. `useEffect`로 메시지 변경 감지

**코드**:
```javascript
const messagesEndRef = useRef(null);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
    scrollToBottom();
}, [messages]);
```

---

## 📝 코드 구조

### Frontend 구조
```
frontend/src/
├── pages/
│   └── ChatPage.jsx         # 채팅 페이지
└── utils/
    └── api.js              # 채팅 API 함수들
```

### Backend 구조
```
backend/src/
├── controllers/
│   └── chatController.js   # 채팅 컨트롤러
├── routes/
│   └── chatRoutes.js       # 채팅 라우터
└── index.js                # Socket.io 서버 설정
```

---

## 💡 배운 점

1. **WebSocket 통신**
   - Socket.io를 활용한 실시간 통신
   - 이벤트 기반 아키텍처
   - 연결 상태 관리

2. **실시간 기능 구현**
   - 메시지 실시간 전송/수신
   - Optimistic UI 업데이트
   - 상태 동기화

3. **채팅 시스템 설계**
   - 일대일 채팅 구조
   - 채팅방 관리
   - 메시지 읽음 처리

4. **에러 처리**
   - 연결 끊김 처리
   - 재연결 로직
   - 에러 메시지 표시

---

## 📊 작업 통계

- **작성한 파일 수**: 약 5개
- **코드 라인 수**: 약 2,500줄
- **구현한 API 엔드포인트**: 5개
- **구현한 Socket 이벤트**: 5개
- **생성한 데이터베이스 테이블**: 2개

---

## 🎯 내일 계획

1. 알림 시스템 구현 (좋아요, 댓글, 팔로우, 채팅 알림)
2. 알림 목록 조회 및 표시
3. 알림 읽음 처리
4. 알림 배지 표시
5. 레트로 테마 UI 개선
6. 지도 페이지 위젯 추가 (시계, 날씨)

---

## 📸 참고 자료

- [Socket.io 공식 문서](https://socket.io/docs/v4/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**작성일**: 2025년 11월 30일  
**작성자**: [작성자명]

