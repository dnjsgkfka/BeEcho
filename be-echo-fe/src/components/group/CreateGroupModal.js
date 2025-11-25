import React, { useState } from "react";
import "../../styles/group-modal.css";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsCreating(true);
    // TODO: Firebase에 그룹 생성
    setTimeout(() => {
      setIsCreating(false);
      onClose();
      setGroupName("");
    }, 1000);
  };

  if (!isOpen) return null;

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
