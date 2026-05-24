/**
 * 성적 계산 서비스
 *
 * 역할:
 * - 학생이 등록한 여러 과목 점수를 기준으로 평균을 계산합니다.
 * - 평균 점수에 따라 등급을 산출합니다.
 * - 과목 수가 고정되어 있지 않아도 계산할 수 있도록 배열 기반으로 처리합니다.
 */

/**
 * 평균 점수 계산 함수
 *
 * @param {number[]} scores 점수 배열
 * @returns {number} 소수점 둘째 자리까지 반영한 평균 점수
 */
function calculateAverage(scores) {
    if (!scores || scores.length === 0) {
        return 0;
    }

    const total = scores.reduce((sum, score) => {
        return sum + Number(score);
    }, 0);

    const average = total / scores.length;

    return Number(average.toFixed(2));
}

/**
 * 등급 계산 함수
 *
 * @param {number} average 평균 점수
 * @returns {string} 평균 점수에 따른 등급
 */
function calculateGrade(average) {
    if (average >= 90) {
        return "A";
    }

    if (average >= 80) {
        return "B";
    }

    if (average >= 70) {
        return "C";
    }

    if (average >= 60) {
        return "D";
    }

    return "F";
}

module.exports = {
    calculateAverage,
    calculateGrade
};