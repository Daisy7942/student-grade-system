/**
 * 성적 계산 서비스
 */

// 평균 계산 (소수점 둘째자리)
function calculateAverage(scores) {
    if (!scores || scores.length === 0) return 0;
    
    const total = scores.reduce((sum, s) => sum + Number(s), 0);
    return Number((total / scores.length).toFixed(2));
}

// 등급 산출
function calculateGrade(avg) {
    if (avg >= 95) return "A+";
    if (avg >= 90) return "A";
    if (avg >= 85) return "B+";
    if (avg >= 80) return "B";
    if (avg >= 75) return "C+";
    if (avg >= 70) return "C";
    if (avg >= 65) return "D+";
    if (avg >= 60) return "D";
    return "F";
}

module.exports = { calculateAverage, calculateGrade };
