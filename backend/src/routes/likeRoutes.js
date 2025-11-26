// backend/src/routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// 좋아요 토글 (로그인 필수)
router.post('/:markerId', protect, likeController.toggleLike);

// 좋아요 상태 조회 (로그인 선택)
router.get('/:markerId', optionalProtect, likeController.getLikeStatus);

// 여러 마커의 좋아요 상태 일괄 조회 (로그인 선택)
router.post('/batch', optionalProtect, likeController.getBatchLikeStatus);

module.exports = router;

