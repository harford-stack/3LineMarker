// backend/src/controllers/bookmarkController.js
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
  bookmarkedAt: marker.BOOKMARKED_AT,
});

/**
 * 북마크 토글 (추가/삭제)
 * POST /api/bookmarks/:markerId
 */
exports.toggleBookmark = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user.user_id;

  try {
    // 마커 존재 여부 확인
    const [markers] = await pool.query(
      'SELECT MARKER_ID FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    if (markers.length === 0) {
      return res.status(404).json({ message: '해당 마커를 찾을 수 없습니다.' });
    }

    // 기존 북마크 확인
    const [existingBookmarks] = await pool.query(
      'SELECT BOOKMARK_ID FROM LM_BOOKMARKS WHERE MARKER_ID = ? AND USER_ID = ?',
      [markerId, userId]
    );

    let isBookmarked;

    if (existingBookmarks.length > 0) {
      // 북마크 삭제
      await pool.query(
        'DELETE FROM LM_BOOKMARKS WHERE MARKER_ID = ? AND USER_ID = ?',
        [markerId, userId]
      );
      isBookmarked = false;
    } else {
      // 북마크 추가
      await pool.query(
        'INSERT INTO LM_BOOKMARKS (MARKER_ID, USER_ID) VALUES (?, ?)',
        [markerId, userId]
      );
      isBookmarked = true;
    }

    res.status(200).json({
      message: isBookmarked ? '북마크에 추가되었습니다.' : '북마크가 해제되었습니다.',
      isBookmarked,
    });
  } catch (error) {
    sendError(res, 500, '북마크 처리에 실패했습니다.', error);
  }
};

/**
 * 북마크 상태 확인
 * GET /api/bookmarks/:markerId/status
 */
exports.getBookmarkStatus = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user.user_id;

  try {
    const [bookmarks] = await pool.query(
      'SELECT BOOKMARK_ID FROM LM_BOOKMARKS WHERE MARKER_ID = ? AND USER_ID = ?',
      [markerId, userId]
    );

    res.status(200).json({
      isBookmarked: bookmarks.length > 0,
    });
  } catch (error) {
    sendError(res, 500, '북마크 상태 조회에 실패했습니다.', error);
  }
};

/**
 * 내 북마크 목록 조회
 * GET /api/bookmarks
 */
exports.getMyBookmarks = async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [bookmarks] = await pool.query(
      `SELECT m.*, u.USERNAME, u.PROFILE_IMAGE_URL, b.CREATED_AT as BOOKMARKED_AT
       FROM LM_BOOKMARKS b
       JOIN LM_MARKERS m ON b.MARKER_ID = m.MARKER_ID
       JOIN LM_USERS u ON m.USER_ID = u.USER_ID
       WHERE b.USER_ID = ?
       ORDER BY b.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM LM_BOOKMARKS WHERE USER_ID = ?',
      [userId]
    );

    res.status(200).json({
      bookmarks: bookmarks.map(convertMarkerToCamelCase),
      totalCount: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '북마크 목록 조회에 실패했습니다.', error);
  }
};

/**
 * 여러 마커의 북마크 상태 일괄 조회
 * POST /api/bookmarks/batch
 */
exports.getBatchBookmarkStatus = async (req, res) => {
  const { markerIds } = req.body;
  const userId = req.user.user_id;

  if (!Array.isArray(markerIds) || markerIds.length === 0) {
    return res.status(400).json({ message: '마커 ID 목록이 필요합니다.' });
  }

  try {
    const [bookmarks] = await pool.query(
      'SELECT MARKER_ID FROM LM_BOOKMARKS WHERE USER_ID = ? AND MARKER_ID IN (?)',
      [userId, markerIds]
    );

    res.status(200).json({
      bookmarkedMarkerIds: bookmarks.map(b => b.MARKER_ID),
    });
  } catch (error) {
    sendError(res, 500, '북마크 상태 조회에 실패했습니다.', error);
  }
};

