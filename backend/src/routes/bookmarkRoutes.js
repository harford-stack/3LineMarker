// backend/src/routes/bookmarkRoutes.js
const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middlewares/authMiddleware');

// 모든 라우트는 로그인 필수
router.use(protect);

// 내 북마크 목록 조회
router.get('/', bookmarkController.getMyBookmarks);

// 여러 마커 북마크 상태 일괄 조회
router.post('/batch', bookmarkController.getBatchBookmarkStatus);

// 북마크 토글
router.post('/:markerId', bookmarkController.toggleBookmark);

// 북마크 상태 확인
router.get('/:markerId/status', bookmarkController.getBookmarkStatus);

module.exports = router;

