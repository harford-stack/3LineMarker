const db = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../config/jwt');
const crypto = require('crypto');

// ✅ 회원가입 처리 함수
exports.register = async (req, res) => {
    const { userId, password, username, email, birthDate, gender, bio } = req.body;

    // 1. 입력값 유효성 검사
    if (!userId || !password || !username || !email) {
        return res.status(400).json({ message: '아이디, 비밀번호, 닉네임, 이메일은 필수 입력 항목입니다.' });
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
    }

    // 성별 유효성 검사
    if (gender && !['M', 'F', 'O'].includes(gender)) {
        return res.status(400).json({ message: '성별은 M, F, O 중 하나여야 합니다.' });
    }

    try {
        // 2. USER_ID 중복 확인
        const [existingUser] = await db.query('SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?', [userId]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
        }

        // 3. 이메일 중복 확인
        const [existingEmail] = await db.query('SELECT USER_ID FROM LM_USERS WHERE EMAIL = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
        }

        // 4. 비밀번호 해싱
        const hashedPassword = await hashPassword(password);

        // 5. 데이터베이스에 새 사용자 정보 저장
        const [result] = await db.query(
            `INSERT INTO LM_USERS (USER_ID, PASSWORD, USERNAME, EMAIL, BIRTH_DATE, GENDER, BIO) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, hashedPassword, username, email, birthDate || null, gender || null, bio || null]
        );

        // 6. 성공 응답
        res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.', userId: userId });

    } catch (error) {
        console.error('회원가입 중 서버 오류 발생:', error);
        res.status(500).json({ message: '회원가입 중 서버 오류가 발생했습니다.' });
    }
};

// ✅ 로그인 처리 함수
exports.login = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해야 합니다.' });
    }

    try {
        const [users] = await db.query(
            'SELECT USER_ID, PASSWORD, USERNAME, PROFILE_IMAGE_URL, STATUS_MESSAGE, EMAIL FROM LM_USERS WHERE USER_ID = ?', 
            [userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        const user = users[0];
        const isPasswordValid = await comparePassword(password, user.PASSWORD);

        if (!isPasswordValid) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        const token = generateToken({ id: user.USER_ID });

        res.status(200).json({
            message: '로그인 성공!',
            token: token,
            user: {
                userId: user.USER_ID,
                username: user.USERNAME,
                profileImageUrl: user.PROFILE_IMAGE_URL,
                statusMessage: user.STATUS_MESSAGE,
                email: user.EMAIL
            }
        });

    } catch (error) {
        console.error('로그인 중 서버 오류 발생:', error);
        res.status(500).json({ message: '로그인 중 서버 오류가 발생했습니다.' });
    }
};

// ✅ 아이디 찾기 (이메일로)
exports.findUserId = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    try {
        const [users] = await db.query(
            'SELECT USER_ID, CREATED_AT FROM LM_USERS WHERE EMAIL = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '해당 이메일로 가입된 계정이 없습니다.' });
        }

        const user = users[0];
        // 아이디 일부 마스킹 (첫 2글자 + *** + 마지막 1글자)
        const userId = user.USER_ID;
        let maskedId;
        if (userId.length <= 3) {
            maskedId = userId[0] + '***';
        } else {
            maskedId = userId.substring(0, 2) + '***' + userId.slice(-1);
        }

        res.status(200).json({
            message: '아이디를 찾았습니다.',
            userId: maskedId,
            hint: `가입일: ${new Date(user.CREATED_AT).toLocaleDateString('ko-KR')}`,
            // 전체 아이디는 이메일로 발송하는 것이 보안상 좋음
        });

    } catch (error) {
        console.error('아이디 찾기 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// ✅ 아이디 찾기 - 이메일로 전체 아이디 발송
exports.sendUserIdByEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    try {
        const [users] = await db.query(
            'SELECT USER_ID, USERNAME FROM LM_USERS WHERE EMAIL = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '해당 이메일로 가입된 계정이 없습니다.' });
        }

        const user = users[0];

        // 실제 이메일 발송은 nodemailer 등을 사용해야 하지만,
        // 여기서는 간단히 응답으로 아이디를 보여줍니다.
        // 프로덕션에서는 이메일 발송 로직 추가 필요

        res.status(200).json({
            message: '아이디 정보입니다.',
            userId: user.USER_ID,
            username: user.USERNAME,
        });

    } catch (error) {
        console.error('아이디 전송 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// ✅ 비밀번호 찾기 - 재설정 토큰 생성
exports.requestPasswordReset = async (req, res) => {
    const { userId, email } = req.body;

    if (!userId || !email) {
        return res.status(400).json({ message: '아이디와 이메일을 모두 입력해주세요.' });
    }

    try {
        // 사용자 확인
        const [users] = await db.query(
            'SELECT USER_ID FROM LM_USERS WHERE USER_ID = ? AND EMAIL = ?',
            [userId, email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '입력하신 정보와 일치하는 계정이 없습니다.' });
        }

        // 재설정 토큰 생성 (6자리 숫자)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료

        // 토큰 저장
        await db.query(
            'UPDATE LM_USERS SET RESET_TOKEN = ?, RESET_TOKEN_EXPIRES = ? WHERE USER_ID = ?',
            [resetToken, resetTokenExpires, userId]
        );

        // 실제로는 이메일로 토큰을 발송해야 하지만,
        // 개발 환경에서는 응답으로 토큰을 반환합니다.
        res.status(200).json({
            message: '비밀번호 재설정 코드가 생성되었습니다.',
            // 프로덕션에서는 이 토큰을 이메일로 발송
            resetToken: resetToken, // 개발용: 실제로는 제거
            expiresIn: '30분'
        });

    } catch (error) {
        console.error('비밀번호 재설정 요청 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// ✅ 비밀번호 재설정 - 토큰 확인 후 변경
exports.resetPassword = async (req, res) => {
    const { userId, resetToken, newPassword } = req.body;

    if (!userId || !resetToken || !newPassword) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ message: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }

    try {
        // 토큰 확인
        const [users] = await db.query(
            'SELECT USER_ID, RESET_TOKEN, RESET_TOKEN_EXPIRES FROM LM_USERS WHERE USER_ID = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[0];

        // 토큰 일치 확인
        if (user.RESET_TOKEN !== resetToken) {
            return res.status(400).json({ message: '인증 코드가 올바르지 않습니다.' });
        }

        // 토큰 만료 확인
        if (new Date() > new Date(user.RESET_TOKEN_EXPIRES)) {
            return res.status(400).json({ message: '인증 코드가 만료되었습니다. 다시 요청해주세요.' });
        }

        // 새 비밀번호 해싱
        const hashedPassword = await hashPassword(newPassword);

        // 비밀번호 업데이트 및 토큰 초기화
        await db.query(
            'UPDATE LM_USERS SET PASSWORD = ?, RESET_TOKEN = NULL, RESET_TOKEN_EXPIRES = NULL WHERE USER_ID = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error('비밀번호 재설정 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// ✅ 아이디 중복 확인
exports.checkUserId = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: '아이디를 입력해주세요.' });
    }

    try {
        const [users] = await db.query('SELECT USER_ID FROM LM_USERS WHERE USER_ID = ?', [userId]);
        
        res.status(200).json({
            available: users.length === 0,
            message: users.length === 0 ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
        });

    } catch (error) {
        console.error('아이디 확인 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// ✅ 이메일 중복 확인
exports.checkEmail = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    try {
        const [users] = await db.query('SELECT USER_ID FROM LM_USERS WHERE EMAIL = ?', [email]);
        
        res.status(200).json({
            available: users.length === 0,
            message: users.length === 0 ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'
        });

    } catch (error) {
        console.error('이메일 확인 중 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
