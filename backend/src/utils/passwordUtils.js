const bcrypt = require('bcrypt');

// 암호화 강도를 나타내는 값. 10~12 사이가 적절
// 값이 높을수록 보안에 좋지만, 해싱 시간이 길어짐
const saltRounds = 10;

// 비밀번호를 해싱(암호화)하는 함수
async function hashPassword(plainPassword) {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("비밀번호 해싱 오류:", error);
        throw new Error("비밀번호 해싱 중 오류가 발생했습니다.");
    }
}

// 입력된 비밀번호와 해싱된 비밀번호를 비교하는 함수
async function comparePassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("비밀번호 비교 오류:", error);
        throw new Error("비밀번호 비교 중 오류가 발생했습니다.");
    }
}

module.exports = {
    hashPassword,
    comparePassword,
};