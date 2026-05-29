-- 학생 정보 및 성적 관리 시스템 DB 초기화 스크립트
-- MySQL 컨테이너가 처음 실행될 때 자동으로 실행됩니다.

USE student_grade_db;

ALTER DATABASE student_grade_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 기존 테이블 삭제
-- 참조 관계가 있는 자식 테이블부터 삭제합니다.
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS department_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;

-- 학생 기본 정보 테이블
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 과목 정보 테이블
-- 시스템에서 사용할 과목 목록을 관리합니다.
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 학과별 기본 과목 테이블
-- 학과마다 기본으로 사용하는 과목을 관리합니다.
CREATE TABLE department_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    subject_id INT NOT NULL,

    CONSTRAINT fk_department_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_department_subject
        UNIQUE (department, subject_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 성적 정보 테이블
-- 학생별, 과목별 점수를 저장합니다.
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_scores_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_scores_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_score_range
        CHECK (score BETWEEN 0 AND 100),

    CONSTRAINT uq_student_subject
        UNIQUE (student_id, subject_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 기본 과목 데이터
INSERT INTO subjects (subject_name) VALUES
('금융기초'),
('핀테크'),
('회계원리'),
('경영학원론'),
('마케팅기초'),
('조직관리'),
('조리기초'),
('제과제빵'),
('식품위생'),
('디자인기초'),
('색채학'),
('디지털드로잉');

-- 학과별 기본 과목 데이터
INSERT INTO department_subjects (department, subject_id)
SELECT '스마트금융과', id FROM subjects
WHERE subject_name IN ('금융기초', '핀테크', '회계원리');

INSERT INTO department_subjects (department, subject_id)
SELECT '경영학과', id FROM subjects
WHERE subject_name IN ('경영학원론', '마케팅기초', '조직관리');

INSERT INTO department_subjects (department, subject_id)
SELECT '요리과', id FROM subjects
WHERE subject_name IN ('조리기초', '제과제빵', '식품위생');

INSERT INTO department_subjects (department, subject_id)
SELECT '디자인과', id FROM subjects
WHERE subject_name IN ('디자인기초', '색채학', '디지털드로잉');
