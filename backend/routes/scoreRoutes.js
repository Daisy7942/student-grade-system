/**
 * 성적 API Route
 * 성적 등록, 조회, 통계, 삭제 API 주소를 정의한다.
 */

const express = require("express");
const router = express.Router();

const scoreController = require("../controllers/scoreController");


/**
 * 성적 등록 및 수정
 * POST /api/scores

 * 같은 학생 + 같은 과목 성적이 이미 있으면 수정된다.
 */
router.post("/", scoreController.createScore);


/**
 * 전체 성적 조회
 * GET /api/scores
 *
 * 모든 학생의 성적 정보를 조회한다.
 */
router.get("/", scoreController.getScores);


/**
 * 학생별 성적 조회
 * GET /api/scores/student/:studentId
 *
 * 특정 학생의 성적 목록, 평균 점수, 평균 등급을 조회한다.
 */
router.get("/student/:studentId", scoreController.getScoresByStudent);


/**
 * 성적 삭제
 * DELETE /api/scores/:scoreId
 *
 * scoreId에 해당하는 성적 데이터를 삭제한다.
 */
router.delete("/:scoreId", scoreController.deleteScore);


// 라우터를 다른 파일에서 사용할 수 있도록 내보내기
module.exports = router;