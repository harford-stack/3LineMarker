const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('토큰에서 디코드된 ID:', decoded.id);
      
      // ✅ 디코드된 토큰의 ID(로그인 시 user_id로 저장했음)를 사용하여 사용자 정보를 조회
      //    이 조회된 사용자 객체(user_id, username 등)를 req.user에 저장합니다.
      const [rows] = await pool.query('SELECT user_id, username FROM LM_USERS WHERE user_id = ?', [decoded.id]); // decoded.id로 접근

      if (rows.length === 0) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다: 사용자를 찾을 수 없음' });
      }

      req.user = rows[0]; // ✅ 조회된 {user_id, username} 객체를 통째로 req.user에 저장!
      next();

    } catch (error) {
      console.error('토큰 검증 오류:', error);
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      res.status(401).json({ message: '유효하지 않은 토큰입니다: ' + error.message });
    }
  } else {
    res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
  }
};