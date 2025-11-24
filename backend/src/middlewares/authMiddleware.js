require('dotenv').config({ path: '../../.env' }); // ✅ 중요: .env 파일의 상대 경로 지정
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '인증 토큰이 제공되지 않았습니다.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ .env에서 JWT 비밀 키 가져옴
        req.user = decoded; // req.user에 디코드된 사용자 정보 저장
        next(); // 다음 미들웨어 또는 라우터로 진행
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: '토큰이 만료되었습니다.' });
        }
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
};