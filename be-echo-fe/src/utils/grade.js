// 등급 정의
export const GRADE_THRESHOLDS = {
  bronze: 0,
  silver: 30,
  gold: 60,
  platinum: 120,
  diamond: 200,
  master: 300,
};

// 등급 순서
export const GRADE_ORDER = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "master",
];

// 등급 코드로 변환
export const deriveGradeCode = (lp) => {
  const score = Number(lp || 0);
  if (score >= GRADE_THRESHOLDS.master) return "master";
  if (score >= GRADE_THRESHOLDS.diamond) return "diamond";
  if (score >= GRADE_THRESHOLDS.platinum) return "platinum";
  if (score >= GRADE_THRESHOLDS.gold) return "gold";
  if (score >= GRADE_THRESHOLDS.silver) return "silver";
  if (score >= GRADE_THRESHOLDS.bronze) return "bronze";
  return "bronze";
};

export const deriveGradeName = (lp) => {
  const code = deriveGradeCode(lp);
  const gradeNames = {
    bronze: "브론즈 등급",
    silver: "실버 등급",
    gold: "골드 등급",
    platinum: "플래티넘 등급",
    diamond: "다이아몬드 등급",
    master: "에코 마스터",
  };
  return gradeNames[code] || "브론즈 등급";
};

// 다음 등급까지 필요한 LP 계산
export const getNextGradeLP = (lp) => {
  const currentGrade = deriveGradeCode(lp);
  const currentIndex = GRADE_ORDER.indexOf(currentGrade);

  if (currentIndex === -1 || currentIndex === GRADE_ORDER.length - 1) {
    return null; // 이미 최고 등급
  }

  const nextGrade = GRADE_ORDER[currentIndex + 1];
  return GRADE_THRESHOLDS[nextGrade];
};

// 현재 등급 내 진행도
export const getGradeProgress = (lp) => {
  const currentGrade = deriveGradeCode(lp);
  const currentThreshold = GRADE_THRESHOLDS[currentGrade];
  const currentIndex = GRADE_ORDER.indexOf(currentGrade);

  if (currentIndex === GRADE_ORDER.length - 1) {
    return 100; // 최고 등급
  }

  const nextGrade = GRADE_ORDER[currentIndex + 1];
  const nextThreshold = GRADE_THRESHOLDS[nextGrade];
  const range = nextThreshold - currentThreshold;
  const progress = lp - currentThreshold;

  return Math.min(100, Math.max(0, (progress / range) * 100));
};

// 등급 정보 전체 반환
export const getGradeInfo = (lp) => {
  const code = deriveGradeCode(lp);
  const name = deriveGradeName(lp);
  const nextLP = getNextGradeLP(lp);
  const progress = getGradeProgress(lp);

  return {
    code,
    name,
    lp,
    nextLP,
    progress,
    remainingLP: nextLP ? nextLP - lp : 0,
  };
};

// 등급 가이드 생성
export const getGradeGuide = () => {
  return GRADE_ORDER.map((grade) => {
    const threshold = GRADE_THRESHOLDS[grade];
    const name = deriveGradeName(threshold);
    return {
      label: name,
      range:
        threshold === 0
          ? "0 LP부터"
          : threshold === GRADE_THRESHOLDS.master
          ? `${threshold} LP 이상`
          : `${threshold} LP`,
      description: name,
      accent: grade,
    };
  }).reverse();
};
