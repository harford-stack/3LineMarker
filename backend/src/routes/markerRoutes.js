const express = require('express');
const router = express.Router();
const markerController = require('../controllers/markerController');

// ✅ authMiddleware 모듈에서 'protect' 함수만 구조 분해 할당하여 가져오기!
const { protect } = require('../middlewares/authMiddleware'); 
// OR
// const authMiddleware = require('../middlewares/authMiddleware');
// const protect = authMiddleware.protect;


// ✅ 새 마커 생성 (인증된 사용자만 가능)
// 이제 'protect' 변수는 직접 함수를 가리킵니다.
router.post('/', protect, markerController.createMarker); // ✅ protect 변수 사용!

// ✅ 필요하다면 모든 마커 조회 라우트도 여기에 추가
router.get('/', protect, markerController.getAllMarkers);

module.exports = router;