/**
 * 학생 관리 컨트롤러
 * 학생 등록, 조회, 수정, 삭제 기능을 처리한다.
 */

const pool = require("../db/connection");

function isDuplicateEntryError(error) {
    return error && error.code === "ER_DUP_ENTRY";
}


// 학생 등록
async function createStudent(req, res) {
    try {
        const { student_no, name, department } = req.body;

        // 학번, 이름, 학과가 모두 입력되었는지 확인
        if (!student_no || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "모든 항목을 입력해주세요."
            });
        }

        // 학생 정보를 students 테이블에 저장
        const sql = "INSERT INTO students (student_no, name, department) VALUES (?, ?, ?)";
        const [result] = await pool.execute(sql, [student_no, name, department]);

        // 등록된 학생 정보 반환
        res.status(201).json({
            success: true,
            message: "학생이 등록되었습니다.",
            data: {
                id: result.insertId,
                student_no,
                name,
                department
            }
        });

    } catch (error) {
        console.error("학생 등록 오류:", error);

        if (isDuplicateEntryError(error)) {
            return res.status(409).json({
                success: false,
                message: "이미 등록된 학번입니다."
            });
        }

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 학생 목록 조회
async function getStudents(req, res) {
    try {
        const { keyword, department } = req.query;

        const [[countRow]] = await pool.execute(
            "SELECT COUNT(*) AS totalCount FROM students"
        );

        // 기본 조회 SQL
        let sql = "SELECT id, student_no, name, department FROM students WHERE 1=1";
        const params = [];

        // 이름 또는 학번으로 검색
        if (keyword) {
            sql += " AND (name LIKE ? OR student_no LIKE ?)";
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        // 학과 조건 검색
        if (department) {
            sql += " AND department = ?";
            params.push(department);
        }

        // 최근 등록된 학생이 위로 오도록 정렬
        sql += " ORDER BY id DESC";

        const [rows] = await pool.execute(sql, params);

        res.json({
            success: true,
            data: rows,
            totalCount: countRow.totalCount
        });

    } catch (error) {
        console.error("학생 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 학생 정보 수정
async function updateStudent(req, res) {
    try {
        const { studentId } = req.params;
        const { student_no, name, department } = req.body;

        if (!student_no || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "모든 항목을 입력해주세요."
            });
        }

        // studentId에 해당하는 학생 정보 수정
        const sql = "UPDATE students SET student_no = ?, name = ?, department = ? WHERE id = ?";
        const [result] = await pool.execute(sql, [student_no, name, department, studentId]);

        // 수정된 행이 없으면 해당 학생이 존재하지 않는 것
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "학생을 찾을 수 없습니다."
            });
        }

        res.json({
            success: true,
            message: "수정되었습니다."
        });

    } catch (error) {
        console.error("학생 수정 오류:", error);

        if (isDuplicateEntryError(error)) {
            return res.status(409).json({
                success: false,
                message: "이미 등록된 학번입니다."
            });
        }

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 학생 삭제
async function deleteStudent(req, res) {
    try {
        const { studentId } = req.params;

        const [scores] = await pool.execute(
            "SELECT id FROM scores WHERE student_id = ? LIMIT 1",
            [studentId]
        );

        if (scores.length > 0) {
            return res.status(409).json({
                success: false,
                message: "연결된 성적이 있어 삭제할 수 없습니다."
            });
        }

        // studentId에 해당하는 학생 데이터 삭제
        const [result] = await pool.execute(
            "DELETE FROM students WHERE id = ?",
            [studentId]
        );

        // 삭제된 행이 없으면 해당 학생이 존재하지 않는 것
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "학생을 찾을 수 없습니다."
            });
        }

        res.json({
            success: true,
            message: "삭제되었습니다."
        });

    } catch (error) {
        console.error("학생 삭제 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 다른 파일에서 사용할 수 있도록 함수 내보내기
module.exports = {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
};
