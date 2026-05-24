/**
 * 과목 API Controller
 *
 * 역할:
 * - 과목 목록 조회 요청을 처리합니다.
 * - 과목 등록 요청을 처리합니다.
 * - 학과별 기본 과목 조회 요청을 처리합니다.
 */

const pool = require("../db/connection");

/**
 * 과목 전체 조회
 *
 * subjects 테이블에 저장된 전체 과목 목록을 조회합니다.
 */
async function getSubjects(req, res) {
    try {
        const sql = `
            SELECT
                id,
                subject_name,
                created_at
            FROM subjects
            ORDER BY id DESC
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            message: "과목 목록 조회 성공",
            data: rows
        });
    } catch (error) {
        console.error("과목 목록 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "과목 목록 조회 중 서버 오류가 발생했습니다."
        });
    }
}

/**
 * 과목 등록
 *
 * 요청 데이터 예시:
 * {
 *   "subject_name": "Python"
 * }
 */
async function createSubject(req, res) {
    try {
        const { subject_name } = req.body;

        if (!subject_name) {
            return res.status(400).json({
                success: false,
                message: "과목명은 필수 입력값입니다."
            });
        }

        const sql = `
            INSERT INTO subjects (subject_name)
            VALUES (?)
        `;

        const [result] = await pool.execute(sql, [subject_name]);

        res.status(201).json({
            success: true,
            message: "과목이 등록되었습니다.",
            data: {
                id: result.insertId,
                subject_name
            }
        });
    } catch (error) {
        console.error("과목 등록 오류:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "이미 등록된 과목입니다."
            });
        }

        res.status(500).json({
            success: false,
            message: "과목 등록 중 서버 오류가 발생했습니다."
        });
    }
}

/**
 * 학과별 기본 과목 조회
 *
 * URL 예시:
 * GET /api/subjects/department/컴퓨터공학과
 */
async function getSubjectsByDepartment(req, res) {
    try {
        const department = decodeURIComponent(req.params.department).trim();


        if (!department) {
            return res.status(400).json({
                success: false,
                message: "학과명은 필수 입력값입니다."
            });
        }

        const sql = `
            SELECT
                s.id,
                s.subject_name
            FROM department_subjects ds
            INNER JOIN subjects s
                ON ds.subject_id = s.id
            WHERE ds.department = ?
            ORDER BY s.id ASC
        `;

        const [rows] = await pool.execute(sql, [department]);

        res.json({
            success: true,
            message: "학과별 기본 과목 조회 성공",
            data: rows
        });
    } catch (error) {
        console.error("학과별 기본 과목 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "학과별 기본 과목 조회 중 서버 오류가 발생했습니다."
        });
    }
}

module.exports = {
    getSubjects,
    createSubject,
    getSubjectsByDepartment
};