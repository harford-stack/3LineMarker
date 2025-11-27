// backend/src/config/jwt.js
const jwt = require('jsonwebtoken');

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
}

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 담을 데이터 (예: { id: user.USER_ID })
 * @returns {string} JWT 토큰
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 JWT 토큰
 * @returns {Object} 디코드된 토큰 데이터
 * @throws {Error} 토큰이 유효하지 않거나 만료된 경우
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * JWT 설정 내보내기 (필요한 경우)
 */
exports.JWT_SECRET = JWT_SECRET;
exports.JWT_EXPIRES_IN = JWT_EXPIRES_IN;

