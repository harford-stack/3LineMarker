// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// 모든 라우트는 로그인 필수
router.use(protect);

// 알림 목록 조회
router.get('/', notificationController.getNotifications);

// 읽지 않은 알림 수 조회
router.get('/unread-count', notificationController.getUnreadCount);

// 모든 알림 읽음 처리
router.put('/read-all', notificationController.markAllAsRead);

// 특정 알림 읽음 처리
router.put('/:notificationId/read', notificationController.markAsRead);

// 알림 삭제
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;

