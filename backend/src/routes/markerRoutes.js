// backend/src/routes/markerRoutes.js
const express = require('express');
const router = express.Router();
const markerController = require('../controllers/markerController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/uploadUtils');

// 마커 CRUD (모든 라우트는 인증 필요)
router.post('/', protect, markerController.createMarker);       // 생성
router.get('/', protect, markerController.getAllMarkers);       // 전체 조회
router.put('/:markerId', protect, markerController.updateMarker);    // 수정
router.delete('/:markerId', protect, markerController.deleteMarker); // 삭제

// 이미지 업로드 (마커용)
router.post('/upload-image', protect, upload.single('image'), markerController.uploadMarkerImage);

module.exports = router;
