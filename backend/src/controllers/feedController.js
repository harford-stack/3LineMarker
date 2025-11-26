// backend/src/controllers/feedController.js
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
  isLiked: marker.IS_LIKED === 1,
  isBookmarked: marker.IS_BOOKMARKED === 1,
});

/**
 * 피드 조회 (팔로우한 사용자들의 마커)
 * GET /api/feed
 */
exports.getFeed = async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 팔로우한 사용자들의 마커 조회 (최신순)
    const [markers] = await pool.query(
      `SELECT m.*, 
              u.USERNAME, u.PROFILE_IMAGE_URL,
              IF(l.LIKE_ID IS NOT NULL, 1, 0) as IS_LIKED,
              IF(b.BOOKMARK_ID IS NOT NULL, 1, 0) as IS_BOOKMARKED
       FROM LM_MARKERS m
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID
       JOIN LM_FOLLOWS f ON m.USER_ID = f.FOLLOWING_ID AND f.FOLLOWER_ID = ?
       LEFT JOIN LM_LIKES l ON m.MARKER_ID = l.MARKER_ID AND l.USER_ID = ?
       LEFT JOIN LM_BOOKMARKS b ON m.MARKER_ID = b.MARKER_ID AND b.USER_ID = ?
       WHERE m.IS_PUBLIC = TRUE
       ORDER BY m.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, userId, parseInt(limit), parseInt(offset)]
    );

    // 전체 개수 조회
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM LM_MARKERS m
       JOIN LM_FOLLOWS f ON m.USER_ID = f.FOLLOWING_ID AND f.FOLLOWER_ID = ?
       WHERE m.IS_PUBLIC = TRUE`,
      [userId]
    );

    res.status(200).json({
      markers: markers.map(convertMarkerToCamelCase),
      totalCount: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '피드 조회에 실패했습니다.', error);
  }
};

/**
 * 모든 공개 마커 피드 (탐색용)
 * GET /api/feed/explore
 */
exports.getExploreFeed = async (req, res) => {
  const userId = req.user?.user_id;
  const { page = 1, limit = 20, sort = 'recent' } = req.query;
  const offset = (page - 1) * limit;

  let orderBy = 'm.CREATED_AT DESC';
  if (sort === 'popular') {
    orderBy = 'm.LIKE_COUNT DESC, m.CREATED_AT DESC';
  }

  try {
    let query;
    let params;

    if (userId) {
      query = `SELECT m.*, 
                      u.USERNAME, u.PROFILE_IMAGE_URL,
                      IF(l.LIKE_ID IS NOT NULL, 1, 0) as IS_LIKED,
                      IF(b.BOOKMARK_ID IS NOT NULL, 1, 0) as IS_BOOKMARKED
               FROM LM_MARKERS m
               JOIN LM_USERS u ON m.USER_ID = u.USER_ID
               LEFT JOIN LM_LIKES l ON m.MARKER_ID = l.MARKER_ID AND l.USER_ID = ?
               LEFT JOIN LM_BOOKMARKS b ON m.MARKER_ID = b.MARKER_ID AND b.USER_ID = ?
               WHERE m.IS_PUBLIC = TRUE
               ORDER BY ${orderBy}
               LIMIT ? OFFSET ?`;
      params = [userId, userId, parseInt(limit), parseInt(offset)];
    } else {
      query = `SELECT m.*, 
                      u.USERNAME, u.PROFILE_IMAGE_URL,
                      0 as IS_LIKED,
                      0 as IS_BOOKMARKED
               FROM LM_MARKERS m
               JOIN LM_USERS u ON m.USER_ID = u.USER_ID
               WHERE m.IS_PUBLIC = TRUE
               ORDER BY ${orderBy}
               LIMIT ? OFFSET ?`;
      params = [parseInt(limit), parseInt(offset)];
    }

    const [markers] = await pool.query(query, params);

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
    sendError(res, 500, '탐색 피드 조회에 실패했습니다.', error);
  }
};

