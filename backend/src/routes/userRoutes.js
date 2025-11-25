// src/routes/userRoutes.js (임시 내용)
const express = require('express');
const router = express.Router();
router.get('/test', (req, res) => { res.send('User router is working!'); });
module.exports = router;