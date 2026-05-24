/**
 * 학생 API Controller
 *
 * 역할:
 * - 학생 등록 요청을 처리합니다.
 * - 학생 목록 조회 요청을 처리합니다.
 * - 실제 DB 작업은 connection.js의 pool을 사용합니다.
 */

const pool = require("../db/connection");

/**
 * 학생 등록
 *
 * 요청 데이터 예시:
 * {
 *   "student_no": "2024001",
 *   "name": "김수현",
 *   "department": "컴퓨터공학과"
 * }
 */
async function createStudent(req, res) {
    try {
        const { student_no, name, department } = req.body;

        if (!student_no || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "학번, 이름, 학과는 필수 입력값입니다."
            });
        }

        const sql = `
            INSERT INTO students (student_no, name, department)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            student_no,
            name,
            department
        ]);

        res.status(201).json({
            success: true,
            message: "학생 정보가 등록되었습니다.",
            data: {
                id: result.insertId,
                student_no,
                name,
                department
            }
        });
    } catch (error) {
        console.error("학생 등록 오류:", error);

        res.status(500).json({
            success: false,
            message: "학생 등록 중 서버 오류가 발생했습니다."
        });
    }
}

/**
 * 학생 목록 조회
 *
 * DB에 저장된 전체 학생 목록을 조회합니다.
 */
async function getStudents(req, res) {
    try {
        const sql = `
            SELECT 
                id,
                student_no,
                name,
                department,
                created_at
            FROM students
            ORDER BY id DESC
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            message: "학생 목록 조회 성공",
            data: rows
        });
    } catch (error) {
        console.error("학생 목록 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "학생 목록 조회 중 서버 오류가 발생했습니다."
        });
    }
}

module.exports = {
    createStudent,
    getStudents
};