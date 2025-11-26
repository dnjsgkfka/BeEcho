import React, { useState } from "react";
import "../../styles/group-modal.css";
import { useAuth } from "../../contexts/AuthContext";
import { joinGroup } from "../../services/groups";

const JoinGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [groupCode, setGroupCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupCode.trim() || groupCode.length !== 6) {
      setError("그룹 코드는 6자리여야 합니다");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setError(null);
    setIsJoining(true);

    try {
      const result = await joinGroup(
        groupCode,
        user.id,
        user.name || user.username || "사용자",
        user.photoURL
      );

      alert(`${result.groupName} 그룹에 참여했습니다!`);
      setGroupCode("");
      onClose();

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("그룹 참여 오류:", error);
      setError(error.message || "그룹 참여에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay" onClick={onClose}>
      <div className="group-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="group-modal-header">
          <h3>그룹 참여하기</h3>
          <button className="group-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="group-modal-form" onSubmit={handleSubmit}>
          <div className="group-modal-field">
            <label htmlFor="group-code">그룹 코드</label>
            <input
              id="group-code"
              type="text"
              value={groupCode}
              onChange={(e) => {
                setGroupCode(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                );
                setError(null);
              }}
              placeholder="6자리 그룹 코드 입력"
              maxLength={6}
              required
              style={{ textTransform: "uppercase", letterSpacing: "2px" }}
            />
            <p className="group-modal-hint">
              그룹장에게 받은 6자리 코드를 입력하세요
            </p>
            {error && <p className="group-modal-error">{error}</p>}
          </div>

          <div className="group-modal-actions">
            <button
              type="button"
              className="group-modal-button group-modal-button-cancel"
              onClick={onClose}
              disabled={isJoining}
            >
              취소
            </button>
            <button
              type="submit"
              className="group-modal-button group-modal-button-primary"
              disabled={
                isJoining || !groupCode.trim() || groupCode.length !== 6
              }
            >
              {isJoining ? "참여 중..." : "그룹 참여하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
