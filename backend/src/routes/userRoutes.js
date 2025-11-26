// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/uploadUtils');

// 내 프로필 조회 (로그인 필수) - 이 라우트가 /:userId보다 먼저 와야 함
router.get('/me', protect, userController.getMyProfile);

// 프로필 수정 (로그인 필수)
router.put('/me', protect, userController.updateMyProfile);

// 프로필 이미지 업로드 (로그인 필수)
router.post('/me/profile-image', protect, upload.single('image'), userController.uploadProfileImage);

// 사용자 프로필 조회 (로그인 선택)
router.get('/:userId', optionalProtect, userController.getUserProfile);

// 사용자의 마커 목록 조회 (로그인 선택)
router.get('/:userId/markers', optionalProtect, userController.getUserMarkers);

module.exports = router;
