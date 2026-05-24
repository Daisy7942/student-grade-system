/**
 * 성적 API Controller
 *
 * 역할:
 * - 학생별 과목 점수를 등록합니다.
 * - 전체 성적 목록을 조회합니다.
 * - 특정 학생의 성적과 평균, 등급을 조회합니다.
 */

const pool = require("../db/connection");
const gradeService = require("../services/gradeService");

/**
 * 성적 등록
 *
 * 요청 데이터 예시:
 * {
 *   "student_id": 1,
 *   "subject_id": 1,
 *   "score": 90
 * }
 */
async function createScore(req, res) {
    try {
        const { student_id, subject_id, score } = req.body;

        if (!student_id || !subject_id || score === undefined) {
            return res.status(400).json({
                success: false,
                message: "학생 ID, 과목 ID, 점수는 필수 입력값입니다."
            });
        }

        const numericScore = Number(score);

        if (numericScore < 0 || numericScore > 100) {
            return res.status(400).json({
                success: false,
                message: "점수는 0점 이상 100점 이하로 입력해야 합니다."
            });
        }

        const sql = `
            INSERT INTO scores (student_id, subject_id, score)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                updated_at = CURRENT_TIMESTAMP
        `;

        await pool.execute(sql, [
            student_id,
            subject_id,
            numericScore
        ]);

        res.status(201).json({
            success: true,
            message: "성적이 등록되었습니다.",
            data: {
                student_id,
                subject_id,
                score: numericScore
            }
        });
    } catch (error) {
        console.error("성적 등록 오류:", error);

        res.status(500).json({
            success: false,
            message: "성적 등록 중 서버 오류가 발생했습니다."
        });
    }
}

/**
 * 전체 성적 조회
 *
 * 학생명, 학번, 학과, 과목명, 점수를 함께 조회합니다.
 */
async function getScores(req, res) {
    try {
        const sql = `
            SELECT
                sc.id,
                st.id AS student_id,
                st.student_no,
                st.name,
                st.department,
                sb.id AS subject_id,
                sb.subject_name,
                sc.score,
                sc.created_at,
                sc.updated_at
            FROM scores sc
            INNER JOIN students st
                ON sc.student_id = st.id
            INNER JOIN subjects sb
                ON sc.subject_id = sb.id
            ORDER BY st.id ASC, sb.id ASC
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            message: "전체 성적 조회 성공",
            data: rows
        });
    } catch (error) {
        console.error("전체 성적 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "전체 성적 조회 중 서버 오류가 발생했습니다."
        });
    }
}

/**
 * 학생별 성적 조회
 *
 * 특정 학생의 과목별 점수와 평균, 등급을 조회합니다.
 */
async function getScoresByStudent(req, res) {
    try {
        const { studentId } = req.params;

        const studentSql = `
            SELECT
                id,
                student_no,
                name,
                department
            FROM students
            WHERE id = ?
        `;

        const [studentRows] = await pool.execute(studentSql, [studentId]);

        if (studentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "학생 정보를 찾을 수 없습니다."
            });
        }

        const scoreSql = `
            SELECT
                sb.id AS subject_id,
                sb.subject_name,
                sc.score
            FROM scores sc
            INNER JOIN subjects sb
                ON sc.subject_id = sb.id
            WHERE sc.student_id = ?
            ORDER BY sb.id ASC
        `;

        const [scoreRows] = await pool.execute(scoreSql, [studentId]);

        const scoreValues = scoreRows.map((item) => item.score);
        const average = gradeService.calculateAverage(scoreValues);
        const grade = gradeService.calculateGrade(average);

        res.json({
            success: true,
            message: "학생별 성적 조회 성공",
            data: {
                student: studentRows[0],
                scores: scoreRows,
                summary: {
                    average,
                    grade
                }
            }
        });
    } catch (error) {
        console.error("학생별 성적 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "학생별 성적 조회 중 서버 오류가 발생했습니다."
        });
    }
}

module.exports = {
    createScore,
    getScores,
    getScoresByStudent
};