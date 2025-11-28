// backend/src/utils/markerUtils.js

// 유효한 카테고리 목록
const VALID_CATEGORIES = ['RESTAURANT', 'CAFE', 'TRAVEL', 'DAILY', 'PHOTO', 'GENERAL'];

/**
 * DB 조회 결과(대문자/언더스코어)를 프론트엔드용 camelCase로 변환
 * @param {Object} row - DB 조회 결과 row
 * @returns {Object} 변환된 마커 객체
 */
const convertMarkerToCamelCase = (row) => ({
  markerId: row.MARKER_ID,
  userId: row.USER_ID,
  username: row.USERNAME || null,
  profileImageUrl: row.PROFILE_IMAGE_URL || null,
  latitude: row.LATITUDE,
  longitude: row.LONGITUDE,
  line1: row.LINE1,
  line2: row.LINE2,
  line3: row.LINE3,
  imageUrl: row.IMAGE_URL,
  category: row.CATEGORY || 'GENERAL',
  createdAt: row.CREATED_AT,
  updatedAt: row.UPDATED_AT,
  likeCount: row.LIKE_COUNT,
  commentCount: row.COMMENT_COUNT,
  isPublic: row.IS_PUBLIC === 1,
});

/**
 * 마커 생성/수정 시 공통 유효성 검사
 * @param {Object} params - 검사할 파라미터
 * @returns {string|null} 에러 메시지 또는 null
 */
const validateMarkerInput = ({ line1, latitude, longitude, category, requireCoords = true }) => {
  if (!line1?.trim()) {
    return '첫째 줄 글은 필수 항목입니다.';
  }
  if (requireCoords && (latitude == null || longitude == null)) {
    return '위도, 경도는 필수 항목입니다.';
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return '유효하지 않은 카테고리입니다.';
  }
  return null;
};

/**
 * 마커 소유권 확인
 * @param {number} markerUserId - 마커 소유자 ID
 * @param {number} requestUserId - 요청한 사용자 ID
 * @returns {boolean} 소유자 여부
 */
const isMarkerOwner = (markerUserId, requestUserId) => markerUserId === requestUserId;

module.exports = {
  convertMarkerToCamelCase,
  validateMarkerInput,
  isMarkerOwner,
  VALID_CATEGORIES,
};

