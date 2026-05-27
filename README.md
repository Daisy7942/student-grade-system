# 🎓 학생 정보 및 성적 관리 시스템 (Student Grade Management System)

학생들의 기본 정보와 과목별 성적을 효율적으로 관리할 수 있는 웹 기반 관리 시스템입니다. 도커(Docker)를 통해 복잡한 설정 없이 즉시 실행 가능합니다.

## 🚀 주요 기능

*   **학생 관리**: 학생 등록, 수정, 삭제 및 이름/학번/학과별 검색 기능
*   **성적 조회**: 학생별 과목 점수, 평균 점수, 등급(A+~F), 평균 평점(4.5 만점) 자동 계산
*   **과목 관리**: 학과별 기본 과목 자동 생성 및 사용자 정의 과목 추가 기능
*   **반응형 UI**: 데스크탑과 모바일 환경에 최적화된 깔끔한 인터페이스

## 🛠 기술 스택

### Frontend
*   **Language**: HTML5, CSS3, JavaScript (Vanilla JS)
*   **Web Server**: Nginx (Alpine)

### Backend
*   **Runtime**: Node.js (Express)
*   **Database**: MySQL 8.0
*   **Persistence**: Docker Volumes를 통한 데이터 영구 보존

## 📦 설치 및 실행 방법

이 프로젝트는 **Docker**와 **Docker Compose**가 설치되어 있어야 합니다.

1.  **저장소 복제**
    ```bash
    git clone <repository-url>
    cd student-grade-system
    ```

2.  **시스템 실행**
    ```bash
    # 컨테이너 빌드 및 백그라운드 실행
    docker compose up --build -d
    ```

3.  **접속 주소**
    *   **Frontend**: [http://localhost:8080](http://localhost:8080)
    *   **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
    *   **Database**: `localhost:3307` (외부 접속용)

## 🗄 데이터베이스 구조

*   `students`: 학생 기본 정보 (학번, 이름, 학과 등)
*   `subjects`: 전체 과목 정보
*   `scores`: 학생별/과목별 성적 데이터 (0~100점)
*   `department_subjects`: 학과별 지정 과목 매핑 정보

## 📝 참고 사항

*   **포트 충돌**: 현재 프론트엔드는 `8080` 포트를 사용합니다. 만약 다른 포트를 사용하고 싶다면 `docker-compose.yml`의 `frontend` 포트 설정을 수정하세요.
*   **데이터 유지**: 컨테이너를 삭제(down)해도 학생 데이터는 도커 볼륨에 안전하게 보관됩니다. 데이터를 완전히 초기화하려면 볼륨을 삭제해야 합니다.

---
© 2026 Student Grade System. All rights reserved.
