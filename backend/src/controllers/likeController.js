// backend/src/controllers/likeController.js
const pool = require('../config/database');
const { createNotification } = require('./notificationController');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

/**
 * 좋아요 토글 (좋아요/취소)
 * POST /api/likes/:markerId
 */
exports.toggleLike = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user.user_id;

  try {
    // 마커 존재 여부 및 작성자 확인
    const [markers] = await pool.query(
      'SELECT MARKER_ID, USER_ID FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    if (markers.length === 0) {
      return res.status(404).json({ message: '해당 마커를 찾을 수 없습니다.' });
    }
    const markerOwnerId = markers[0].USER_ID;

    // 기존 좋아요 확인
    const [existingLikes] = await pool.query(
      'SELECT LIKE_ID FROM LM_LIKES WHERE MARKER_ID = ? AND USER_ID = ?',
      [markerId, userId]
    );

    let isLiked;
    let likeCount;

    if (existingLikes.length > 0) {
      // 좋아요 취소
      await pool.query(
        'DELETE FROM LM_LIKES WHERE MARKER_ID = ? AND USER_ID = ?',
        [markerId, userId]
      );
      await pool.query(
        'UPDATE LM_MARKERS SET LIKE_COUNT = GREATEST(LIKE_COUNT - 1, 0) WHERE MARKER_ID = ?',
        [markerId]
      );
      isLiked = false;
    } else {
      // 좋아요 추가
      await pool.query(
        'INSERT INTO LM_LIKES (MARKER_ID, USER_ID) VALUES (?, ?)',
        [markerId, userId]
      );
      await pool.query(
        'UPDATE LM_MARKERS SET LIKE_COUNT = LIKE_COUNT + 1 WHERE MARKER_ID = ?',
        [markerId]
      );
      isLiked = true;

      // 알림 생성 (마커 작성자에게)
      await createNotification(markerOwnerId, 'LIKE', userId, parseInt(markerId));
    }

    // 업데이트된 좋아요 수 조회
    const [updatedMarker] = await pool.query(
      'SELECT LIKE_COUNT FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    likeCount = updatedMarker[0].LIKE_COUNT;

    res.status(200).json({
      message: isLiked ? '좋아요가 추가되었습니다.' : '좋아요가 취소되었습니다.',
      isLiked,
      likeCount,
    });
  } catch (error) {
    sendError(res, 500, '좋아요 처리에 실패했습니다.', error);
  }
};

/**
 * 마커의 좋아요 상태 조회
 * GET /api/likes/:markerId
 */
exports.getLikeStatus = async (req, res) => {
  const { markerId } = req.params;
  const userId = req.user?.user_id;

  try {
    // 마커 좋아요 수 조회
    const [markers] = await pool.query(
      'SELECT LIKE_COUNT FROM LM_MARKERS WHERE MARKER_ID = ?',
      [markerId]
    );
    if (markers.length === 0) {
      return res.status(404).json({ message: '해당 마커를 찾을 수 없습니다.' });
    }

    // 사용자 좋아요 여부 확인 (로그인한 경우)
    let isLiked = false;
    if (userId) {
      const [userLikes] = await pool.query(
        'SELECT LIKE_ID FROM LM_LIKES WHERE MARKER_ID = ? AND USER_ID = ?',
        [markerId, userId]
      );
      isLiked = userLikes.length > 0;
    }

    res.status(200).json({
      likeCount: markers[0].LIKE_COUNT,
      isLiked,
    });
  } catch (error) {
    sendError(res, 500, '좋아요 상태 조회에 실패했습니다.', error);
  }
};

/**
 * 마커 목록의 좋아요 상태 일괄 조회
 * POST /api/likes/batch
 */
exports.getBatchLikeStatus = async (req, res) => {
  const { markerIds } = req.body;
  const userId = req.user?.user_id;

  if (!Array.isArray(markerIds) || markerIds.length === 0) {
    return res.status(400).json({ message: '마커 ID 목록이 필요합니다.' });
  }

  try {
    // 사용자의 좋아요 목록 조회
    let userLikes = [];
    if (userId) {
      const [likes] = await pool.query(
        'SELECT MARKER_ID FROM LM_LIKES WHERE USER_ID = ? AND MARKER_ID IN (?)',
        [userId, markerIds]
      );
      userLikes = likes.map(like => like.MARKER_ID);
    }

    res.status(200).json({
      likedMarkerIds: userLikes,
    });
  } catch (error) {
    sendError(res, 500, '좋아요 상태 조회에 실패했습니다.', error);
  }
};

