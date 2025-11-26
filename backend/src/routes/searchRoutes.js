// backend/src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { optionalProtect } = require('../middlewares/authMiddleware');

// 통합 검색 (마커 + 사용자)
router.get('/', optionalProtect, searchController.searchAll);

// 마커 검색
router.get('/markers', optionalProtect, searchController.searchMarkers);

// 사용자 검색
router.get('/users', optionalProtect, searchController.searchUsers);

// 인기 마커 조회
router.get('/popular', optionalProtect, searchController.getPopularMarkers);

// 주변 마커 조회
router.get('/nearby', optionalProtect, searchController.getNearbyMarkers);

module.exports = router;
