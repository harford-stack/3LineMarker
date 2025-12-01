-- LM_NOTIFICATIONS 테이블의 TYPE 컬럼에 'CHAT' 타입 추가
-- 실행 전 백업을 권장합니다.

-- 현재 TYPE 컬럼이 ENUM인 경우, 'CHAT' 값을 추가
-- MySQL 8.0 이상에서는 MODIFY COLUMN을 사용하여 ENUM 값을 추가할 수 있습니다.

-- ENUM 타입에 'CHAT' 추가
ALTER TABLE LM_NOTIFICATIONS 
MODIFY COLUMN TYPE ENUM('LIKE', 'COMMENT', 'FOLLOW', 'CHAT') NOT NULL;

-- 확인 쿼리 (실행 후 확인)
-- SELECT DISTINCT TYPE FROM LM_NOTIFICATIONS;

