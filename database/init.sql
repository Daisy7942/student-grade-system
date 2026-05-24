-- 학생 정보 및 성적 관리 시스템 DB 초기화 스크립트
-- Docker Compose로 MySQL 컨테이너가 처음 실행될 때 자동으로 실행됩니다.

-- 사용할 데이터베이스를 선택합니다.
USE student_grade_db;

-- 기존 테이블이 있을 경우 삭제합니다.
-- scores 테이블은 students 테이블을 참조하므로 먼저 삭제해야 합니다.
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS students;

-- 학생 기본 정보 테이블
-- 학생의 학번, 이름, 학과 정보를 저장합니다.
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 성적 정보 테이블
-- 학생별 국어, 영어, 수학 점수와 평균, 등급을 저장합니다.
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    korean INT NOT NULL,
    english INT NOT NULL,
    math INT NOT NULL,
    average DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_scores_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_korean_score CHECK (korean BETWEEN 0 AND 100),
    CONSTRAINT chk_english_score CHECK (english BETWEEN 0 AND 100),
    CONSTRAINT chk_math_score CHECK (math BETWEEN 0 AND 100)
);