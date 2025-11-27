const { verifyToken } = require('../config/jwt');
const pool = require('../config/database');

/**
 * 인증 필수 미들웨어
 * 토큰이 없거나 유효하지 않으면 401 에러 반환
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
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

/**
 * 인증 선택 미들웨어
 * 토큰이 있으면 인증 시도, 없어도 다음 미들웨어로 진행
 * req.user는 인증된 경우에만 설정됨
 */
exports.optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      
      const [rows] = await pool.query('SELECT user_id, username FROM LM_USERS WHERE user_id = ?', [decoded.id]);

      if (rows.length > 0) {
        req.user = rows[0];
      }
    } catch (error) {
      // 토큰 오류가 있어도 무시하고 진행 (선택적 인증이므로)
      console.log('선택적 인증: 토큰 오류 무시', error.message);
    }
  }
  
  next();
};