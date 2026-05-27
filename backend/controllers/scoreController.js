/**
 * 성적 관리 컨트롤러
 * 성적 등록/수정, 조회, 삭제, 통계 기능을 처리한다.
 */

const pool = require("../db/connection");
const gradeService = require("../services/gradeService");


// 성적 등록 및 수정
async function createScore(req, res) {
    try {
        const { student_id, subject_id, score } = req.body;

        // 학생, 과목, 점수 값이 모두 들어왔는지 확인
        if (!student_id || !subject_id || score === undefined) {
            return res.status(400).json({
                success: false,
                message: "데이터를 모두 입력해주세요."
            });
        }

        // 점수는 숫자로 변환한 뒤 0~100 사이인지 검사
        const numericScore = Number(score);

        if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
            return res.status(400).json({
                success: false,
                message: "점수는 0~100점 사이여야 합니다."
            });
        }

        // 같은 학생 + 같은 과목 성적이 이미 있으면 점수만 수정
        const sql = `
            INSERT INTO scores (student_id, subject_id, score) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                score = VALUES(score), 
                updated_at = CURRENT_TIMESTAMP
        `;

        await pool.execute(sql, [student_id, subject_id, numericScore]);

        res.status(201).json({
            success: true,
            message: "성적이 저장되었습니다."
        });

    } catch (error) {
        console.error("성적 저장 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 전체 성적 조회
async function getScores(req, res) {
    try {
        // 성적 정보에 학생 정보와 과목 정보를 함께 붙여서 조회
        const sql = `
            SELECT 
                sc.id, 
                st.id AS student_id, 
                st.student_no, 
                st.name, 
                st.department, 
                sb.id AS subject_id, 
                sb.subject_name, 
                sc.score 
            FROM scores sc
            JOIN students st ON sc.student_id = st.id
            JOIN subjects sb ON sc.subject_id = sb.id
            ORDER BY st.id ASC, sb.id ASC
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("전체 성적 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 특정 학생의 성적 조회
async function getScoresByStudent(req, res) {
    try {
        const { studentId } = req.params;

        // 먼저 학생이 실제로 존재하는지 확인
        const [student] = await pool.execute(
            "SELECT id, student_no, name, department FROM students WHERE id = ?",
            [studentId]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "학생을 찾을 수 없습니다."
            });
        }

        // 해당 학생의 과목별 성적 조회
        const sql = `
            SELECT 
                sc.id, 
                sc.subject_id, 
                sb.subject_name, 
                sc.score 
            FROM scores sc 
            JOIN subjects sb ON sc.subject_id = sb.id 
            WHERE sc.student_id = ? 
            ORDER BY sb.id ASC
        `;

        const [scores] = await pool.execute(sql, [studentId]);

        // 점수만 추출해서 평균과 등급 계산
        const scoreValues = scores.map(s => s.score);
        const average = gradeService.calculateAverage(scoreValues);
        const grade = gradeService.calculateGrade(average);

        res.json({
            success: true,
            data: {
                student: student[0],
                scores,
                summary: {
                    average,
                    grade
                }
            }
        });

    } catch (error) {
        console.error("성적 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 성적 삭제
async function deleteScore(req, res) {
    try {
        const { scoreId } = req.params;

        // scoreId에 해당하는 성적 데이터 삭제
        const [result] = await pool.execute(
            "DELETE FROM scores WHERE id = ?",
            [scoreId]
        );

        // 삭제된 행이 없으면 해당 성적 데이터가 없는 것
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "성적 데이터를 찾을 수 없습니다."
            });
        }

        res.json({
            success: true,
            message: "삭제되었습니다."
        });

    } catch (error) {
        console.error("성적 삭제 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


module.exports = {
    createScore,
    getScores,
    getScoresByStudent,
    deleteScore
};