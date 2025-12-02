import React, { useState } from "react";
import "../../styles/group-modal.css";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { createGroup, leaveGroup, getGroup } from "../../services/groups";
import { logError } from "../../utils/logger";
import { getFirebaseErrorMessage } from "../../utils/errors";

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [createdGroupCode, setCreatedGroupCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (user.groupId) {
      const confirmLeave = window.confirm(
        "이미 다른 그룹에 속해있습니다.\n새 그룹을 만들려면 기존 그룹을 나가야 합니다.\n계속하시겠습니까?"
      );
      if (!confirmLeave) {
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        // 그룹 정보 확인
        const group = await getGroup(user.groupId);
        if (!group) {
          throw new Error("그룹 정보를 찾을 수 없습니다.");
        }

        // 그룹장인 경우 나가기 불가
        if (group.leaderId === user.id) {
          setError(
            "그룹장은 그룹을 나갈 수 없습니다. 그룹 설정에서 그룹을 삭제해주세요."
          );
          setIsCreating(false);
          return;
        }

        // 그룹 나가기
        await leaveGroup(user.groupId, user.id);
        // 그룹 나가기 성공 후 계속 진행
      } catch (error) {
        logError("그룹 나가기 오류:", error);
        setError(
          getFirebaseErrorMessage(error, "그룹 나가기에 실패했습니다. 다시 시도해주세요.")
        );
        setIsCreating(false);
        return;
      }
    }

    if (!isCreating) {
      setIsCreating(true);
    }
    setError(null);

    try {
      const result = await createGroup(
        groupName,
        user.id,
        user.name || user.username || "사용자",
        user.photoURL
      );

      setCreatedGroupCode(result.code);
      setGroupName("");

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      logError("그룹 생성 오류:", error);
      setError(getFirebaseErrorMessage(error, "그룹 생성에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  if (createdGroupCode) {
    const handleCopyCode = () => {
      navigator.clipboard.writeText(createdGroupCode);
      toast.success("그룹 코드가 복사되었습니다!");
    };

    const handleClose = () => {
      setCreatedGroupCode(null);
      onClose();
    };

    return (
      <div className="group-modal-overlay" onClick={handleClose}>
        <div
          className="group-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="group-modal-header">
            <h3>그룹이 생성되었습니다.</h3>
            <button className="group-modal-close" onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className="group-modal-success-content">
            <div className="group-code-display">
              <p className="group-code-label">그룹 코드</p>
              <div className="group-code-box">
                <span className="group-code-text">{createdGroupCode}</span>
                <button
                  type="button"
                  className="group-code-copy-btn"
                  onClick={handleCopyCode}
                >
                  복사
                </button>
              </div>
              <p className="group-code-hint">
                이 코드를 공유하여 멤버를 초대하세요
              </p>
            </div>

            <div className="group-modal-actions">
              <button
                type="button"
                className="group-modal-button group-modal-button-primary"
                onClick={handleClose}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-modal-overlay" onClick={onClose}>
      <div className="group-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="group-modal-header">
          <h3>그룹 만들기</h3>
          <button className="group-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="group-modal-form" onSubmit={handleSubmit}>
          <div className="group-modal-field">
            <label htmlFor="group-name">그룹 이름</label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름을 입력하세요"
              maxLength={20}
              required
            />
            <p className="group-modal-hint">
              멤버들이 볼 그룹 이름을 정해주세요
            </p>
            {error && <p className="group-modal-error">{error}</p>}
          </div>

          <div className="group-modal-actions">
            <button
              type="button"
              className="group-modal-button group-modal-button-cancel"
              onClick={onClose}
              disabled={isCreating}
            >
              취소
            </button>
            <button
              type="submit"
              className="group-modal-button group-modal-button-primary"
              disabled={isCreating || !groupName.trim()}
            >
              {isCreating ? "생성 중..." : "그룹 만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
