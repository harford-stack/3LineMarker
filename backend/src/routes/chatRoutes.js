const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// 채팅방 조회 또는 생성
router.get('/room', protect, chatController.getOrCreateChatRoom);

// 채팅방 목록 조회
router.get('/rooms', protect, chatController.getChatRooms);

// 메시지 전송
router.post('/messages', protect, chatController.sendMessage);

// 메시지 목록 조회
router.get('/messages', protect, chatController.getMessages);

// 메시지 읽음 처리
router.put('/messages/read', protect, chatController.markMessagesAsRead);

// 채팅방 삭제
router.delete('/rooms/:roomId', protect, chatController.deleteChatRoom);

module.exports = router;
