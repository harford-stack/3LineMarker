// backend/src/controllers/searchController.js
const pool = require('../config/database');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 마커 객체 camelCase 변환
const convertMarkerToCamelCase = (marker) => ({
  markerId: marker.MARKER_ID,
  userId: marker.USER_ID,
  username: marker.USERNAME,
  profileImageUrl: marker.PROFILE_IMAGE_URL,
  latitude: parseFloat(marker.LATITUDE),
  longitude: parseFloat(marker.LONGITUDE),
  line1: marker.LINE1,
  line2: marker.LINE2,
  line3: marker.LINE3,
  imageUrl: marker.IMAGE_URL,
  likeCount: marker.LIKE_COUNT,
  commentCount: marker.COMMENT_COUNT,
  isPublic: marker.IS_PUBLIC === 1,
  createdAt: marker.CREATED_AT,
  updatedAt: marker.UPDATED_AT,
});

// 사용자 객체 camelCase 변환
const convertUserToCamelCase = (user) => ({
  userId: user.USER_ID,
  username: user.USERNAME,
  profileImageUrl: user.PROFILE_IMAGE_URL,
  statusMessage: user.STATUS_MESSAGE,
  markerCount: user.MARKER_COUNT || 0,
  followerCount: user.FOLLOWER_COUNT || 0,
});

/**
 * 마커 검색 (내용 기반)
 * GET /api/search/markers?q=검색어&page=1&limit=20
 */
exports.searchMarkers = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const searchTerm = `%${q.trim()}%`;

  try {
    // 검색 결과 조회 (공개 마커만, 최신순)
    const [markers] = await pool.query(
      `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL 
       FROM LM_MARKERS m 
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID 
       WHERE m.IS_PUBLIC = TRUE 
         AND (m.LINE1 LIKE ? OR m.LINE2 LIKE ? OR m.LINE3 LIKE ?)
       ORDER BY m.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)]
    );

    // 전체 개수 조회
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM LM_MARKERS 
       WHERE IS_PUBLIC = TRUE 
         AND (LINE1 LIKE ? OR LINE2 LIKE ? OR LINE3 LIKE ?)`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.status(200).json({
      markers: markers.map(convertMarkerToCamelCase),
      totalCount: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '마커 검색에 실패했습니다.', error);
  }
};

/**
 * 사용자 검색 (아이디/닉네임 기반)
 * GET /api/search/users?q=검색어&page=1&limit=20
 */
exports.searchUsers = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const searchTerm = `%${q.trim()}%`;

  try {
    // 사용자 검색 (마커 수, 팔로워 수 포함)
    const [users] = await pool.query(
      `SELECT u.USER_ID, u.USERNAME, u.PROFILE_IMAGE_URL, u.STATUS_MESSAGE,
              (SELECT COUNT(*) FROM LM_MARKERS WHERE USER_ID = u.USER_ID AND IS_PUBLIC = TRUE) as MARKER_COUNT,
              (SELECT COUNT(*) FROM LM_FOLLOWS WHERE FOLLOWING_ID = u.USER_ID) as FOLLOWER_COUNT
       FROM LM_USERS u 
       WHERE u.USER_ID LIKE ? OR u.USERNAME LIKE ?
       ORDER BY MARKER_COUNT DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, parseInt(limit), parseInt(offset)]
    );

    // 전체 개수 조회
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM LM_USERS 
       WHERE USER_ID LIKE ? OR USERNAME LIKE ?`,
      [searchTerm, searchTerm]
    );

    res.status(200).json({
      users: users.map(convertUserToCamelCase),
      totalCount: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '사용자 검색에 실패했습니다.', error);
  }
};

/**
 * 통합 검색 (마커 + 사용자)
 * GET /api/search?q=검색어
 */
exports.searchAll = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.status(400).json({ message: '검색어를 입력해주세요.' });
  }

  const searchTerm = `%${q.trim()}%`;

  try {
    // 마커 검색 (상위 5개)
    const [markers] = await pool.query(
      `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL 
       FROM LM_MARKERS m 
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID 
       WHERE m.IS_PUBLIC = TRUE 
         AND (m.LINE1 LIKE ? OR m.LINE2 LIKE ? OR m.LINE3 LIKE ?)
       ORDER BY m.LIKE_COUNT DESC, m.CREATED_AT DESC
       LIMIT 5`,
      [searchTerm, searchTerm, searchTerm]
    );

    // 사용자 검색 (상위 5개)
    const [users] = await pool.query(
      `SELECT u.USER_ID, u.USERNAME, u.PROFILE_IMAGE_URL, u.STATUS_MESSAGE,
              (SELECT COUNT(*) FROM LM_MARKERS WHERE USER_ID = u.USER_ID AND IS_PUBLIC = TRUE) as MARKER_COUNT,
              (SELECT COUNT(*) FROM LM_FOLLOWS WHERE FOLLOWING_ID = u.USER_ID) as FOLLOWER_COUNT
       FROM LM_USERS u 
       WHERE u.USER_ID LIKE ? OR u.USERNAME LIKE ?
       ORDER BY MARKER_COUNT DESC
       LIMIT 5`,
      [searchTerm, searchTerm]
    );

    res.status(200).json({
      markers: markers.map(convertMarkerToCamelCase),
      users: users.map(convertUserToCamelCase),
    });
  } catch (error) {
    sendError(res, 500, '검색에 실패했습니다.', error);
  }
};

/**
 * 인기 마커 조회 (좋아요 순)
 * GET /api/search/popular?page=1&limit=20
 */
exports.getPopularMarkers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [markers] = await pool.query(
      `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL 
       FROM LM_MARKERS m 
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID 
       WHERE m.IS_PUBLIC = TRUE
       ORDER BY m.LIKE_COUNT DESC, m.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM LM_MARKERS WHERE IS_PUBLIC = TRUE'
    );

    res.status(200).json({
      markers: markers.map(convertMarkerToCamelCase),
      totalCount: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '인기 마커 조회에 실패했습니다.', error);
  }
};

/**
 * 주변 마커 조회 (위치 기반)
 * GET /api/search/nearby?lat=35.123&lng=129.123&radius=5
 */
exports.getNearbyMarkers = async (req, res) => {
  const { lat, lng, radius = 5, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  if (!lat || !lng) {
    return res.status(400).json({ message: '위치 정보가 필요합니다.' });
  }

  try {
    // Haversine 공식을 사용한 거리 계산 (단위: km)
    const [markers] = await pool.query(
      `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL,
              (6371 * acos(cos(radians(?)) * cos(radians(m.LATITUDE)) * cos(radians(m.LONGITUDE) - radians(?)) + sin(radians(?)) * sin(radians(m.LATITUDE)))) AS distance
       FROM LM_MARKERS m 
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID 
       WHERE m.IS_PUBLIC = TRUE
       HAVING distance < ?
       ORDER BY distance ASC
       LIMIT ? OFFSET ?`,
      [parseFloat(lat), parseFloat(lng), parseFloat(lat), parseFloat(radius), parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      markers: markers.map((marker) => ({
        ...convertMarkerToCamelCase(marker),
        distance: Math.round(marker.distance * 100) / 100, // 소수점 2자리
      })),
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: parseFloat(radius),
    });
  } catch (error) {
    sendError(res, 500, '주변 마커 조회에 실패했습니다.', error);
  }
};

