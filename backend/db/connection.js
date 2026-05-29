/**
 * MySQL 데이터베이스 연결 설정 파일
 * 서버에서 DB 작업을 할 수 있도록 연결 풀(pool)을 생성한다.
 */

require("dotenv").config();

const mysql = require("mysql2/promise");


/**
 * DB 연결 풀 생성
 * 요청마다 새로 연결하지 않고 기존 연결을 재사용한다.
 */
const pool = mysql.createPool({
    // DB 접속 정보는 .env 파일에서 가져온다.
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "student_grade_db",

    // 한글, 이모지 저장을 위한 문자셋
    charset: "utf8mb4",

    // 사용 가능한 연결이 없으면 기다림
    waitForConnections: true,

    // 동시에 사용할 수 있는 최대 DB 연결 수
    connectionLimit: 10,

    // 대기 요청 수 제한
    // 0이면 제한 없음
    queueLimit: 0
});

// 다른 파일에서 DB 연결을 사용할 수 있도록 내보내기
module.exports = pool;
