import React, { useEffect, useState, useRef } from "react";
import { IconButton } from "../ui";
import { SettingsIcon } from "../icons";
import { ReactComponent as LogoIcon } from "../icons/LogoIcon.svg";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { uploadProfileImage, deleteProfileImage } from "../../services/profile";

const AppHeader = ({ userName, lp, streak, photoURL, onUpdateName, onUpdatePhoto }) => {
  const { logout, deleteAccount, user } = useAuth();
  const toast = useToast();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(userName || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

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
      toast.success("닉네임이 변경되었습니다.");
    } catch (error) {
      console.error("이름 수정 오류:", error);
      toast.error("이름 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const imageDataUrl = e.target.result;
          const downloadURL = await uploadProfileImage(imageDataUrl, user?.id);
          await onUpdatePhoto?.({ photoURL: downloadURL });
          toast.success("프로필 사진이 변경되었습니다.");
        } catch (error) {
          console.error("프로필 사진 업로드 오류:", error);
          toast.error("프로필 사진 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        toast.error("이미지 읽기 중 오류가 발생했습니다.");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("프로필 사진 처리 오류:", error);
      setIsUploading(false);
      toast.error("프로필 사진 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoURL) {
      toast.info("삭제할 프로필 사진이 없습니다.");
      return;
    }

    if (!window.confirm("프로필 사진을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProfileImage(user?.id);
      await onUpdatePhoto?.({ photoURL: null });
      toast.success("프로필 사진이 삭제되었습니다.");
    } catch (error) {
      console.error("프로필 사진 삭제 오류:", error);
      toast.error("프로필 사진 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
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
            <div
              className="header-user-avatar"
              onClick={handleImageSelect}
              style={{ cursor: isUploading ? "wait" : "pointer" }}
              title="프로필 사진 변경"
            >
              {photoURL && !isUploading ? (
                <img src={photoURL} alt={userName || "user"} />
              ) : (
                <span>{userName?.[0] || "U"}</span>
              )}
              {isUploading && (
                <div className="header-user-avatar-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{userName || "user"}</span>
              <span className="header-user-meta">
                {lp ?? 0} LP · {streak ?? 0}일
              </span>
            </div>
          </div>
          <IconButton label="설정" onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
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
            {photoURL && (
              <button
                type="button"
                className="delete-photo-button"
                onClick={handleDeletePhoto}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "프로필 사진 삭제"}
              </button>
            )}
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
                    toast.success("로그아웃되었습니다.");
                  } catch (error) {
                    console.error("로그아웃 오류:", error);
                    toast.error("로그아웃 중 오류가 발생했습니다.");
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
                      toast.success("회원탈퇴가 완료되었습니다.");
                    } catch (error) {
                      console.error("회원탈퇴 오류:", error);
                      toast.error(
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
