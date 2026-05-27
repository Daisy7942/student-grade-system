USE student_grade_db;

INSERT IGNORE INTO subjects (subject_name) VALUES
('금융기초'), ('핀테크'), ('회계원리'),
('경영학원론'), ('마케팅기초'), ('조직관리'),
('조리기초'), ('제과제빵'), ('식품위생'),
('디자인기초'), ('색채학'), ('디지털드로잉');

INSERT IGNORE INTO department_subjects (department, subject_id)
SELECT '스마트금융과', id FROM subjects WHERE subject_name IN ('금융기초', '핀테크', '회계원리');

INSERT IGNORE INTO department_subjects (department, subject_id)
SELECT '경영학과', id FROM subjects WHERE subject_name IN ('경영학원론', '마케팅기초', '조직관리');

INSERT IGNORE INTO department_subjects (department, subject_id)
SELECT '요리과', id FROM subjects WHERE subject_name IN ('조리기초', '제과제빵', '식품위생');

INSERT IGNORE INTO department_subjects (department, subject_id)
SELECT '디자인과', id FROM subjects WHERE subject_name IN ('디자인기초', '색채학', '디지털드로잉');
