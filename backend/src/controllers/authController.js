const db = require('../config/database'); // ✅ DB 연결 임포트
const { hashPassword, comparePassword } = require('../utils/passwordUtils'); // ✅ 비밀번호 유틸리티 임포트
const jwt = require('jsonwebtoken'); // ✅ JWT 라이브러리 임포트

// ✅ 회원가입 처리 함수
exports.register = async (req, res) => {
    const { userId, password, username } = req.body; // 프론트엔드에서 넘어올 데이터

    // 1. 입력값 유효성 검사
    if (!userId || !password || !username) {
        return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        // 2. USER_ID 중복 확인
        const [existingUser] = await db.query('SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?', [userId]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' }); // 409 Conflict
        }

        // 3. 비밀번호 해싱 (암호화)
        const hashedPassword = await hashPassword(password);

        // 4. 데이터베이스에 새 사용자 정보 저장
        const [result] = await db.query(
            'INSERT INTO LM_USERS (USER_ID, PASSWORD, USERNAME) VALUES (?, ?, ?)',
            [userId, hashedPassword, username]
        );

        // 5. 성공 응답
        res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.', userId: userId }); // 201 Created

    } catch (error) {
        console.error('회원가입 중 서버 오류 발생:', error);
        res.status(500).json({ message: '회원가입 중 서버 오류가 발생했습니다.' });
    }
};

// ✅ 로그인 처리 함수
exports.login = async (req, res) => {
    const { userId, password } = req.body; // 프론트엔드에서 넘어올 아이디와 비밀번호

    // 1. 입력값 유효성 검사
    if (!userId || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해야 합니다.' });
    }

    try {
        // 2. 데이터베이스에서 사용자 조회
        const [users] = await db.query('SELECT USER_ID, PASSWORD, USERNAME, PROFILE_IMAGE_URL, STATUS_MESSAGE FROM LM_USERS WHERE USER_ID = ?', [userId]);

        if (users.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); // 사용자를 찾을 수 없음
        }

        const user = users[0];

        // 3. 비밀번호 비교
        const isPasswordValid = await comparePassword(password, user.PASSWORD); // ✅ bcrypt 유틸리티 사용

        if (!isPasswordValid) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); // 비밀번호 불일치
        }

        // 4. JWT 토큰 생성
        // ✅ process.env.JWT_SECRET과 process.env.JWT_EXPIRES_IN은 .env 파일에서 가져옵니다.
        const token = jwt.sign(
            { id: user.USER_ID }, // 토큰에 포함할 정보 (Payload)
            process.env.JWT_SECRET,   // .env에 정의된 비밀 키
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // .env에 정의된 만료 시간 (기본 1시간)
        );

        // 5. 로그인 성공 응답
        res.status(200).json({
            message: '로그인 성공!',
            token: token,
            user: {
                userId: user.USER_ID,
                username: user.USERNAME,
                profileImageUrl: user.PROFILE_IMAGE_URL,
                statusMessage: user.STATUS_MESSAGE
            }
        });

    } catch (error) {
        console.error('로그인 중 서버 오류 발생:', error);
        res.status(500).json({ message: '로그인 중 서버 오류가 발생했습니다.' });
    }
};