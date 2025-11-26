// backend/src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// 댓글 작성 (로그인 필수)
router.post('/:markerId', protect, commentController.createComment);

// 댓글 목록 조회 (로그인 선택)
router.get('/:markerId', optionalProtect, commentController.getComments);

// 댓글 삭제 (로그인 필수)
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;

