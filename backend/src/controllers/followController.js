// backend/src/controllers/followController.js
const pool = require('../config/database');
const { createNotification } = require('./notificationController');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 사용자 객체 camelCase 변환
const convertUserToCamelCase = (user) => ({
  userId: user.USER_ID,
  username: user.USERNAME,
  profileImageUrl: user.PROFILE_IMAGE_URL,
  statusMessage: user.STATUS_MESSAGE,
});

/**
 * 팔로우/언팔로우 토글
 * POST /api/follows/:userId
 */
exports.toggleFollow = async (req, res) => {
  const { userId: targetUserId } = req.params;
  const currentUserId = req.user.user_id;

  // 자기 자신을 팔로우할 수 없음
  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: '자기 자신을 팔로우할 수 없습니다.' });
  }

  try {
    // 대상 사용자 존재 확인
    const [users] = await pool.query(
      'SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?',
      [targetUserId]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }

    // 기존 팔로우 관계 확인
    const [existingFollow] = await pool.query(
      'SELECT FOLLOW_ID FROM LM_FOLLOWS WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?',
      [currentUserId, targetUserId]
    );

    let isFollowing;

    if (existingFollow.length > 0) {
      // 언팔로우
      await pool.query(
        'DELETE FROM LM_FOLLOWS WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?',
        [currentUserId, targetUserId]
      );
      isFollowing = false;
    } else {
      // 팔로우
      await pool.query(
        'INSERT INTO LM_FOLLOWS (FOLLOWER_ID, FOLLOWING_ID) VALUES (?, ?)',
        [currentUserId, targetUserId]
      );
      isFollowing = true;

      // 알림 생성 (팔로우 당한 사용자에게)
      await createNotification(targetUserId, 'FOLLOW', currentUserId);
    }

    // 업데이트된 팔로워 수 조회
    const [followerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWING_ID = ?',
      [targetUserId]
    );

    res.status(200).json({
      message: isFollowing ? '팔로우했습니다.' : '언팔로우했습니다.',
      isFollowing,
      followerCount: followerCount[0].count,
    });
  } catch (error) {
    sendError(res, 500, '팔로우 처리에 실패했습니다.', error);
  }
};

/**
 * 팔로우 상태 확인
 * GET /api/follows/:userId/status
 */
exports.getFollowStatus = async (req, res) => {
  const { userId: targetUserId } = req.params;
  const currentUserId = req.user?.user_id;

  try {
    let isFollowing = false;

    if (currentUserId && currentUserId !== targetUserId) {
      const [follow] = await pool.query(
        'SELECT FOLLOW_ID FROM LM_FOLLOWS WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?',
        [currentUserId, targetUserId]
      );
      isFollowing = follow.length > 0;
    }

    // 팔로워/팔로잉 수 조회
    const [followerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWING_ID = ?',
      [targetUserId]
    );
    const [followingCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?',
      [targetUserId]
    );

    res.status(200).json({
      isFollowing,
      followerCount: followerCount[0].count,
      followingCount: followingCount[0].count,
    });
  } catch (error) {
    sendError(res, 500, '팔로우 상태 조회에 실패했습니다.', error);
  }
};

/**
 * 팔로워 목록 조회
 * GET /api/follows/:userId/followers
 */
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 팔로워 목록 조회
    const [followers] = await pool.query(
      `SELECT u.USER_ID, u.USERNAME, u.PROFILE_IMAGE_URL, u.STATUS_MESSAGE, f.CREATED_AT as FOLLOWED_AT
       FROM LM_FOLLOWS f
       JOIN LM_USERS u ON f.FOLLOWER_ID = u.USER_ID
       WHERE f.FOLLOWING_ID = ?
       ORDER BY f.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // 전체 팔로워 수 조회
    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWING_ID = ?',
      [userId]
    );

    res.status(200).json({
      followers: followers.map((f) => ({
        ...convertUserToCamelCase(f),
        followedAt: f.FOLLOWED_AT,
      })),
      totalCount: totalCount[0].count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '팔로워 목록 조회에 실패했습니다.', error);
  }
};

/**
 * 팔로잉 목록 조회
 * GET /api/follows/:userId/following
 */
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 팔로잉 목록 조회
    const [following] = await pool.query(
      `SELECT u.USER_ID, u.USERNAME, u.PROFILE_IMAGE_URL, u.STATUS_MESSAGE, f.CREATED_AT as FOLLOWED_AT
       FROM LM_FOLLOWS f
       JOIN LM_USERS u ON f.FOLLOWING_ID = u.USER_ID
       WHERE f.FOLLOWER_ID = ?
       ORDER BY f.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // 전체 팔로잉 수 조회
    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?',
      [userId]
    );

    res.status(200).json({
      following: following.map((f) => ({
        ...convertUserToCamelCase(f),
        followedAt: f.FOLLOWED_AT,
      })),
      totalCount: totalCount[0].count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '팔로잉 목록 조회에 실패했습니다.', error);
  }
};

