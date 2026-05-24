/**
 * 성적 API Route
 *
 * 역할:
 * - 성적 관련 API 주소를 정의합니다.
 * - 실제 처리 로직은 scoreController로 전달합니다.
 */

const express = require("express");
const router = express.Router();

const scoreController = require("../controllers/scoreController");

/**
 * 성적 등록 API
 *
 * POST /api/scores
 */
router.post("/", scoreController.createScore);

/**
 * 전체 성적 조회 API
 *
 * GET /api/scores
 */
router.get("/", scoreController.getScores);

/**
 * 학생별 성적 조회 API
 *
 * GET /api/scores/student/:studentId
 */
router.get("/student/:studentId", scoreController.getScoresByStudent);

module.exports = router;