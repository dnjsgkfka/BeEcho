import React, { useEffect, useState } from "react";
import { IconButton } from "../ui";
import { SettingsIcon, RotateIcon } from "../icons";
import { ReactComponent as LogoIcon } from "../icons/LogoIcon.svg";

const AppHeader = ({ userName, lp, streak, onReset, onUpdateName }) => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextName = nameInput.trim();
    if (!nextName) {
      return;
    }
    onUpdateName?.({ name: nextName });
    setSettingsOpen(false);
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
          <IconButton
            label="초기화"
            onClick={() => {
              if (
                onReset &&
                window.confirm(
                  "데이터 초기화 버튼 클릭 시 데이터가 초기화됩니다. 정말 초기화하시겠습니까?"
                )
              ) {
                onReset();
              }
            }}
          >
            <RotateIcon />
          </IconButton>
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
            {onReset && (
              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "데이터 초기화 버튼 클릭 시 데이터가 초기화됩니다. 정말 초기화하시겠습니까?"
                    )
                  ) {
                    onReset();
                    setSettingsOpen(false);
                  }
                }}
              >
                모든 데이터 초기화
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
