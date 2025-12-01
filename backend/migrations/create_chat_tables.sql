-- ============================================
-- 채팅 기능을 위한 데이터베이스 테이블 생성
-- ============================================
-- 
-- 이 파일은 사용자 간 1:1 채팅 기능을 구현하기 위한 테이블들을 생성합니다.
-- 
-- 테이블 설명:
-- 1. LM_CHAT_ROOMS: 채팅방 정보를 저장하는 테이블
--    - 두 사용자 간의 채팅방을 나타냅니다
--    - 각 채팅방은 고유한 ROOM_ID를 가집니다
-- 
-- 2. LM_CHAT_MESSAGES: 채팅 메시지를 저장하는 테이블
--    - 각 채팅방의 메시지들을 저장합니다
--    - 메시지 내용, 전송 시간, 읽음 여부 등을 저장합니다
-- 
-- 실행 방법:
-- 1. MySQL에 접속합니다
-- 2. 아래 USE 문의 데이터베이스 이름을 실제 데이터베이스 이름으로 변경합니다
-- 3. 이 파일의 내용을 복사해서 실행합니다
-- 
-- 주의사항:
-- - 실행 전 데이터베이스를 백업하는 것을 권장합니다
-- ============================================

-- ===== 0. 데이터베이스 선택 =====
-- 
-- 아래 USE 문의 데이터베이스 이름을 실제 데이터베이스 이름으로 변경하세요.
-- 예: USE 3linemarker;
-- 
-- 또는 MySQL Workbench에서 데이터베이스를 먼저 선택한 후 이 파일을 실행할 수도 있습니다.
-- (이 경우 아래 USE 문을 주석 처리하거나 삭제하세요)
-- 
-- ⚠️ 주의: 아래 USE 문의 데이터베이스 이름을 실제 데이터베이스 이름으로 변경해야 합니다!
-- USE your_database_name;

-- ===== 1. 채팅방 테이블 생성 =====
-- 
-- LM_CHAT_ROOMS: 두 사용자 간의 채팅방 정보를 저장합니다
-- 
-- 컬럼 설명:
-- - ROOM_ID: 채팅방 고유 ID (자동 증가)
-- - USER1_ID: 채팅방의 첫 번째 사용자 ID
-- - USER2_ID: 채팅방의 두 번째 사용자 ID
-- - CREATED_AT: 채팅방 생성 시간
-- - UPDATED_AT: 채팅방 마지막 업데이트 시간 (마지막 메시지 전송 시간)
-- - LAST_MESSAGE: 마지막 메시지 내용 (미리보기용)
-- - LAST_MESSAGE_TIME: 마지막 메시지 전송 시간
-- 
-- 인덱스:
-- - PRIMARY KEY (ROOM_ID): 기본 키
-- - UNIQUE KEY (USER1_ID, USER2_ID): 두 사용자 조합이 중복되지 않도록 보장
-- - INDEX (USER1_ID): 첫 번째 사용자로 채팅방 검색 속도 향상
-- - INDEX (USER2_ID): 두 번째 사용자로 채팅방 검색 속도 향상
CREATE TABLE IF NOT EXISTS LM_CHAT_ROOMS (
    ROOM_ID INT AUTO_INCREMENT PRIMARY KEY COMMENT '채팅방 고유 ID',
    USER1_ID VARCHAR(50) NOT NULL COMMENT '첫 번째 사용자 ID (작은 값으로 정렬)',
    USER2_ID VARCHAR(50) NOT NULL COMMENT '두 번째 사용자 ID (큰 값으로 정렬)',
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '채팅방 생성 시간',
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '채팅방 마지막 업데이트 시간',
    LAST_MESSAGE TEXT NULL COMMENT '마지막 메시지 내용 (미리보기용)',
    LAST_MESSAGE_TIME DATETIME NULL COMMENT '마지막 메시지 전송 시간',
    -- FOREIGN KEY 제약조건 제거: 백업/복원을 간단하게 하기 위해 애플리케이션 레벨에서 데이터 무결성 관리
    -- 참고: USER1_ID와 USER2_ID는 LM_USERS 테이블의 USER_ID를 참조하지만,
    --       FOREIGN KEY 제약조건이 없으므로 테이블 생성 순서에 관계없이 실행 가능
    UNIQUE KEY unique_user_pair (USER1_ID, USER2_ID) COMMENT '두 사용자 조합 중복 방지',
    INDEX idx_user1 (USER1_ID) COMMENT '첫 번째 사용자 검색 인덱스',
    INDEX idx_user2 (USER2_ID) COMMENT '두 번째 사용자 검색 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅방 정보 테이블';

-- ===== 2. 채팅 메시지 테이블 생성 =====
-- 
-- LM_CHAT_MESSAGES: 각 채팅방의 메시지들을 저장합니다
-- 
-- 컬럼 설명:
-- - MESSAGE_ID: 메시지 고유 ID (자동 증가)
-- - ROOM_ID: 메시지가 속한 채팅방 ID
-- - SENDER_ID: 메시지를 보낸 사용자 ID
-- - MESSAGE: 메시지 내용
-- - CREATED_AT: 메시지 전송 시간
-- - IS_READ: 메시지 읽음 여부 (0: 안 읽음, 1: 읽음)
-- 
-- 인덱스:
-- - PRIMARY KEY (MESSAGE_ID): 기본 키
-- - INDEX (ROOM_ID, CREATED_AT): 채팅방별 메시지 조회 속도 향상 (시간순 정렬)
-- - INDEX (SENDER_ID): 발신자 검색 속도 향상
-- - INDEX (IS_READ): 읽지 않은 메시지 조회 속도 향상
CREATE TABLE IF NOT EXISTS LM_CHAT_MESSAGES (
    MESSAGE_ID INT AUTO_INCREMENT PRIMARY KEY COMMENT '메시지 고유 ID',
    ROOM_ID INT NOT NULL COMMENT '채팅방 ID',
    SENDER_ID VARCHAR(50) NOT NULL COMMENT '메시지를 보낸 사용자 ID',
    MESSAGE TEXT NOT NULL COMMENT '메시지 내용',
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '메시지 전송 시간',
    IS_READ TINYINT DEFAULT 0 COMMENT '메시지 읽음 여부 (0: 안 읽음, 1: 읽음)',
    -- FOREIGN KEY 제약조건 제거: 백업/복원을 간단하게 하기 위해 애플리케이션 레벨에서 데이터 무결성 관리
    -- 참고: ROOM_ID는 LM_CHAT_ROOMS 테이블의 ROOM_ID를 참조하고,
    --       SENDER_ID는 LM_USERS 테이블의 USER_ID를 참조하지만,
    --       FOREIGN KEY 제약조건이 없으므로 테이블 생성 순서에 관계없이 실행 가능
    INDEX idx_room_created (ROOM_ID, CREATED_AT) COMMENT '채팅방별 시간순 조회 인덱스',
    INDEX idx_sender (SENDER_ID) COMMENT '발신자 검색 인덱스',
    INDEX idx_is_read (IS_READ) COMMENT '읽음 여부 검색 인덱스'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채팅 메시지 테이블';

-- ===== 3. 확인 쿼리 =====
-- 
-- 테이블이 제대로 생성되었는지 확인하는 쿼리입니다
-- 실행 후 테이블 구조를 확인할 수 있습니다
-- 
-- DESCRIBE LM_CHAT_ROOMS;
-- DESCRIBE LM_CHAT_MESSAGES;
-- 
-- ===== 완료 =====
-- 채팅 기능을 위한 데이터베이스 테이블 생성이 완료되었습니다!
-- 이제 백엔드 API를 구현할 수 있습니다.

