/**
 * ============================================
 * 🔐 passwordUtils.js - 비밀번호 암호화 유틸리티
 * ============================================
 * 
 * 이 파일은 비밀번호를 안전하게 암호화하고 검증하는 함수들을 제공합니다.
 * 
 * 주요 기능:
 * 1. 비밀번호 해싱 (암호화)
 * 2. 비밀번호 검증 (평문 비밀번호와 해싱된 비밀번호 비교)
 * 
 * 작동 원리:
 * - bcrypt 라이브러리를 사용해서 비밀번호를 해싱합니다
 * - bcrypt는 단방향 해싱 알고리즘이므로 원래 비밀번호로 복원할 수 없습니다
 * - 로그인 시에는 평문 비밀번호와 해싱된 비밀번호를 비교해서 일치하는지 확인합니다
 * 
 * 보안:
 * - saltRounds를 사용해서 해싱 강도를 조절합니다
 * - 값이 높을수록 보안에 좋지만, 해싱 시간이 길어집니다
 * - 10~12 사이가 적절한 값입니다
 */

// bcrypt: 비밀번호 해싱을 위한 라이브러리
const bcrypt = require('bcrypt');

/**
 * 암호화 강도 설정
 * 
 * saltRounds란?
 * - bcrypt가 비밀번호를 해싱할 때 사용하는 반복 횟수입니다
 * - 값이 높을수록 보안에 좋지만, 해싱 시간이 길어집니다
 * - 10~12 사이가 적절한 값입니다 (10 = 2^10 = 1024번 반복)
 * 
 * 권장 값:
 * - 개발 환경: 10
 * - 운영 환경: 12
 */
const saltRounds = 10;

/**
 * 비밀번호를 해싱(암호화)하는 함수
 * 
 * @param {string} plainPassword - 암호화할 평문 비밀번호
 * @returns {Promise<string>} 해싱된 비밀번호
 * @throws {Error} 해싱 중 오류가 발생한 경우
 * 
 * 작동 순서:
 * 1. bcrypt.hash()를 사용해서 평문 비밀번호를 해싱합니다
 * 2. saltRounds만큼 반복해서 해싱합니다 (보안 강화)
 * 3. 해싱된 비밀번호를 반환합니다
 * 
 * 사용 예시:
 * const hashedPassword = await hashPassword('myPassword123');
 * // 결과: '$2b$10$abcdefghijklmnopqrstuvwxyz...' (해싱된 문자열)
 */
async function hashPassword(plainPassword) {
    try {
        // bcrypt.hash(): 평문 비밀번호를 해싱합니다
        // plainPassword: 암호화할 비밀번호
        // saltRounds: 해싱 강도 (10 = 2^10 = 1024번 반복)
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("비밀번호 해싱 오류:", error);
        throw new Error("비밀번호 해싱 중 오류가 발생했습니다.");
    }
}

/**
 * 입력된 비밀번호와 해싱된 비밀번호를 비교하는 함수
 * 
 * @param {string} plainPassword - 사용자가 입력한 평문 비밀번호
 * @param {string} hashedPassword - 데이터베이스에 저장된 해싱된 비밀번호
 * @returns {Promise<boolean>} 비밀번호가 일치하면 true, 아니면 false
 * @throws {Error} 비교 중 오류가 발생한 경우
 * 
 * 작동 순서:
 * 1. bcrypt.compare()를 사용해서 평문 비밀번호와 해싱된 비밀번호를 비교합니다
 * 2. bcrypt는 해싱된 비밀번호에 포함된 salt를 자동으로 추출해서 사용합니다
 * 3. 일치하면 true, 아니면 false를 반환합니다
 * 
 * 사용 예시:
 * const isMatch = await comparePassword('myPassword123', hashedPassword);
 * if (isMatch) {
 *   // 로그인 성공
 * }
 */
async function comparePassword(plainPassword, hashedPassword) {
    try {
        // bcrypt.compare(): 평문 비밀번호와 해싱된 비밀번호를 비교합니다
        // plainPassword: 사용자가 입력한 비밀번호
        // hashedPassword: 데이터베이스에 저장된 해싱된 비밀번호
        // 반환값: 일치하면 true, 아니면 false
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("비밀번호 비교 오류:", error);
        throw new Error("비밀번호 비교 중 오류가 발생했습니다.");
    }
}

// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
    hashPassword,
    comparePassword,
};