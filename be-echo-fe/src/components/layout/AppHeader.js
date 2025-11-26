import React, { useEffect, useState } from "react";
import { IconButton } from "../ui";
import { SettingsIcon } from "../icons";
import { ReactComponent as LogoIcon } from "../icons/LogoIcon.svg";
import { useAuth } from "../../contexts/AuthContext";

const AppHeader = ({ userName, lp, streak, onUpdateName }) => {
  const { logout, deleteAccount } = useAuth();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(userName || "");

  useEffect(() => {
    if (isSettingsOpen) {
      setNameInput(userName || "");
    }
  }, [isSettingsOpen, userName]);

  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextName = nameInput.trim();
    if (!nextName) {
      return;
    }
    try {
      await onUpdateName?.({ name: nextName });
      setSettingsOpen(false);
    } catch (error) {
      console.error("이름 수정 오류:", error);
      alert("이름 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <div className="app-logo">
            <LogoIcon width={28} height={28} />
          </div>
          <div className="brand-copy">
            <span className="brand-name">
              Be<span className="brand-name-accent">Echo</span>.
            </span>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-user">
            <span className="header-user-name">{userName || "user"}</span>
            <span className="header-user-meta">
              {lp ?? 0} LP · {streak ?? 0}일
            </span>
          </div>
          <IconButton label="설정" onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>

      {/* 설정 */}
      {isSettingsOpen && (
        <div className="header-settings">
          <form className="header-settings-form" onSubmit={handleSubmit}>
            <label htmlFor="profile-name">닉네임 수정</label>
            <input
              id="profile-name"
              type="text"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="닉네임을 입력하세요"
            />
            <div className="header-settings-actions">
              <button type="button" onClick={() => setSettingsOpen(false)}>
                취소
              </button>
              <button type="submit" className="primary">
                저장
              </button>
            </div>
            <button
              type="button"
              className="danger"
              onClick={async () => {
                if (window.confirm("로그아웃 하시겠습니까?")) {
                  try {
                    await logout();
                  } catch (error) {
                    console.error("로그아웃 오류:", error);
                    alert("로그아웃 중 오류가 발생했습니다.");
                  }
                }
              }}
            >
              로그아웃
            </button>
            <button
              type="button"
              className="danger"
              onClick={async () => {
                if (
                  window.confirm(
                    "회원탈퇴를 하시면 모든 데이터가 삭제되고 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?"
                  )
                ) {
                  if (
                    window.confirm(
                      "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                    )
                  ) {
                    try {
                      await deleteAccount();
                      alert("회원탈퇴가 완료되었습니다.");
                    } catch (error) {
                      console.error("회원탈퇴 오류:", error);
                      alert(
                        error.message ||
                          "회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요."
                      );
                    }
                  }
                }
              }}
            >
              회원탈퇴
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
