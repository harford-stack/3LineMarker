// .env 파일의 환경 변수를 사용하기 위해 dotenv 설정 (최상단에서 한 번만 호출)
require('dotenv').config({ path: '../../.env' }); // ✅ 중요: .env 파일의 상대 경로 지정

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,         // ✅ .env 파일에서 가져옴
    user: process.env.DB_USER,         // ✅ .env 파일에서 가져옴
    password: process.env.DB_PASSWORD, // ✅ .env 파일에서 가져옴
    database: process.env.DB_DATABASE  // ✅ .env 파일에서 가져옴
});

// promise 기반으로 사용할 수 있게 변환
const promisePool = pool.promise();

module.exports = promisePool;