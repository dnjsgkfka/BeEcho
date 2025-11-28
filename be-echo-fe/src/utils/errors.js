/**
 * Firebase 에러를 사용자 메시지로 변환
 * @param {Error} error - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 사용자 에러 메시지
 */
export const getFirebaseErrorMessage = (
  error,
  defaultMessage = "오류가 발생했습니다."
) => {
  if (!error) return defaultMessage;

  const errorCode = error.code || error.message;

  // Firebase Auth
  const authErrors = {
    "auth/user-not-found": "등록되지 않은 이메일입니다.",
    "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
    "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
    "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
    "auth/invalid-email": "올바른 이메일 형식이 아닙니다.",
    "auth/too-many-requests":
      "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
    "auth/unauthorized-domain":
      "이 도메인에서 로그인할 수 없습니다. 관리자에게 문의해주세요.",
    "auth/popup-blocked":
      "팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.",
    "auth/popup-closed-by-user": "로그인 창이 닫혔습니다.",
    "auth/network-request-failed":
      "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
    "auth/requires-recent-login": "보안을 위해 다시 로그인해주세요.",
  };

  if (authErrors[errorCode]) {
    return authErrors[errorCode];
  }

  // redirect_uri 관련 에러
  if (
    error.message?.includes("redirect_uri") ||
    error.message?.includes("redirect_uri_mismatch")
  ) {
    return "로그인 설정 오류가 발생했습니다. 관리자에게 문의해주세요.";
  }

  // 기본 메시지
  return error.message || defaultMessage;
};

