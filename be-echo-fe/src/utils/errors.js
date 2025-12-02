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
  const errorMessage = error.message || "";

  // Firebase Auth 에러
  const authErrors = {
    "auth/user-not-found": "등록되지 않은 이메일입니다.",
    "auth/wrong-password": "비밀번호가 틀렸습니다.",
    "auth/invalid-credential": "아이디 또는 비밀번호가 틀렸습니다.",
    "auth/invalid-password": "비밀번호가 틀렸습니다.",
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

  const errorMessageLower = errorMessage.toLowerCase();
  if (
    errorMessageLower.includes("wrong password") ||
    errorMessageLower.includes("invalid password") ||
    errorMessageLower.includes("invalid credential") ||
    errorMessageLower.includes("비밀번호") ||
    (errorMessageLower.includes("password") &&
      (errorMessageLower.includes("incorrect") ||
        errorMessageLower.includes("wrong") ||
        errorMessageLower.includes("invalid")))
  ) {
    return "비밀번호가 틀렸습니다.";
  }

  // HTTP 에러 코드 처리
  if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
    return "잘못된 요청입니다. 입력 정보를 확인해주세요.";
  }
  if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
    return "인증이 필요합니다. 다시 로그인해주세요.";
  }
  if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
    return "접근 권한이 없습니다.";
  }
  if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
    return "요청한 정보를 찾을 수 없습니다.";
  }
  if (
    errorMessage.includes("500") ||
    errorMessage.includes("Internal Server Error")
  ) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  if (
    errorMessage.includes("503") ||
    errorMessage.includes("Service Unavailable")
  ) {
    return "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }

  // 네트워크 관련 에러
  if (
    errorMessage.includes("Network") ||
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
  }

  // redirect_uri 관련 에러
  if (
    errorMessage.includes("redirect_uri") ||
    errorMessage.includes("redirect_uri_mismatch")
  ) {
    return "로그인 설정 오류가 발생했습니다. 관리자에게 문의해주세요.";
  }

  if (
    errorMessage.includes("http://") ||
    errorMessage.includes("https://") ||
    errorMessage.includes("HTTP") ||
    errorMessage.includes("Error:") ||
    errorMessage.includes("TypeError:") ||
    errorMessage.includes("SyntaxError:")
  ) {
    return defaultMessage;
  }

  // 기본 메시지
  return errorMessage &&
    !errorMessage.includes("http") &&
    !errorMessage.includes("Error:")
    ? errorMessage
    : defaultMessage;
};
