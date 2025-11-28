// backend/src/routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// 날씨 정보 조회 (인증 불필요)
router.get('/', weatherController.getWeather);

module.exports = router;

