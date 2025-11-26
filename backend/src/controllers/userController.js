// backend/src/controllers/userController.js
const pool = require('../config/database');
const { getImageUrl, deleteImage } = require('../utils/uploadUtils');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 사용자 프로필 camelCase 변환
const convertUserToCamelCase = (user) => ({
  userId: user.USER_ID,
  username: user.USERNAME,
  profileImageUrl: user.PROFILE_IMAGE_URL,
  statusMessage: user.STATUS_MESSAGE,
  createdAt: user.CREATED_AT,
});

// 마커 camelCase 변환
const convertMarkerToCamelCase = (marker) => ({
  markerId: marker.MARKER_ID,
  userId: marker.USER_ID,
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
});

/**
 * 사용자 프로필 조회
 * GET /api/users/:userId
 */
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user?.user_id;

  try {
    // 사용자 기본 정보 조회
    const [users] = await pool.query(
      'SELECT USER_ID, USERNAME, PROFILE_IMAGE_URL, STATUS_MESSAGE, CREATED_AT FROM LM_USERS WHERE USER_ID = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }

    const user = convertUserToCamelCase(users[0]);

    // 팔로워/팔로잉 수 조회
    const [followerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWING_ID = ?',
      [userId]
    );
    const [followingCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?',
      [userId]
    );

    // 마커 수 조회
    const [markerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_MARKERS WHERE USER_ID = ? AND IS_PUBLIC = TRUE',
      [userId]
    );

    // 팔로우 상태 확인
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const [follow] = await pool.query(
        'SELECT FOLLOW_ID FROM LM_FOLLOWS WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?',
        [currentUserId, userId]
      );
      isFollowing = follow.length > 0;
    }

    res.status(200).json({
      user: {
        ...user,
        followerCount: followerCount[0].count,
        followingCount: followingCount[0].count,
        markerCount: markerCount[0].count,
        isFollowing,
        isOwner: currentUserId === userId,
      },
    });
  } catch (error) {
    sendError(res, 500, '프로필 조회에 실패했습니다.', error);
  }
};

/**
 * 내 프로필 조회
 * GET /api/users/me
 */
exports.getMyProfile = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [users] = await pool.query(
      'SELECT USER_ID, USERNAME, PROFILE_IMAGE_URL, STATUS_MESSAGE, CREATED_AT FROM LM_USERS WHERE USER_ID = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });
    }

    const user = convertUserToCamelCase(users[0]);

    // 팔로워/팔로잉 수 조회
    const [followerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWING_ID = ?',
      [userId]
    );
    const [followingCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_FOLLOWS WHERE FOLLOWER_ID = ?',
      [userId]
    );

    // 마커 수 조회 (비공개 포함)
    const [markerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM LM_MARKERS WHERE USER_ID = ?',
      [userId]
    );

    res.status(200).json({
      user: {
        ...user,
        followerCount: followerCount[0].count,
        followingCount: followingCount[0].count,
        markerCount: markerCount[0].count,
      },
    });
  } catch (error) {
    sendError(res, 500, '프로필 조회에 실패했습니다.', error);
  }
};

/**
 * 프로필 수정
 * PUT /api/users/me
 */
exports.updateMyProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { username, statusMessage } = req.body;

  try {
    // 닉네임 유효성 검사
    if (username !== undefined) {
      if (!username || username.trim().length < 2) {
        return res.status(400).json({ message: '닉네임은 2자 이상이어야 합니다.' });
      }
      if (username.trim().length > 100) {
        return res.status(400).json({ message: '닉네임은 100자 이하여야 합니다.' });
      }
    }

    // 상태 메시지 유효성 검사
    if (statusMessage !== undefined && statusMessage.length > 200) {
      return res.status(400).json({ message: '상태 메시지는 200자 이하여야 합니다.' });
    }

    // 업데이트할 필드 구성
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('USERNAME = ?');
      values.push(username.trim());
    }
    if (statusMessage !== undefined) {
      updates.push('STATUS_MESSAGE = ?');
      values.push(statusMessage);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: '수정할 정보가 없습니다.' });
    }

    values.push(userId);

    await pool.query(
      `UPDATE LM_USERS SET ${updates.join(', ')}, UPDATED_AT = CURRENT_TIMESTAMP WHERE USER_ID = ?`,
      values
    );

    // 업데이트된 프로필 조회
    const [users] = await pool.query(
      'SELECT USER_ID, USERNAME, PROFILE_IMAGE_URL, STATUS_MESSAGE, CREATED_AT FROM LM_USERS WHERE USER_ID = ?',
      [userId]
    );

    res.status(200).json({
      message: '프로필이 수정되었습니다.',
      user: convertUserToCamelCase(users[0]),
    });
  } catch (error) {
    sendError(res, 500, '프로필 수정에 실패했습니다.', error);
  }
};

/**
 * 프로필 이미지 업로드
 * POST /api/users/me/profile-image
 */
exports.uploadProfileImage = async (req, res) => {
  const userId = req.user.user_id;

  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imageUrl = getImageUrl(req.file.filename);

    // 기존 프로필 이미지 조회
    const [users] = await pool.query(
      'SELECT PROFILE_IMAGE_URL FROM LM_USERS WHERE USER_ID = ?',
      [userId]
    );

    // 기존 이미지가 기본 이미지가 아니면 삭제
    const oldImageUrl = users[0]?.PROFILE_IMAGE_URL;
    if (oldImageUrl && !oldImageUrl.includes('default_profile')) {
      deleteImage(oldImageUrl);
    }

    // 새 이미지 URL 저장
    await pool.query(
      'UPDATE LM_USERS SET PROFILE_IMAGE_URL = ?, UPDATED_AT = CURRENT_TIMESTAMP WHERE USER_ID = ?',
      [imageUrl, userId]
    );

    res.status(200).json({
      message: '프로필 이미지가 업로드되었습니다.',
      profileImageUrl: imageUrl,
    });
  } catch (error) {
    sendError(res, 500, '프로필 이미지 업로드에 실패했습니다.', error);
  }
};

/**
 * 사용자의 마커 목록 조회
 * GET /api/users/:userId/markers
 */
exports.getUserMarkers = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user?.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 본인인 경우 비공개 마커도 포함
    const isOwner = currentUserId === userId;
    const publicCondition = isOwner ? '' : 'AND IS_PUBLIC = TRUE';

    const [markers] = await pool.query(
      `SELECT * FROM LM_MARKERS 
       WHERE USER_ID = ? ${publicCondition}
       ORDER BY CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [totalCount] = await pool.query(
      `SELECT COUNT(*) as count FROM LM_MARKERS WHERE USER_ID = ? ${publicCondition}`,
      [userId]
    );

    res.status(200).json({
      markers: markers.map(convertMarkerToCamelCase),
      totalCount: totalCount[0].count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '마커 목록 조회에 실패했습니다.', error);
  }
};

