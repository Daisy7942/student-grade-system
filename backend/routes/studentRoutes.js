/**
 * 학생 API Route
 *
 * 역할:
 * - 학생 관련 API 주소를 정의합니다.
 * - 실제 처리 로직은 studentController로 전달합니다.
 */

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

/**
 * 학생 등록 API
 *
 * POST /api/students
 */
router.post("/", studentController.createStudent);

/**
 * 학생 목록 조회 API
 *
 * GET /api/students
 */
router.get("/", studentController.getStudents);

module.exports = router;