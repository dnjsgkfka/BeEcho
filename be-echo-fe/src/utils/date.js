/**
 * 로컬 시간대 기준으로 날짜 문자열 생성 (YYYY-MM-DD)
 * UTC 문제를 방지하기 위해 로컬 시간대를 사용합니다.
 * @param {Date} date - 날짜 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const getLocalDateString = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * 오늘 날짜 문자열 반환
 * @returns {string} 오늘 날짜 (YYYY-MM-DD)
 */
export const getTodayDateString = () => {
  return getLocalDateString(new Date());
};

/**
 * 상대 시간 포맷팅 (예: "방금 전", "5분 전", "2시간 전")
 * @param {Date|Timestamp|string} timestamp - 타임스탬프
 * @returns {string} 포맷팅된 시간 문자열
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return "";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};
