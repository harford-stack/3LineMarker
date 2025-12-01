// backend/src/controllers/chatController.js
/**
 * ============================================
 * ✨ chatController.js - 채팅 기능 컨트롤러
 * ============================================
 * 
 * 이 파일은 사용자 간 1:1 채팅 기능을 처리하는 백엔드 컨트롤러입니다.
 * 
 * 주요 기능:
 * 1. 채팅방 생성 또는 조회
 * 2. 메시지 전송
 * 3. 채팅방 목록 조회
 * 4. 채팅방의 메시지 목록 조회
 * 5. 메시지 읽음 처리
 * 
 * 작동 흐름:
 * 클라이언트 요청 → 라우터 → 컨트롤러 → 데이터베이스 → 응답 반환
 * 
 * 데이터베이스 테이블:
 * - LM_CHAT_ROOMS: 채팅방 정보
 * - LM_CHAT_MESSAGES: 채팅 메시지
 * ============================================
 */

// ===== 1단계: 필요한 모듈 가져오기 =====

// 데이터베이스 연결 모듈 가져오기
// pool: MySQL 데이터베이스와 통신하기 위한 연결 풀
const pool = require('../config/database');

// 알림 생성 함수 가져오기
// createNotification: 다른 컨트롤러에서 알림을 생성할 때 사용하는 함수
const { createNotification } = require('./notificationController');

// ===== 2단계: 에러 응답 함수 정의 =====

/**
 * sendError 함수
 * 
 * 에러가 발생했을 때 일관된 형식으로 에러 응답을 보내는 함수입니다.
 * 
 * @param {Object} res - Express 응답 객체 (서버가 클라이언트에게 응답을 보낼 때 사용)
 * @param {number} statusCode - HTTP 상태 코드 (예: 400, 404, 500)
 * @param {string} message - 에러 메시지 (사용자에게 보여줄 메시지)
 * @param {Error} error - 실제 에러 객체 (개발자용 디버깅 정보)
 * 
 * 작동 방식:
 * 1. 콘솔에 에러 정보 출력 (개발자용)
 * 2. 클라이언트에게 에러 응답 전송
 */
const sendError = (res, statusCode, message, error = null) => {
  // console.error: 개발자 도구에 에러 메시지 출력
  // error?.stack: 에러가 있으면 상세한 에러 정보(stack trace) 출력
  if (error) {
    console.error(`[Chat Controller Error] ${message}:`, error?.stack || error);
  }
  
  // res.status(): HTTP 상태 코드 설정
  // res.json(): JSON 형식으로 응답 전송
  res.status(statusCode).json({ message });
};

// ===== 3단계: 채팅방 관련 함수들 =====

/**
 * getOrCreateChatRoom 함수
 * 
 * 두 사용자 간의 채팅방을 조회하거나 생성합니다.
 * 
 * GET /api/chat/room?otherUserId=상대방아이디
 * 
 * 작동 순서:
 * 1. 현재 로그인한 사용자와 상대방 사용자 ID 가져오기
 * 2. 두 사용자 ID를 정렬 (USER1_ID < USER2_ID로 통일하여 중복 방지)
 * 3. 기존 채팅방이 있는지 확인
 * 4. 있으면 기존 채팅방 반환, 없으면 새로 생성
 * 
 * @param {Object} req - Express 요청 객체
 *   - req.user: 인증 미들웨어에서 설정한 현재 로그인한 사용자 정보
 *   - req.query.otherUserId: 채팅할 상대방 사용자 ID
 * @param {Object} res - Express 응답 객체
 */
exports.getOrCreateChatRoom = async (req, res) => {
  // 현재 로그인한 사용자 ID 가져오기
  // req.user: 인증 미들웨어(authMiddleware)에서 설정한 사용자 정보
  // protect 미들웨어는 req.user에 { user_id, username } 객체를 설정합니다
  const currentUserId = req.user?.user_id;
  
  // 상대방 사용자 ID 가져오기 (쿼리 파라미터에서)
  // req.query: URL의 ? 뒤에 오는 파라미터들 (예: ?otherUserId=user123)
  const { otherUserId } = req.query;

  // ===== 입력값 유효성 검사 =====
  
  // 현재 사용자가 로그인하지 않았으면 에러
  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  // 상대방 사용자 ID가 없으면 에러
  if (!otherUserId) {
    return sendError(res, 400, '상대방 사용자 ID를 입력해주세요.');
  }

  // 자기 자신과 채팅할 수 없도록 방지
  if (currentUserId === otherUserId) {
    return sendError(res, 400, '자기 자신과는 채팅할 수 없습니다.');
  }

  try {
    // ===== 두 사용자 ID 정렬 =====
    // 
    // 같은 두 사용자 간의 채팅방이 중복 생성되지 않도록
    // 항상 작은 값이 USER1_ID, 큰 값이 USER2_ID가 되도록 정렬합니다.
    // 
    // 예: 사용자 A와 사용자 B가 채팅할 때
    // - A < B이면: USER1_ID = A, USER2_ID = B
    // - B < A이면: USER1_ID = B, USER2_ID = A
    // 
    // 이렇게 하면 (A, B)와 (B, A)가 같은 채팅방으로 인식됩니다.
    const [user1Id, user2Id] = currentUserId < otherUserId 
      ? [currentUserId, otherUserId]  // currentUserId가 작으면 첫 번째
      : [otherUserId, currentUserId]; // otherUserId가 작으면 첫 번째

    // ===== 기존 채팅방 조회 =====
    // 
    // SELECT: 데이터베이스에서 데이터를 가져오는 명령어
    // FROM LM_CHAT_ROOMS: LM_CHAT_ROOMS 테이블에서
    // WHERE USER1_ID = ? AND USER2_ID = ?: 두 사용자 ID가 일치하는 행 찾기
    // 
    // pool.query(): 데이터베이스에 SQL 쿼리 실행
    // [user1Id, user2Id]: ? 자리에 들어갈 값들 (SQL Injection 방지)
    const [existingRooms] = await pool.query(
      'SELECT * FROM LM_CHAT_ROOMS WHERE USER1_ID = ? AND USER2_ID = ?',
      [user1Id, user2Id]
    );

    let room;

    // ===== 채팅방이 있으면 기존 것 사용, 없으면 새로 생성 =====
    let isNewRoom = false;
    if (existingRooms.length > 0) {
      // 기존 채팅방이 있으면 그대로 사용
      room = existingRooms[0];
    } else {
      // 기존 채팅방이 없으면 새로 생성
      // INSERT INTO: 데이터베이스에 새 행 추가
      // VALUES: 추가할 데이터
      const [result] = await pool.query(
        'INSERT INTO LM_CHAT_ROOMS (USER1_ID, USER2_ID) VALUES (?, ?)',
        [user1Id, user2Id]
      );

      // 생성된 채팅방 정보 조회
      // result.insertId: 방금 생성된 행의 ID (AUTO_INCREMENT 값)
      const [newRooms] = await pool.query(
        'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ?',
        [result.insertId]
      );
      room = newRooms[0];
      isNewRoom = true;
    }

    // ===== 상대방 사용자 정보 조회 =====
    // 
    // 채팅방 정보와 함께 상대방 사용자의 이름, 프로필 이미지 등을 가져옵니다.
    const [otherUser] = await pool.query(
      'SELECT USER_ID, USERNAME, PROFILE_IMAGE_URL FROM LM_USERS WHERE USER_ID = ?',
      [otherUserId]
    );

    // 상대방 사용자가 존재하지 않으면 에러
    if (otherUser.length === 0) {
      return sendError(res, 404, '상대방 사용자를 찾을 수 없습니다.');
    }

    // ===== 채팅방 생성/접근 시 알림 전송 =====
    // 
    // 새로 채팅방이 생성되었을 때 상대방에게 알림을 보냅니다.
    // 프로필 페이지에서 채팅 버튼을 클릭한 경우이므로, 
    // 기존 채팅방이 있어도 사용자가 채팅을 시작하려는 의도로 알림을 보냅니다.
    if (isNewRoom) {
      try {
        console.log(`[getOrCreateChatRoom] 새 채팅방 생성됨, 알림 전송 시도: ${currentUserId} → ${otherUserId}`);
        console.log(`[getOrCreateChatRoom] createNotification 함수 존재 여부:`, typeof createNotification);
        
        // 상대방 사용자에게 채팅 요청 알림 전송
        // createNotification(받는사용자ID, 알림타입, 보낸사용자ID, 마커ID)
        // 채팅 알림은 마커와 관련이 없으므로 마커ID는 null
        if (createNotification) {
          await createNotification(otherUserId, 'CHAT', currentUserId, null);
          console.log(`[getOrCreateChatRoom] 채팅 알림 전송 완료: ${currentUserId} → ${otherUserId}`);
        } else {
          console.error('[getOrCreateChatRoom] createNotification 함수를 찾을 수 없습니다.');
        }
      } catch (error) {
        // 알림 생성 실패는 치명적이지 않으므로 로그만 남기고 계속 진행
        console.error('[getOrCreateChatRoom] 알림 생성 실패:', error);
        console.error('[getOrCreateChatRoom] 알림 생성 실패 상세:', error.message);
        if (error.stack) {
          console.error('[getOrCreateChatRoom] 알림 생성 실패 스택:', error.stack);
        }
      }
    } else {
      // 기존 채팅방이 있는 경우에도 알림 전송 (프로필에서 채팅 버튼 클릭 시)
      // 단, 최근 1시간 이내에 같은 사용자로부터 알림을 받지 않은 경우에만
      try {
        console.log(`[getOrCreateChatRoom] 기존 채팅방 사용, 알림 전송 시도: ${currentUserId} → ${otherUserId}`);
        
        // 최근 1시간 이내에 같은 사용자로부터 CHAT 알림이 있는지 확인
        const [recentNotifications] = await pool.query(
          `SELECT * FROM LM_NOTIFICATIONS 
           WHERE USER_ID = ? AND TYPE = 'CHAT' AND ACTOR_ID = ? 
           AND CREATED_AT > DATE_SUB(NOW(), INTERVAL 1 HOUR)
           ORDER BY CREATED_AT DESC LIMIT 1`,
          [otherUserId, currentUserId]
        );
        
        if (recentNotifications.length === 0) {
          // 최근 알림이 없으면 새로 알림 전송
          console.log(`[getOrCreateChatRoom] 최근 알림 없음, 새 알림 전송: ${currentUserId} → ${otherUserId}`);
          if (createNotification) {
            await createNotification(otherUserId, 'CHAT', currentUserId, null);
            console.log(`[getOrCreateChatRoom] 채팅 알림 전송 완료: ${currentUserId} → ${otherUserId}`);
          }
        } else {
          console.log(`[getOrCreateChatRoom] 최근 알림 존재, 알림 전송 스킵: ${currentUserId} → ${otherUserId}`);
        }
      } catch (error) {
        console.error('[getOrCreateChatRoom] 기존 채팅방 알림 전송 실패:', error);
      }
    }

    // ===== 성공 응답 전송 =====
    // 
    // res.status(200): HTTP 상태 코드 200 (성공)
    // res.json(): JSON 형식으로 응답 전송
    res.status(200).json({
      room: {
        roomId: room.ROOM_ID,
        user1Id: room.USER1_ID,
        user2Id: room.USER2_ID,
        createdAt: room.CREATED_AT,
        updatedAt: room.UPDATED_AT,
        lastMessage: room.LAST_MESSAGE,
        lastMessageTime: room.LAST_MESSAGE_TIME,
      },
      otherUser: {
        userId: otherUser[0].USER_ID,
        username: otherUser[0].USERNAME,
        profileImageUrl: otherUser[0].PROFILE_IMAGE_URL,
      },
    });

  } catch (error) {
    // 예상치 못한 에러 발생 시
    console.error('[getOrCreateChatRoom] 에러 상세:', error);
    console.error('[getOrCreateChatRoom] 에러 스택:', error.stack);
    sendError(res, 500, '채팅방 조회/생성에 실패했습니다.', error);
  }
};

/**
 * getChatRooms 함수
 * 
 * 현재 로그인한 사용자가 참여한 모든 채팅방 목록을 조회합니다.
 * 
 * GET /api/chat/rooms
 * 
 * 작동 순서:
 * 1. 현재 로그인한 사용자 ID 가져오기
 * 2. 사용자가 참여한 모든 채팅방 조회 (USER1_ID 또는 USER2_ID로 검색)
 * 3. 각 채팅방의 상대방 사용자 정보 조회
 * 4. 최신 메시지 순으로 정렬하여 반환
 * 
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.getChatRooms = async (req, res) => {
  // 현재 로그인한 사용자 ID 가져오기
  const currentUserId = req.user?.user_id;

  // 로그인하지 않았으면 에러
  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  try {
    console.log('[getChatRooms] 현재 사용자 ID:', currentUserId);
    
    // ===== 사용자가 참여한 모든 채팅방 조회 =====
    // 
    // WHERE (USER1_ID = ? OR USER2_ID = ?): 
    // 현재 사용자가 USER1_ID이거나 USER2_ID인 모든 채팅방 찾기
    // 
    // ORDER BY LAST_MESSAGE_TIME DESC: 
    // 마지막 메시지 시간 기준으로 내림차순 정렬 (최신 메시지가 있는 채팅방이 위로)
    // 
    // NULLS LAST: NULL 값은 맨 뒤로 (메시지가 없는 채팅방은 맨 뒤로)
    const [rooms] = await pool.query(
      `SELECT * FROM LM_CHAT_ROOMS 
       WHERE USER1_ID = ? OR USER2_ID = ? 
       ORDER BY 
         CASE WHEN LAST_MESSAGE_TIME IS NULL THEN 1 ELSE 0 END,
         LAST_MESSAGE_TIME DESC`,
      [currentUserId, currentUserId]
    );
    console.log('[getChatRooms] 조회된 채팅방 수:', rooms.length);

    // ===== 각 채팅방의 상대방 사용자 정보 조회 =====
    // 
    // Promise.all(): 여러 비동기 작업을 동시에 실행하고 모두 완료될 때까지 기다림
    // map(): 배열의 각 요소에 대해 함수 실행
    const roomsWithOtherUser = await Promise.all(
      rooms.map(async (room) => {
        // 현재 사용자가 USER1_ID이면 상대방은 USER2_ID
        // 현재 사용자가 USER2_ID이면 상대방은 USER1_ID
        const otherUserId = room.USER1_ID === currentUserId 
          ? room.USER2_ID 
          : room.USER1_ID;

        // 상대방 사용자 정보 조회
        const [otherUser] = await pool.query(
          'SELECT USER_ID, USERNAME, PROFILE_IMAGE_URL FROM LM_USERS WHERE USER_ID = ?',
          [otherUserId]
        );

        // 상대방 사용자가 없으면 건너뛰기
        if (!otherUser || otherUser.length === 0) {
          console.warn(`상대방 사용자를 찾을 수 없습니다: ${otherUserId}`);
          return null;
        }

        // 읽지 않은 메시지 수 조회
        // COUNT(*): 행의 개수 세기
        // WHERE ROOM_ID = ? AND SENDER_ID != ? AND IS_READ = 0:
        // 해당 채팅방에서, 상대방이 보낸, 읽지 않은 메시지 개수
        const [unreadCount] = await pool.query(
          `SELECT COUNT(*) as count FROM LM_CHAT_MESSAGES 
           WHERE ROOM_ID = ? AND SENDER_ID != ? AND IS_READ = 0`,
          [room.ROOM_ID, currentUserId]
        );

        // 채팅방 정보와 상대방 정보, 읽지 않은 메시지 수를 합쳐서 반환
        return {
          roomId: room.ROOM_ID,
          otherUser: {
            userId: otherUser[0].USER_ID,
            username: otherUser[0].USERNAME || '알 수 없음',
            profileImageUrl: otherUser[0].PROFILE_IMAGE_URL || null,
          },
          lastMessage: room.LAST_MESSAGE,
          lastMessageTime: room.LAST_MESSAGE_TIME,
          unreadCount: unreadCount[0]?.count || 0,
          createdAt: room.CREATED_AT,
        };
      })
    );

    // null 값 제거 (상대방 사용자를 찾을 수 없는 채팅방 제외)
    const validRooms = roomsWithOtherUser.filter(room => room !== null);

    // 성공 응답 전송
    res.status(200).json({ rooms: validRooms });

  } catch (error) {
    console.error('[getChatRooms] 에러 상세:', error);
    console.error('[getChatRooms] 에러 스택:', error.stack);
    sendError(res, 500, '채팅방 목록 조회에 실패했습니다.', error);
  }
};

// ===== 4단계: 메시지 관련 함수들 =====

/**
 * sendMessage 함수
 * 
 * 채팅방에 메시지를 전송합니다.
 * 
 * POST /api/chat/messages
 * 
 * 요청 본문 (body):
 * {
 *   "roomId": 1,           // 채팅방 ID
 *   "message": "안녕하세요"  // 메시지 내용
 * }
 * 
 * 작동 순서:
 * 1. 현재 로그인한 사용자 ID와 요청 본문에서 roomId, message 가져오기
 * 2. 채팅방이 존재하고 사용자가 참여한 채팅방인지 확인
 * 3. 메시지를 데이터베이스에 저장
 * 4. 채팅방의 LAST_MESSAGE와 LAST_MESSAGE_TIME 업데이트
 * 5. 저장된 메시지 정보 반환
 * 
 * @param {Object} req - Express 요청 객체
 *   - req.body.roomId: 채팅방 ID
 *   - req.body.message: 메시지 내용
 * @param {Object} res - Express 응답 객체
 */
exports.sendMessage = async (req, res) => {
  // 현재 로그인한 사용자 ID 가져오기
  const currentUserId = req.user?.user_id;
  
  // 요청 본문에서 채팅방 ID와 메시지 내용 가져오기
  // req.body: POST 요청의 본문(body)에 담긴 데이터
  const { roomId, message } = req.body;

  // ===== 입력값 유효성 검사 =====
  
  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  if (!roomId) {
    return sendError(res, 400, '채팅방 ID를 입력해주세요.');
  }

  if (!message || message.trim() === '') {
    return sendError(res, 400, '메시지 내용을 입력해주세요.');
  }

  try {
    // ===== 채팅방 존재 및 권한 확인 =====
    // 
    // 사용자가 해당 채팅방에 참여한 사용자인지 확인합니다.
    // USER1_ID 또는 USER2_ID 중 하나가 현재 사용자여야 합니다.
    const [rooms] = await pool.query(
      'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)',
      [roomId, currentUserId, currentUserId]
    );

    // 채팅방이 없거나 권한이 없으면 에러
    if (rooms.length === 0) {
      return sendError(res, 404, '채팅방을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // ===== 메시지 저장 =====
    // 
    // INSERT INTO: 데이터베이스에 새 행 추가
    // (ROOM_ID, SENDER_ID, MESSAGE): 저장할 컬럼들
    // VALUES (?, ?, ?): 저장할 값들
    const [result] = await pool.query(
      'INSERT INTO LM_CHAT_MESSAGES (ROOM_ID, SENDER_ID, MESSAGE) VALUES (?, ?, ?)',
      [roomId, currentUserId, message.trim()]
    );

    // ===== 채팅방 정보 업데이트 =====
    // 
    // UPDATE: 데이터베이스의 기존 행 수정
    // SET: 수정할 컬럼과 값
    // WHERE: 수정할 행의 조건
    // 
    // LAST_MESSAGE: 마지막 메시지 내용 (미리보기용)
    // LAST_MESSAGE_TIME: 마지막 메시지 전송 시간
    await pool.query(
      `UPDATE LM_CHAT_ROOMS 
       SET LAST_MESSAGE = ?, LAST_MESSAGE_TIME = NOW() 
       WHERE ROOM_ID = ?`,
      [message.trim().substring(0, 100), roomId] // 메시지가 너무 길면 100자로 자름
    );

    // ===== 저장된 메시지 정보 조회 =====
    // 
    // 방금 저장한 메시지의 전체 정보를 가져옵니다.
    const [messages] = await pool.query(
      'SELECT * FROM LM_CHAT_MESSAGES WHERE MESSAGE_ID = ?',
      [result.insertId]
    );

    // 성공 응답 전송
    res.status(201).json({
      message: {
        messageId: messages[0].MESSAGE_ID,
        roomId: messages[0].ROOM_ID,
        senderId: messages[0].SENDER_ID,
        message: messages[0].MESSAGE,
        createdAt: messages[0].CREATED_AT,
        isRead: messages[0].IS_READ === 1,
      },
    });

  } catch (error) {
    sendError(res, 500, '메시지 전송에 실패했습니다.', error);
  }
};

/**
 * getMessages 함수
 * 
 * 특정 채팅방의 메시지 목록을 조회합니다.
 * 
 * GET /api/chat/messages?roomId=1&page=1&limit=50
 * 
 * 쿼리 파라미터:
 * - roomId: 채팅방 ID (필수)
 * - page: 페이지 번호 (선택, 기본값: 1)
 * - limit: 한 페이지에 가져올 메시지 수 (선택, 기본값: 50)
 * 
 * 작동 순서:
 * 1. 현재 로그인한 사용자 ID와 쿼리 파라미터 가져오기
 * 2. 채팅방 존재 및 권한 확인
 * 3. 메시지 목록 조회 (페이지네이션 적용)
 * 4. 메시지 목록 반환
 * 
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.getMessages = async (req, res) => {
  // 현재 로그인한 사용자 ID 가져오기
  const currentUserId = req.user?.user_id;
  
  // 쿼리 파라미터에서 채팅방 ID, 페이지 번호, 한 페이지당 메시지 수 가져오기
  // req.query: URL의 ? 뒤에 오는 파라미터들
  const { roomId, page = 1, limit = 50 } = req.query;

  // ===== 입력값 유효성 검사 =====
  
  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  if (!roomId) {
    return sendError(res, 400, '채팅방 ID를 입력해주세요.');
  }

  // 페이지 번호와 한 페이지당 메시지 수를 숫자로 변환
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // 유효한 숫자인지 확인
  if (isNaN(pageNum) || pageNum < 1) {
    return sendError(res, 400, '올바른 페이지 번호를 입력해주세요.');
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return sendError(res, 400, '한 페이지당 메시지 수는 1~100 사이여야 합니다.');
  }

  try {
    // ===== 채팅방 존재 및 권한 확인 =====
    const [rooms] = await pool.query(
      'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)',
      [roomId, currentUserId, currentUserId]
    );

    if (rooms.length === 0) {
      return sendError(res, 404, '채팅방을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // ===== 페이지네이션 계산 =====
    // 
    // OFFSET: 건너뛸 메시지 수
    // 예: page=2, limit=50이면 OFFSET=50 (첫 50개를 건너뛰고 51번째부터)
    const offset = (pageNum - 1) * limitNum;

    // ===== 메시지 목록 조회 =====
    // 
    // SELECT: 데이터베이스에서 데이터 가져오기
    // FROM LM_CHAT_MESSAGES: LM_CHAT_MESSAGES 테이블에서
    // WHERE ROOM_ID = ?: 해당 채팅방의 메시지만
    // ORDER BY CREATED_AT DESC: 전송 시간 기준 내림차순 정렬 (최신 메시지가 위로)
    // LIMIT ? OFFSET ?: 한 페이지당 메시지 수와 건너뛸 메시지 수
    const [messages] = await pool.query(
      `SELECT * FROM LM_CHAT_MESSAGES 
       WHERE ROOM_ID = ? 
       ORDER BY CREATED_AT DESC 
       LIMIT ? OFFSET ?`,
      [roomId, limitNum, offset]
    );

    // ===== 전체 메시지 수 조회 (페이지네이션 정보용) =====
    // 
    // COUNT(*): 전체 메시지 개수
    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_CHAT_MESSAGES WHERE ROOM_ID = ?',
      [roomId]
    );

    // ===== 메시지 목록을 시간순으로 정렬 (오래된 것부터) =====
    // 
    // DESC로 가져왔지만, 화면에는 오래된 메시지부터 보여주는 것이 일반적이므로
    // reverse()로 순서를 뒤집습니다.
    const sortedMessages = messages.reverse();

    // 성공 응답 전송
    res.status(200).json({
      messages: sortedMessages.map((msg) => ({
        messageId: msg.MESSAGE_ID,
        roomId: msg.ROOM_ID,
        senderId: msg.SENDER_ID,
        message: msg.MESSAGE,
        createdAt: msg.CREATED_AT,
        isRead: msg.IS_READ === 1,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limitNum),
      },
    });

  } catch (error) {
    sendError(res, 500, '메시지 목록 조회에 실패했습니다.', error);
  }
};

/**
 * markMessagesAsRead 함수
 * 
 * 특정 채팅방의 읽지 않은 메시지들을 읽음 처리합니다.
 * 
 * PUT /api/chat/messages/read
 * 
 * 요청 본문 (body):
 * {
 *   "roomId": 1  // 채팅방 ID
 * }
 * 
 * 작동 순서:
 * 1. 현재 로그인한 사용자 ID와 채팅방 ID 가져오기
 * 2. 채팅방 존재 및 권한 확인
 * 3. 해당 채팅방에서 상대방이 보낸 읽지 않은 메시지들을 읽음 처리
 * 
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.markMessagesAsRead = async (req, res) => {
  // 현재 로그인한 사용자 ID 가져오기
  const currentUserId = req.user?.user_id;
  
  // 요청 본문에서 채팅방 ID 가져오기
  const { roomId } = req.body;

  // ===== 입력값 유효성 검사 =====
  
  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  if (!roomId) {
    return sendError(res, 400, '채팅방 ID를 입력해주세요.');
  }

  try {
    // ===== 채팅방 존재 및 권한 확인 =====
    const [rooms] = await pool.query(
      'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)',
      [roomId, currentUserId, currentUserId]
    );

    if (rooms.length === 0) {
      return sendError(res, 404, '채팅방을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // ===== 읽지 않은 메시지들을 읽음 처리 =====
    // 
    // UPDATE: 데이터베이스의 기존 행 수정
    // SET IS_READ = 1: 읽음 상태로 변경
    // WHERE: 조건
    //   - ROOM_ID = ?: 해당 채팅방의 메시지만
    //   - SENDER_ID != ?: 상대방이 보낸 메시지만 (자기가 보낸 메시지는 제외)
    //   - IS_READ = 0: 아직 읽지 않은 메시지만
    const [result] = await pool.query(
      `UPDATE LM_CHAT_MESSAGES 
       SET IS_READ = 1 
       WHERE ROOM_ID = ? AND SENDER_ID != ? AND IS_READ = 0`,
      [roomId, currentUserId]
    );

    // 성공 응답 전송
    // result.affectedRows: 수정된 행의 개수
    res.status(200).json({
      message: '메시지가 읽음 처리되었습니다.',
      updatedCount: result.affectedRows,
    });

  } catch (error) {
    sendError(res, 500, '메시지 읽음 처리에 실패했습니다.', error);
  }
};

/**
 * deleteChatRoom 함수
 * 
 * 채팅방을 삭제합니다. 채팅방의 모든 메시지도 함께 삭제됩니다.
 * 
 * DELETE /api/chat/rooms/:roomId
 * 
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.deleteChatRoom = async (req, res) => {
  const currentUserId = req.user?.user_id;
  const { roomId } = req.params;

  if (!currentUserId) {
    return sendError(res, 401, '로그인이 필요합니다.');
  }

  if (!roomId) {
    return sendError(res, 400, '채팅방 ID가 필요합니다.');
  }

  try {
    // 채팅방 조회 및 권한 확인
    const [rooms] = await pool.query(
      'SELECT * FROM LM_CHAT_ROOMS WHERE ROOM_ID = ?',
      [roomId]
    );

    if (rooms.length === 0) {
      return sendError(res, 404, '채팅방을 찾을 수 없습니다.');
    }

    const room = rooms[0];

    // 현재 사용자가 채팅방에 참여한 사용자인지 확인
    if (room.USER1_ID !== currentUserId && room.USER2_ID !== currentUserId) {
      return sendError(res, 403, '채팅방 삭제 권한이 없습니다.');
    }

    // 트랜잭션 시작: 채팅방과 메시지를 함께 삭제
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 메시지 삭제
      await connection.query(
        'DELETE FROM LM_CHAT_MESSAGES WHERE ROOM_ID = ?',
        [roomId]
      );

      // 채팅방 삭제
      await connection.query(
        'DELETE FROM LM_CHAT_ROOMS WHERE ROOM_ID = ?',
        [roomId]
      );

      // 트랜잭션 커밋
      await connection.commit();
      connection.release();

      res.status(200).json({
        message: '채팅방이 삭제되었습니다.',
        roomId: parseInt(roomId),
      });
    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('[deleteChatRoom] 에러:', error);
    sendError(res, 500, '채팅방 삭제에 실패했습니다.', error);
  }
};

