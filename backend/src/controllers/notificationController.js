// backend/src/controllers/notificationController.js
const pool = require('../config/database');

// 공통 에러 응답 함수
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error?.message || '');
  res.status(statusCode).json({ message, error: error?.message });
};

// 알림 객체 camelCase 변환
const convertNotificationToCamelCase = (notification) => ({
  notificationId: notification.NOTIFICATION_ID,
  userId: notification.USER_ID,
  type: notification.TYPE,
  actorId: notification.ACTOR_ID,
  actorUsername: notification.ACTOR_USERNAME,
  actorProfileImageUrl: notification.ACTOR_PROFILE_IMAGE_URL,
  markerId: notification.MARKER_ID,
  markerLine1: notification.MARKER_LINE1,
  isRead: notification.IS_READ === 1,
  createdAt: notification.CREATED_AT,
});

/**
 * 알림 생성 (내부 함수 - 다른 컨트롤러에서 호출)
 */
const createNotification = async (userId, type, actorId, markerId = null) => {
  // 자기 자신에게는 알림을 보내지 않음
  if (userId === actorId) {
    console.log(`[createNotification] 자기 자신에게는 알림을 보내지 않음: ${userId}`);
    return;
  }

  try {
    console.log(`[createNotification] 알림 생성 시도: userId=${userId}, type=${type}, actorId=${actorId}, markerId=${markerId}`);
    const [result] = await pool.query(
      'INSERT INTO LM_NOTIFICATIONS (USER_ID, TYPE, ACTOR_ID, MARKER_ID) VALUES (?, ?, ?, ?)',
      [userId, type, actorId, markerId]
    );
    console.log(`[createNotification] 알림 생성 성공: notificationId=${result.insertId}`);
  } catch (error) {
    console.error('[createNotification] 알림 생성 실패:', error.message);
    console.error('[createNotification] 알림 생성 실패 상세:', error);
  }
};

/**
 * 알림 목록 조회
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = 'WHERE n.USER_ID = ?';
    const params = [userId];

    if (unreadOnly === 'true') {
      whereClause += ' AND n.IS_READ = FALSE';
    }

    const [notifications] = await pool.query(
      `SELECT n.*, 
              u.USERNAME as ACTOR_USERNAME, 
              u.PROFILE_IMAGE_URL as ACTOR_PROFILE_IMAGE_URL,
              m.LINE1 as MARKER_LINE1
       FROM LM_NOTIFICATIONS n
       JOIN LM_USERS u ON n.ACTOR_ID = u.USER_ID
       LEFT JOIN LM_MARKERS m ON n.MARKER_ID = m.MARKER_ID
       ${whereClause}
       ORDER BY n.CREATED_AT DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // 전체 개수 및 읽지 않은 개수 조회
    const [totalResult] = await pool.query(
      'SELECT COUNT(*) as total FROM LM_NOTIFICATIONS WHERE USER_ID = ?',
      [userId]
    );
    const [unreadResult] = await pool.query(
      'SELECT COUNT(*) as unread FROM LM_NOTIFICATIONS WHERE USER_ID = ? AND IS_READ = FALSE',
      [userId]
    );

    res.status(200).json({
      notifications: notifications.map(convertNotificationToCamelCase),
      totalCount: totalResult[0].total,
      unreadCount: unreadResult[0].unread,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    sendError(res, 500, '알림 조회에 실패했습니다.', error);
  }
};

/**
 * 읽지 않은 알림 수 조회
 * GET /api/notifications/unread-count?type=CHAT (선택적)
 */
exports.getUnreadCount = async (req, res) => {
  const userId = req.user.user_id;
  const { type } = req.query; // type 파라미터 (예: 'CHAT')

  try {
    let query = 'SELECT COUNT(*) as count FROM LM_NOTIFICATIONS WHERE USER_ID = ? AND IS_READ = FALSE';
    const params = [userId];

    // 특정 타입의 알림만 조회하는 경우
    if (type) {
      query += ' AND TYPE = ?';
      params.push(type);
    }

    const [result] = await pool.query(query, params);

    res.status(200).json({
      unreadCount: result[0].count,
    });
  } catch (error) {
    sendError(res, 500, '알림 수 조회에 실패했습니다.', error);
  }
};

/**
 * 알림 읽음 처리
 * PUT /api/notifications/:notificationId/read
 */
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.user_id;

  try {
    const [result] = await pool.query(
      'UPDATE LM_NOTIFICATIONS SET IS_READ = TRUE WHERE NOTIFICATION_ID = ? AND USER_ID = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '해당 알림을 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '알림을 읽음 처리했습니다.' });
  } catch (error) {
    sendError(res, 500, '알림 읽음 처리에 실패했습니다.', error);
  }
};

/**
 * 모든 알림 읽음 처리
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  const userId = req.user.user_id;

  try {
    await pool.query(
      'UPDATE LM_NOTIFICATIONS SET IS_READ = TRUE WHERE USER_ID = ? AND IS_READ = FALSE',
      [userId]
    );

    res.status(200).json({ message: '모든 알림을 읽음 처리했습니다.' });
  } catch (error) {
    sendError(res, 500, '알림 읽음 처리에 실패했습니다.', error);
  }
};

/**
 * 알림 삭제
 * DELETE /api/notifications/:notificationId
 */
exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.user_id;

  try {
    const [result] = await pool.query(
      'DELETE FROM LM_NOTIFICATIONS WHERE NOTIFICATION_ID = ? AND USER_ID = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '해당 알림을 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    sendError(res, 500, '알림 삭제에 실패했습니다.', error);
  }
};

// 알림 생성 함수 내보내기 (다른 컨트롤러에서 사용)
exports.createNotification = createNotification;

