// backend/src/routes/followRoutes.js
const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// 팔로우/언팔로우 토글 (로그인 필수)
router.post('/:userId', protect, followController.toggleFollow);

// 팔로우 상태 확인 (로그인 선택)
router.get('/:userId/status', optionalProtect, followController.getFollowStatus);

// 팔로워 목록 조회
router.get('/:userId/followers', optionalProtect, followController.getFollowers);

// 팔로잉 목록 조회
router.get('/:userId/following', optionalProtect, followController.getFollowing);

module.exports = router;

