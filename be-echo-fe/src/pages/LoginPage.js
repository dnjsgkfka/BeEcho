import React, { useState } from "react";
import "../styles/login.css";
import { useAuth } from "../contexts/AuthContext";
import { GoogleIcon } from "../components/icons";
import { getFirebaseErrorMessage } from "../utils/errors";
import { logError } from "../utils/logger";

const LoginPage = () => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loading,
  } = useAuth();
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "google"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getErrorMessage = (error) => {
    return getFirebaseErrorMessage(error, "오류가 발생했습니다. 다시 시도해주세요.");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      logError("로그인 오류:", err);
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err) {
      logError("인증 오류:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <div className="login-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🌱</div>
          <h1>BeEcho</h1>
          <p className="login-subtitle">텀블러 인증으로 지구를 지켜요</p>
        </div>

        {/* 인증 방법 선택 */}
        <div className="login-method-tabs">
          <button
            className={`login-method-tab ${
              authMethod === "email" ? "active" : ""
            }`}
            onClick={() => {
              setAuthMethod("email");
              setError(null);
            }}
          >
            이메일
          </button>
          <button
            className={`login-method-tab ${
              authMethod === "google" ? "active" : ""
            }`}
            onClick={() => {
              setAuthMethod("google");
              setError(null);
            }}
          >
            구글
          </button>
        </div>

        <div className="login-content">
          {authMethod === "google" ? (
            <>
              <button
                className="login-button login-button-google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="login-spinner-small"></div>
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>구글로 로그인</span>
                  </>
                )}
              </button>

              <div className="login-info">
                <p>
                  구글 계정으로 간편하게 로그인하고
                  <br />
                  텀블러 인증을 시작해보세요!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* 로그인/회원가입 전환 */}
              <div className="login-mode-tabs">
                <button
                  className={`login-mode-tab ${
                    mode === "login" ? "active" : ""
                  }`}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  로그인
                </button>
                <button
                  className={`login-mode-tab ${
                    mode === "signup" ? "active" : ""
                  }`}
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                >
                  회원가입
                </button>
              </div>

              <form className="login-form" onSubmit={handleEmailAuth}>
                {mode === "signup" && (
                  <div className="login-form-field">
                    <label htmlFor="name">이름</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="login-form-field">
                  <label htmlFor="email">이메일</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="login-form-field">
                  <label htmlFor="password">비밀번호</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                {error && <p className="login-error">{error}</p>}

                <button
                  type="submit"
                  className="login-button login-button-primary"
                  disabled={
                    isLoading ||
                    !email ||
                    !password ||
                    (mode === "signup" && !name)
                  }
                >
                  {isLoading
                    ? "처리 중..."
                    : mode === "login"
                    ? "로그인"
                    : "회원가입"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
