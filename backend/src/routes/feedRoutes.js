// backend/src/routes/feedRoutes.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// 내 피드 (팔로우한 사람들의 마커) - 로그인 필수
router.get('/', protect, feedController.getFeed);

// 탐색 피드 (모든 공개 마커) - 로그인 선택
router.get('/explore', optionalProtect, feedController.getExploreFeed);

module.exports = router;

