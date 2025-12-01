/**
 * ============================================
 * 🗄️ database.js - 데이터베이스 연결 설정
 * ============================================
 * 
 * 이 파일은 MySQL 데이터베이스와의 연결을 관리합니다.
 * 
 * 주요 기능:
 * 1. .env 파일에서 데이터베이스 설정 읽기
 * 2. MySQL 연결 풀 생성
 * 3. Promise 기반 쿼리 실행을 위한 변환
 * 
 * 작동 원리:
 * - mysql2 라이브러리를 사용해서 MySQL 데이터베이스에 연결합니다
 * - 연결 풀(pool)을 사용해서 여러 요청을 효율적으로 처리합니다
 * - Promise 기반으로 변환해서 async/await를 사용할 수 있게 합니다
 */

// .env 파일의 환경 변수를 사용하기 위해 dotenv 설정 (최상단에서 한 번만 호출)
// path 옵션: .env 파일의 상대 경로 지정 (backend 폴더 기준 상위 폴더)
require('dotenv').config({ path: '../../.env' });

// mysql2: MySQL 데이터베이스와 연결하기 위한 라이브러리
const mysql = require('mysql2');

/**
 * MySQL 연결 풀 생성
 * 
 * 연결 풀이란?
 * - 데이터베이스 연결을 미리 만들어서 저장해두는 공간입니다
 * - 매번 새로 연결하는 것보다 빠르고 효율적입니다
 * - 여러 요청이 동시에 들어와도 안정적으로 처리할 수 있습니다
 * 
 * 설정 값들:
 * - host: 데이터베이스 서버 주소 (예: localhost)
 * - user: 데이터베이스 사용자 이름
 * - password: 데이터베이스 비밀번호
 * - database: 사용할 데이터베이스 이름
 * 
 * 모든 값은 .env 파일에서 가져옵니다 (보안을 위해)
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,         // 데이터베이스 서버 주소
    user: process.env.DB_USER,         // 데이터베이스 사용자 이름
    password: process.env.DB_PASSWORD, // 데이터베이스 비밀번호
    database: process.env.DB_DATABASE  // 사용할 데이터베이스 이름
});

/**
 * Promise 기반으로 사용할 수 있게 변환
 * 
 * pool.promise():
 * - 기본 mysql2는 콜백 방식으로 동작합니다
 * - promise()를 호출하면 Promise 기반으로 변환됩니다
 * - 이렇게 하면 async/await를 사용할 수 있어서 코드가 더 깔끔해집니다
 * 
 * 사용 예시:
 * const [rows] = await promisePool.query('SELECT * FROM users');
 */
const promisePool = pool.promise();

// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = promisePool;