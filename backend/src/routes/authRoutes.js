const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ✅ 컨트롤러 임포트

// ✅ 회원가입 라우트
router.post('/register', authController.register);
// POST /api/auth/register 요청이 들어오면 authController.register 함수 실행

// ✅ 로그인 라우트
router.post('/login', authController.login);

module.exports = router;