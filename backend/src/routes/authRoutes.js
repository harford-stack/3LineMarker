const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ 회원가입 라우트
router.post('/register', authController.register);

// ✅ 로그인 라우트
router.post('/login', authController.login);

// ✅ 이메일 중복 확인
router.get('/check-email', authController.checkEmail);

// ✅ 아이디 찾기 (이메일로 조회)
router.post('/find-id', authController.findUserId);

// ✅ 아이디 찾기 - 전체 아이디 발송
router.post('/send-id', authController.sendUserIdByEmail);

// ✅ 비밀번호 찾기 - 재설정 토큰 요청
router.post('/request-reset', authController.requestPasswordReset);

// ✅ 비밀번호 재설정
router.post('/reset-password', authController.resetPassword);

module.exports = router;
