/**
 * MySQL 데이터베이스 연결 설정 파일
 *
 * 역할:
 * - 백엔드 서버에서 MySQL 데이터베이스에 접근할 수 있도록 연결 풀을 생성합니다.
 * - 학생 정보와 성적 정보를 조회, 등록, 수정, 삭제할 때 사용됩니다.
 */

require("dotenv").config();

const mysql = require("mysql2/promise");

/*
 * pool은 DB 연결 묶음입니다.
 *
 * createPool:
 * - 매번 DB에 새로 연결하지 않고, 여러 연결을 미리 준비해두는 방식입니다.
 * - API 요청이 여러 번 들어와도 효율적으로 DB 작업을 처리할 수 있습니다.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "student_grade_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;