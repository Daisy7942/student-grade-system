/**
 * 학생 정보 및 성적 관리 시스템 백엔드 서버
 *
 * 역할:
 * - Express 서버를 실행합니다.
 * - 프론트엔드에서 요청하는 API를 처리할 준비를 합니다.
 * - 현재 단계에서는 서버 실행 확인용 API만 제공합니다.
 */
const studentRoutes = require("./routes/studentRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

/**
 * 공통 미들웨어 설정
 *
 * cors:
 * - 프론트엔드와 백엔드의 주소가 다를 때도 요청을 허용합니다.
 *
 * express.json:
 * - JSON 형식으로 들어오는 요청 데이터를 읽을 수 있게 합니다.
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", studentRoutes);

/**
 * 서버 상태 확인 API
 *
 * 브라우저 또는 fetch 요청으로 서버가 정상 실행 중인지 확인할 수 있습니다.
 */
app.get("/", (req, res) => {
    res.send("Student Grade Backend Server is running.");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend server is running."
    });
});

/**
 * 서버 실행
 */
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});