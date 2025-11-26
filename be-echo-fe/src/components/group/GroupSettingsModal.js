import React, { useState } from "react";
import "../../styles/group-modal.css";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const GroupSettingsModal = ({
  isOpen,
  onClose,
  group,
  members,
  onUpdateGroupName,
  onUpdateAnnouncement,
  onRemoveMember,
  onLeaveGroup,
  onDeleteGroup,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState(
    group?.announcement || ""
  );
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);

  const isLeader = group?.leaderId === user?.id;

  const handleUpdateName = async () => {
    if (!newGroupName.trim() || newGroupName === group.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateGroupName(newGroupName.trim());
      setIsEditingName(false);
      toast.success("그룹 이름이 변경되었습니다.");
    } catch (error) {
      console.error("그룹 이름 변경 오류:", error);
      toast.error("그룹 이름 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    setIsUpdatingAnnouncement(true);
    try {
      await onUpdateAnnouncement(newAnnouncement.trim());
      setIsEditingAnnouncement(false);
      toast.success("공지사항이 업데이트되었습니다.");
    } catch (error) {
      console.error("공지사항 업데이트 오류:", error);
      toast.error("공지사항 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingAnnouncement(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (
      !window.confirm(
        `${memberName}님을 그룹에서 방출하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      await onRemoveMember(memberId);
      toast.success(`${memberName}님이 그룹에서 제거되었습니다.`);
    } catch (error) {
      console.error("멤버 방출 오류:", error);
      toast.error("멤버 방출 중 오류가 발생했습니다.");
    }
  };

  const handleLeaveGroup = async () => {
    if (
      !window.confirm(
        "그룹에서 나가시겠습니까?\n나가면 그룹의 모든 데이터에 접근할 수 없게 됩니다."
      )
    ) {
      return;
    }

    try {
      await onLeaveGroup();
      toast.success("그룹에서 나갔습니다.");
      onClose();
    } catch (error) {
      console.error("그룹 나가기 오류:", error);
      toast.error("그룹 나가기 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay" onClick={onClose}>
      <div className="group-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="group-modal-header">
          <h3>그룹 설정</h3>
          <button className="group-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="group-settings-content">
          {/* 그룹 이름 변경 (그룹장만) */}
          {isLeader && (
            <div className="group-settings-section">
              <h4>그룹 이름</h4>
              {isEditingName ? (
                <div className="group-settings-name-edit">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="그룹 이름을 입력하세요"
                    maxLength={20}
                    autoFocus
                  />
                  <div className="group-settings-name-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setNewGroupName(group.name);
                        setIsEditingName(false);
                      }}
                      disabled={isUpdating}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateName}
                      disabled={isUpdating || !newGroupName.trim()}
                      className="primary"
                    >
                      {isUpdating ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group-settings-name-display">
                  <span>{group?.name || "그룹 이름"}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="group-settings-edit-btn"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          )}

          {isLeader && (
            <div className="group-settings-section">
              <h4>그룹 공지사항</h4>
              {isEditingAnnouncement ? (
                <div className="group-settings-announcement-edit">
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="그룹 공지사항을 입력하세요 (최대 200자)"
                    maxLength={200}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  />
                  <div className="group-settings-name-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setNewAnnouncement(group?.announcement || "");
                        setIsEditingAnnouncement(false);
                      }}
                      disabled={isUpdatingAnnouncement}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateAnnouncement}
                      disabled={isUpdatingAnnouncement}
                      className="primary"
                    >
                      {isUpdatingAnnouncement ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group-settings-announcement-display">
                  {group?.announcement ? (
                    <div className="group-settings-announcement-content">
                      <p>{group.announcement}</p>
                      <button
                        type="button"
                        onClick={() => setIsEditingAnnouncement(true)}
                        className="group-settings-edit-btn"
                      >
                        수정
                      </button>
                    </div>
                  ) : (
                    <div className="group-settings-announcement-empty">
                      <p>공지사항이 없습니다.</p>
                      <button
                        type="button"
                        onClick={() => setIsEditingAnnouncement(true)}
                        className="group-settings-edit-btn"
                      >
                        작성
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 멤버 목록 (그룹장만 방출 가능) */}
          <div className="group-settings-section">
            <h4>멤버 관리</h4>
            <div className="group-settings-members">
              {members.map((member) => (
                <div key={member.id} className="group-settings-member-item">
                  <div className="group-settings-member-info">
                    <div className="group-settings-member-avatar">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.name} />
                      ) : (
                        <span>{member.name?.[0] || "?"}</span>
                      )}
                    </div>
                    <div>
                      <div className="group-settings-member-name">
                        {member.name || "이름 없음"}
                        {member.id === group?.leaderId && (
                          <span className="group-settings-leader-badge">
                            그룹장
                          </span>
                        )}
                      </div>
                      <div className="group-settings-member-meta">
                        {member.lp || 0} LP · {member.streakDays || 0}일 연속
                      </div>
                    </div>
                  </div>
                  {isLeader &&
                    member.id !== user?.id &&
                    member.id !== group?.leaderId && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveMember(member.id, member.name)
                        }
                        className="group-settings-remove-btn"
                      >
                        방출
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* 그룹 나가기 / 삭제 */}
          <div className="group-settings-section">
            {isLeader ? (
              <button
                type="button"
                onClick={async () => {
                  if (
                    window.confirm(
                      "그룹을 삭제하면 모든 멤버가 그룹에서 나가게 됩니다.\n정말 삭제하시겠습니까?"
                    )
                  ) {
                    if (
                      window.confirm(
                        "정말로 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                      )
                    ) {
                      try {
                        await onDeleteGroup();
                        toast.success("그룹이 삭제되었습니다.");
                        onClose();
                      } catch (error) {
                        console.error("그룹 삭제 오류:", error);
                        toast.error("그룹 삭제 중 오류가 발생했습니다.");
                      }
                    }
                  }
                }}
                className="group-settings-danger-btn"
              >
                그룹 삭제
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLeaveGroup}
                className="group-settings-danger-btn"
              >
                그룹 나가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
