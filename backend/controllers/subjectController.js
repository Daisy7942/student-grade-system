/**
 * 과목 관리 컨트롤러
 * 학과별 기본 과목 생성, 과목 조회, 과목 등록 기능을 처리한다.
 */

const pool = require("../db/connection");


// 학과별 기본 과목 데이터
const DEFAULT_SUBJECTS = {
    "스마트금융과": ["금융기초", "핀테크", "회계원리"],
    "경영학과": ["경영학원론", "마케팅기초", "조직관리"],
    "요리과": ["조리기초", "제과제빵", "식품위생"],
    "디자인과": ["디자인기초", "색채학", "디지털드로잉"]
};


// 기본 과목 자동 등록 함수
async function ensureDefaultSubjects(department) {
    // 선택한 학과에 해당하는 기본 과목 목록 가져오기
    const subjects = DEFAULT_SUBJECTS[department];

    // 등록된 기본 과목이 없는 학과면 함수 종료
    if (!subjects) return;

    // 학과별 기본 과목을 subjects 테이블과 department_subjects 테이블에 등록
    for (const name of subjects) {
        // subjects 테이블에 과목이 없으면 등록
        await pool.execute(
            "INSERT IGNORE INTO subjects (subject_name) VALUES (?)",
            [name]
        );

        // 해당 학과와 과목을 연결
        await pool.execute(`
            INSERT IGNORE INTO department_subjects (department, subject_id)
            SELECT ?, id FROM subjects WHERE subject_name = ?
        `, [department, name]);
    }
}


// 과목 조회
async function getSubjects(req, res) {
    try {
        const { department } = req.query;

        // 기본값은 전체 과목 조회
        let sql = "SELECT * FROM subjects";
        const params = [];

        // 학과가 선택된 경우 해당 학과의 과목만 조회
        if (department) {
            // 해당 학과의 기본 과목이 없으면 먼저 자동 생성
            await ensureDefaultSubjects(department);

            // 학과와 연결된 과목만 조회
            sql = `
                SELECT 
                    s.id, 
                    s.subject_name 
                FROM subjects s
                JOIN department_subjects ds ON s.id = ds.subject_id
                WHERE ds.department = ?
            `;

            params.push(department);
        }

        // 과목 ID 기준 오름차순 정렬
        sql += " ORDER BY id ASC";

        const [rows] = await pool.execute(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("과목 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 학과별 과목 조회
async function getSubjectsByDepartment(req, res) {
    try {
        const department = req.params.department;

        // URL 경로에서 학과 값이 넘어왔는지 확인
        if (!department) {
            return res.status(400).json({
                success: false,
                message: "학과를 선택해주세요."
            });
        }

        // 해당 학과의 기본 과목이 없으면 먼저 자동 생성
        await ensureDefaultSubjects(department);

        // 선택한 학과와 연결된 과목만 조회
        const sql = `
            SELECT 
                s.id, 
                s.subject_name 
            FROM subjects s
            JOIN department_subjects ds ON s.id = ds.subject_id
            WHERE ds.department = ?
            ORDER BY s.id ASC
        `;

        const [rows] = await pool.execute(sql, [department]);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("과목 조회 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 새 과목 등록
async function createSubject(req, res) {
    try {
        const { subject_name, department } = req.body;

        // 과목명과 학과가 모두 입력되었는지 확인
        if (!subject_name || !department) {
            return res.status(400).json({
                success: false,
                message: "과목명과 학과를 입력해주세요."
            });
        }

        // subjects 테이블에 과목이 없으면 등록
        await pool.execute(
            "INSERT IGNORE INTO subjects (subject_name) VALUES (?)",
            [subject_name]
        );

        // 등록되어 있거나 이미 존재하는 과목의 id 조회
        const [subject] = await pool.execute(
            "SELECT id FROM subjects WHERE subject_name = ?",
            [subject_name]
        );

        const subjectId = subject[0].id;

        // 선택한 학과와 과목을 연결
        await pool.execute(
            "INSERT IGNORE INTO department_subjects (department, subject_id) VALUES (?, ?)",
            [department, subjectId]
        );

        res.status(201).json({
            success: true,
            message: "과목이 등록되었습니다."
        });

    } catch (error) {
        console.error("과목 등록 오류:", error);

        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
}


// 다른 파일에서 사용할 수 있도록 함수 내보내기
module.exports = {
    getSubjects,
    getSubjectsByDepartment,
    createSubject
};