/**
 * 과목 API Route
 *
 * 역할:
 * - 과목 관련 API 주소를 정의합니다.
 * - 실제 처리 로직은 subjectController로 전달합니다.
 */

const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subjectController");

/**
 * 과목 전체 조회 API
 *
 * GET /api/subjects
 */
router.get("/", subjectController.getSubjects);

/**
 * 과목 등록 API
 *
 * POST /api/subjects
 */
router.post("/", subjectController.createSubject);

/**
 * 학과별 기본 과목 조회 API
 *
 * GET /api/subjects/department/:department
 */
router.get("/department/:department", subjectController.getSubjectsByDepartment);

module.exports = router;