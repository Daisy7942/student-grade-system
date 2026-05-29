/**
 * 학생 및 성적 관리 시스템 - 프론트엔드 스크립트
 * 화면 이벤트 처리, API 요청, 학생/성적/과목 화면 렌더링을 담당한다.
 */


/* ==============================
   1. 기본 설정 및 상태
============================== */

const API_BASE = "http://localhost:5000/api";

let state = {
    selectedStudent: null,      // 현재 선택된 학생
    studentModalMode: "add",    // 학생 모달 상태: add 또는 edit
    editingScoreId: null        // 성적 수정 시 사용할 ID
};


/* ==============================
   2. DOM 요소 모음
============================== */

const el = {
    // 학생 관련
    studentCount: document.getElementById("studentCount"),
    studentTableBody: document.getElementById("studentTableBody"),
    searchName: document.getElementById("searchName"),
    searchDepartment: document.getElementById("searchDepartment"),

    // 학생 모달
    studentModal: document.getElementById("studentModal"),
    studentForm: document.getElementById("studentForm"),
    studentModalTitle: document.getElementById("studentModalTitle"),
    studentNo: document.getElementById("studentNo"),
    studentName: document.getElementById("studentName"),
    studentDepartment: document.getElementById("studentDepartment"),

    // 성적 모달
    scoreModal: document.getElementById("scoreModal"),
    scoreForm: document.getElementById("scoreForm"),
    scoreModalTitle: document.getElementById("scoreModalTitle"),

    // 과목 모달
    subjectModal: document.getElementById("subjectModal"),
    subjectForm: document.getElementById("subjectForm"),

    // 성적 관련
    scoreTableBody: document.getElementById("scoreTableBody"),
    scoreTableBox: document.getElementById("scoreTableBox"),
    scoreEmptyState: document.getElementById("scoreEmptyState"),
    scoreSummaryBox: document.getElementById("scoreSummaryBox"),
    selectedStudentBox: document.getElementById("selectedStudentBox"),
    scoreStudentPanel: document.getElementById("scoreStudentPanel"),
    subjectSelect: document.getElementById("subjectSelect")
};


/* ==============================
   3. 공통 함수
============================== */

// API 요청 공통 처리 함수
async function requestApi(url, options = {}) {
    try {
        const response = await fetch(API_BASE + url, {
            headers: { "Content-Type": "application/json" },
            ...options
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "요청 실패");
        }

        return result;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}


// HTML 태그가 그대로 삽입되는 것을 방지
function escapeHtml(str) {
    if (!str) return "";

    return String(str).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[m]);
}


// 점수를 문자 등급으로 변환
function getGrade(score) {
    const s = Number(score);

    if (!s && s !== 0) return "-";
    if (s >= 95) return "A+";
    if (s >= 90) return "A";
    if (s >= 85) return "B+";
    if (s >= 80) return "B";
    if (s >= 75) return "C+";
    if (s >= 70) return "C";
    if (s >= 65) return "D+";
    if (s >= 60) return "D";

    return "F";
}



/* ==============================
   4. 학생 관리
============================== */

// 학생 목록 조회
async function loadStudents() {
    try {
        const keyword = el.searchName.value.trim();
        const dept = el.searchDepartment.value;

        let url = `/students?keyword=${encodeURIComponent(keyword)}&department=${encodeURIComponent(dept)}`;

        const res = await requestApi(url);

        renderStudentTable(res.data);
        el.studentCount.textContent = res.totalCount ?? res.data.length;

    } catch (e) {
        alert("학생 목록을 불러오지 못했습니다.");
    }
}


// 학생 목록 화면 출력
function renderStudentTable(students) {
    el.studentTableBody.innerHTML = students.length
        ? ""
        : '<tr><td colspan="4" class="empty-message">학생이 없습니다.</td></tr>';

    students.forEach(s => {
        const tr = document.createElement("tr");

        if (state.selectedStudent && state.selectedStudent.id === s.id) {
            tr.classList.add("selected-row");
        }

        tr.innerHTML = `
            <td>${escapeHtml(s.student_no)}</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.department)}</td>
            <td>
                <div class="row-actions">
                    <button type="button" class="row-btn edit">✏️ 수정</button>
                    <button type="button" class="row-btn delete">🗑 삭제</button>
                </div>
            </td>
        `;

        // 행 클릭 시 학생 선택
        tr.onclick = () => selectStudent(s);

        // 수정/삭제 버튼은 행 클릭 이벤트와 분리
        tr.querySelector(".edit").onclick = (e) => {
            e.stopPropagation();
            openStudentModal("edit", s);
        };

        tr.querySelector(".delete").onclick = (e) => {
            e.stopPropagation();
            deleteStudent(s);
        };

        el.studentTableBody.appendChild(tr);
    });
}


// 학생 선택 처리
function selectStudent(student) {
    state.selectedStudent = student;

    renderSelectedInfo();
    loadScores();
    loadStudents();
}


// 선택된 학생 정보 표시
function renderSelectedInfo() {
    if (!state.selectedStudent) {
        el.scoreStudentPanel.classList.add("hidden");
        return;
    }

    el.scoreStudentPanel.classList.remove("hidden");

    el.selectedStudentBox.innerHTML = `
        <div class="selected-info">
            <div class="selected-avatar">👤</div>
            <div class="selected-text">
                <strong>${escapeHtml(state.selectedStudent.name)}</strong>
                <span>${escapeHtml(state.selectedStudent.student_no)}</span>
                <em>🏫 ${escapeHtml(state.selectedStudent.department)}</em>
            </div>
        </div>
    `;
}


/* ==============================
   5. 성적 관리
============================== */

// 선택된 학생의 성적 조회
async function loadScores() {
    if (!state.selectedStudent) {
        return resetScoreView();
    }

    try {
        const res = await requestApi(`/scores/student/${state.selectedStudent.id}`);
        renderScoreTable(res.data.scores, res.data.summary);

    } catch (e) {
        alert("성적을 불러오지 못했습니다.");
    }
}


// 성적표와 요약 정보 출력
function renderScoreTable(scores, summary) {
    el.scoreEmptyState.classList.add("hidden");
    el.scoreTableBox.classList.remove("hidden");
    el.scoreSummaryBox.classList.remove("hidden");

    el.scoreTableBody.innerHTML = scores.length
        ? ""
        : '<tr><td colspan="4" class="empty-message">등록된 성적이 없습니다.</td></tr>';

    scores.forEach(s => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(s.subject_name)}</td>
            <td>${s.score}</td>
            <td>${getGrade(s.score)}</td>
            <td>
                <div class="row-actions">
                    <button type="button" class="row-btn edit">✏️ 수정</button>
                    <button type="button" class="row-btn delete">🗑 삭제</button>
                </div>
            </td>
        `;

        tr.querySelector(".edit").onclick = () => openScoreModal(s);
        tr.querySelector(".delete").onclick = () => deleteScore(s);

        el.scoreTableBody.appendChild(tr);
    });

    // 평균 점수를 4.5 만점 평점으로 변환
    const gpa = ((summary.average / 100) * 4.5).toFixed(1);

    el.scoreSummaryBox.innerHTML = `
        <div class="score-summary-item">
            <div class="score-summary-label">평균 점수</div>
            <div class="score-summary-value">${summary.average}</div>
        </div>
        <div class="summary-divider"></div>
        <div class="score-summary-item">
            <div class="score-summary-label">평균 평점</div>
            <div class="score-summary-value">${gpa} <span>/ 4.5</span></div>
        </div>
    `;
}


/* ==============================
   6. 모달 처리
============================== */

// 학생 추가/수정 모달 열기
function openStudentModal(mode, data = null) {
    state.studentModalMode = mode;
    
    // 모드에 따라 선택 학생 정보 동기화
    if (mode === "add") {
        state.selectedStudent = null;
    } else {
        state.selectedStudent = data;
    }

    el.studentModalTitle.textContent = mode === "add" ? "학생 추가" : "학생 수정";
    document.getElementById("saveStudentBtn").textContent = mode === "add" ? "등록" : "수정";

    // 필드에 값 채우기
    el.studentNo.value = data ? data.student_no : "";
    el.studentName.value = data ? data.name : "";
    el.studentDepartment.value = data ? data.department : "";

    el.studentModal.classList.add("show");
}


// 성적 등록/수정 모달 열기
async function openScoreModal(scoreData = null) {
    if (!state.selectedStudent) {
        return alert("학생을 먼저 선택해주세요.");
    }

    el.scoreModalTitle.textContent = scoreData ? "성적 수정" : "성적 등록";
    document.getElementById("saveScoreBtn").textContent = scoreData ? "수정" : "등록";

    document.getElementById("scoreStudentName").value = state.selectedStudent.name;
    document.getElementById("scoreStudentDepartment").value = state.selectedStudent.department;
    document.getElementById("scoreInput").value = scoreData ? scoreData.score : "";

    await loadSubjects(state.selectedStudent.department);

    if (scoreData) {
        el.subjectSelect.value = scoreData.subject_id;
    }

    el.scoreModal.classList.add("show");
}


// 선택된 학생의 학과에 맞는 과목 목록 조회
async function loadSubjects(dept) {
    try {
        const res = await requestApi(`/subjects?department=${encodeURIComponent(dept)}`);

        el.subjectSelect.innerHTML =
            '<option value="">과목 선택</option>' +
            res.data
                .map(s => `<option value="${s.id}">${escapeHtml(s.subject_name)}</option>`)
                .join("");

    } catch (e) {
        alert("과목 목록을 불러오지 못했습니다.");
    }
}


/* ==============================
   7. 저장 및 삭제 처리
============================== */

// 학생 등록/수정 저장
el.studentForm.onsubmit = async (e) => {
    e.preventDefault();

    const data = {
        student_no: el.studentNo.value.trim(),
        name: el.studentName.value.trim(),
        department: el.studentDepartment.value
    };

    try {
        let url = "/students";
        let method = "POST";

        if (state.studentModalMode === "edit") {
            const currentId = state.selectedStudent?.id;
            if (!currentId) {
                throw new Error("수정할 학생 정보가 유효하지 않습니다. 다시 선택해주세요.");
            }
            url = `/students/${currentId}`;
            method = "PUT";
        }

        await requestApi(url, {
            method,
            body: JSON.stringify(data)
        });

        alert("저장되었습니다.");
        el.studentModal.classList.remove("show");
        
        // 목록 갱신
        await loadStudents();
        
        // 현재 선택된 학생을 수정했다면 선택 정보도 새 입력값으로 갱신
        if (state.selectedStudent) {
            state.selectedStudent = {
                ...state.selectedStudent,
                ...data
            };
            renderSelectedInfo();
        }

    } catch (err) {
        alert(err.message);
    }
};


// 성적 등록/수정 저장
el.scoreForm.onsubmit = async (e) => {
    e.preventDefault();

    const currentStudentId = state.selectedStudent?.id;
    if (!currentStudentId) {
        return alert("선택된 학생 정보가 없습니다.");
    }

    const data = {
        student_id: currentStudentId,
        subject_id: el.subjectSelect.value,
        score: document.getElementById("scoreInput").value
    };

    try {
        await requestApi("/scores", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("저장되었습니다.");
        el.scoreModal.classList.remove("show");
        loadScores();

    } catch (err) {
        alert(err.message);
    }
};


// 학생 삭제
async function deleteStudent(s) {
    if (!confirm(`${s.name} 학생을 삭제하시겠습니까?`)) {
        return;
    }

    try {
        await requestApi(`/students/${s.id}`, {
            method: "DELETE"
        });

        alert("삭제되었습니다.");

        if (state.selectedStudent?.id === s.id) {
            resetScoreView();
        }

        loadStudents();

    } catch (e) {
        alert("연결된 성적이 있어 삭제할 수 없습니다.");
    }
}


// 성적 삭제
async function deleteScore(s) {
    if (!confirm("성적을 삭제하시겠습니까?")) {
        return;
    }

    try {
        await requestApi(`/scores/${s.id}`, {
            method: "DELETE"
        });

        loadScores();

    } catch (e) {
        alert("삭제 실패");
    }
}


// 성적 영역 초기화
function resetScoreView() {
    state.selectedStudent = null;

    el.scoreStudentPanel.classList.add("hidden");
    el.scoreEmptyState.classList.remove("hidden");
    el.scoreTableBox.classList.add("hidden");
    el.scoreSummaryBox.classList.add("hidden");
    
    // 목록 갱신 (선택 하이라이트 제거)
    loadStudents();
}


/* ==============================
   8. 이벤트 연결
============================== */

// 학생 추가
document.getElementById("addStudentBtn").onclick = () => openAddStudentModal();

function openAddStudentModal() {
    openStudentModal("add");
}


// 학생 검색
document.getElementById("searchBtn").onclick = loadStudents;

document.getElementById("resetSearchBtn").onclick = () => {
    el.searchName.value = "";
    el.searchDepartment.value = "";
    loadStudents();
};


// 성적 관련 버튼
document.getElementById("addScoreBtn").onclick = () => openScoreModal();
document.getElementById("resetScoreBtn").onclick = resetScoreView;


// 모달 닫기
document.querySelectorAll(".close-btn, #cancelStudentModalBtn, #cancelScoreModalBtn, #cancelSubjectModalBtn").forEach(btn => {
    btn.onclick = () => {
        el.studentModal.classList.remove("show");
        el.scoreModal.classList.remove("show");
        el.subjectModal.classList.remove("show");
    };
});


// 과목 추가 모달 열기
document.getElementById("openSubjectModalBtn").onclick = () => {
    if (!state.selectedStudent) {
        return alert("학생을 먼저 선택해주세요.");
    }

    document.getElementById("subjectDepartment").value = state.selectedStudent.department;
    document.getElementById("newSubjectName").value = "";

    el.subjectModal.classList.add("show");
};


// 과목 추가 저장
el.subjectForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById("newSubjectName").value.trim();

    try {
        await requestApi("/subjects", {
            method: "POST",
            body: JSON.stringify({
                department: state.selectedStudent.department,
                subject_name: name
            })
        });

        alert("과목이 추가되었습니다.");
        el.subjectModal.classList.remove("show");
        loadSubjects(state.selectedStudent.department);

    } catch (err) {
        alert("과목 추가 실패");
    }
};


/* ==============================
   9. 초기 실행
============================== */

loadStudents();
