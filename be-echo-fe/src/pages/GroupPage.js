import React, { useState, useEffect, useMemo } from "react";
import "../styles/group.css";
import CreateGroupModal from "../components/group/CreateGroupModal";
import JoinGroupModal from "../components/group/JoinGroupModal";
import GroupSettingsModal from "../components/group/GroupSettingsModal";
import GroupLPInfoModal from "../components/group/GroupLPInfoModal";
import { SettingsIcon } from "../components/icons";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  getGroup,
  getGroupMembers,
  deleteGroup,
  updateGroupName,
  updateGroupAnnouncement,
  removeMember,
  leaveGroup,
} from "../services/groups";
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else {
    return "";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};

const GroupPage = () => {
  const { user: appDataUser } = useAppData();
  const { user: authUser, refreshUser } = useAuth();
  const user = authUser || appDataUser;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLPInfoModalOpen, setIsLPInfoModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [todayVerifications, setTodayVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.groupId) {
      setCurrentGroup(null);
      setGroupMembers([]);
      setTodayVerifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const groupId = user.groupId;

    const unsubscribeGroup = onSnapshot(
      doc(db, "groups", groupId),
      (groupDoc) => {
        if (groupDoc.exists()) {
          setCurrentGroup({
            id: groupDoc.id,
            ...groupDoc.data(),
          });
        } else {
          setCurrentGroup(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("그룹 정보 실시간 업데이트 오류:", error);
        setCurrentGroup(null);
        setIsLoading(false);
      }
    );

    const membersRef = collection(db, "groups", groupId, "members");
    const unsubscribeMembers = onSnapshot(
      membersRef,
      (membersSnapshot) => {
        const members = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupMembers(members);
      },
      (error) => {
        console.error("그룹 멤버 실시간 업데이트 오류:", error);
        setGroupMembers([]);
      }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDateStr = today.toISOString().split("T")[0];

    const verificationsRef = collection(db, "verifications");
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    const verificationsQuery = query(
      verificationsRef,
      where("groupId", "==", groupId),
      where("success", "==", true),
      where("date", "==", todayDateStr)
    );

    const unsubscribeVerifications = onSnapshot(
      verificationsQuery,
      (verificationsSnapshot) => {
        const verifications = verificationsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });
        console.log("오늘의 인증 데이터:", verifications);
        setTodayVerifications(verifications);
      },
      (error) => {
        console.error("인증 사진 실시간 업데이트 오류:", error);
        setTodayVerifications([]);
      }
    );

    return () => {
      unsubscribeGroup();
      unsubscribeMembers();
      unsubscribeVerifications();
    };
  }, [user?.groupId]);

  const handleCopyCode = async () => {
    const code = currentGroup?.code || "";
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      // 폴백: 텍스트 영역을 사용한 복사
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error("복사 실패:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return (
      <div className="group-page">
        <div className="group-loading">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-page">
      {!currentGroup ? (
        <div className="group-empty-state">
          <div className="group-empty-icon">👥</div>
          <h3>그룹에 참여해보세요!</h3>
          <p>함께 인증하고 경쟁하며 환경 보호에 동참해요</p>
          <div className="group-empty-actions">
            <button
              className="group-button group-button-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              그룹 만들기
            </button>
            <button
              className="group-button group-button-secondary"
              onClick={() => setIsJoinModalOpen(true)}
            >
              그룹 참여하기
            </button>
          </div>
        </div>
      ) : (
        // 그룹이 있을 때
        <div className="group-content">
          {/* 그룹 정보 카드 */}
          <div className="group-info-card">
            <div className="group-info-header">
              <div>
                <h3>{currentGroup.name || "그룹 이름"}</h3>
                <p
                  className={`group-code ${copied ? "copied" : ""}`}
                  onClick={handleCopyCode}
                  style={{ cursor: "pointer" }}
                  title="클릭하여 복사"
                >
                  코드: {currentGroup.code || "ABC123"}
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div className="group-info-badge">
                  {currentGroup.leaderId === user.id ? "그룹장" : "멤버"}
                </div>
                <button
                  className="group-settings-btn"
                  onClick={() => setIsSettingsModalOpen(true)}
                  title="그룹 설정"
                  aria-label="그룹 설정"
                >
                  <SettingsIcon />
                </button>
              </div>
            </div>

            {/* 그룹 공지사항 */}
            {currentGroup.announcement && (
              <div className="group-announcement">
                <div className="group-announcement-header">
                  <span className="group-announcement-icon">📢</span>
                  <span className="group-announcement-label">공지사항</span>
                </div>
                <p className="group-announcement-content">
                  {currentGroup.announcement}
                </p>
              </div>
            )}

            <div className="group-info-stats">
              <div className="group-stat-item">
                <span className="group-stat-label">멤버</span>
                <span className="group-stat-value">
                  {groupMembers.length || 1}명
                </span>
              </div>
              <div className="group-stat-item">
                <span className="group-stat-label">오늘 인증</span>
                <span className="group-stat-value">
                  {todayVerifications.length}명
                </span>
              </div>
              <div
                className="group-stat-item"
                onClick={() => setIsLPInfoModalOpen(true)}
                style={{ cursor: "pointer" }}
                title="그룹 LP 정보"
              >
                <span className="group-stat-label">그룹 LP</span>
                <span className="group-stat-value">
                  {groupMembers.reduce((sum, m) => sum + (m.lp || 0), 0) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* 멤버 목록 */}
          <section className="group-section">
            <h4 className="group-section-title">멤버 목록</h4>
            <div className="group-members-list">
              {groupMembers.length > 0 ? (
                groupMembers.map((member, index) => (
                  <div key={member.id || index} className="group-member-item">
                    <div className="group-member-avatar">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.name} />
                      ) : (
                        <span>{member.name?.[0] || "?"}</span>
                      )}
                    </div>
                    <div className="group-member-info">
                      <div className="group-member-name">
                        {member.name || "이름 없음"}
                        {member.id === currentGroup.leaderId && (
                          <span className="group-member-badge">그룹장</span>
                        )}
                      </div>
                      <div className="group-member-meta">
                        {member.lp || 0} LP · {member.streakDays || 0}일 연속
                      </div>
                    </div>
                    <div className="group-member-lp">{member.lp || 0} LP</div>
                  </div>
                ))
              ) : (
                <div className="group-empty-members">
                  <p>아직 멤버가 없어요</p>
                </div>
              )}
            </div>
          </section>

          {/* 오늘의 인증 사진 */}
          <section className="group-section">
            <h4 className="group-section-title">오늘의 인증</h4>
            {todayVerifications.length > 0 ? (
              <div className="group-verification-gallery">
                {todayVerifications.map((verification, index) => (
                  <div
                    key={verification.id || index}
                    className="group-verification-item"
                  >
                    <img
                      src={
                        verification.imageUrl ||
                        verification.imageDataUrl ||
                        verification.image_url
                      }
                      alt={`${
                        verification.userName || verification.name || "사용자"
                      }의 인증`}
                      onError={(e) => {
                        console.error("이미지 로드 실패:", verification);
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="group-verification-overlay">
                      <div className="group-verification-info">
                        <span className="group-verification-name">
                          {verification.userName ||
                            verification.name ||
                            "사용자"}
                        </span>
                        {(verification.verifiedAt ||
                          verification.createdAt) && (
                          <span className="group-verification-time">
                            {formatTimeAgo(
                              verification.verifiedAt || verification.createdAt
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="group-empty-verifications">
                <p>아직 오늘 인증한 멤버가 없어요</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        onSuccess={async (result) => {
          if (result?.groupId) {
            try {
              await refreshUser();
              const group = await getGroup(result.groupId);
              if (group) {
                setCurrentGroup(group);
                const members = await getGroupMembers(result.groupId);
                setGroupMembers(members);
              }
            } catch (error) {
              console.error("그룹 정보 로드 오류:", error);
            }
          }
        }}
      />

      {/* 그룹 참여 모달 */}
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
        }}
        onSuccess={async (result) => {
          if (result?.groupId) {
            try {
              await refreshUser();
              const group = await getGroup(result.groupId);
              if (group) {
                setCurrentGroup(group);
                const members = await getGroupMembers(result.groupId);
                setGroupMembers(members);
              }
            } catch (error) {
              console.error("그룹 정보 로드 오류:", error);
            }
          }
        }}
      />

      {/* 그룹 설정 모달 */}
      <GroupSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        group={currentGroup}
        members={groupMembers}
        onUpdateGroupName={async (newName) => {
          try {
            await updateGroupName(currentGroup.id, user.id, newName);
            await refreshUser();
            const updatedGroup = await getGroup(currentGroup.id);
            if (updatedGroup) {
              setCurrentGroup(updatedGroup);
            }
          } catch (error) {
            throw error;
          }
        }}
        onUpdateAnnouncement={async (announcement) => {
          try {
            await updateGroupAnnouncement(
              currentGroup.id,
              user.id,
              announcement
            );
            const updatedGroup = await getGroup(currentGroup.id);
            if (updatedGroup) {
              setCurrentGroup(updatedGroup);
            }
          } catch (error) {
            throw error;
          }
        }}
        onRemoveMember={async (memberId) => {
          try {
            await removeMember(currentGroup.id, user.id, memberId);
            await refreshUser();
            const updatedMembers = await getGroupMembers(currentGroup.id);
            setGroupMembers(updatedMembers);
          } catch (error) {
            throw error;
          }
        }}
        onLeaveGroup={async () => {
          try {
            await leaveGroup(currentGroup.id, user.id);
            await refreshUser();
            setCurrentGroup(null);
            setGroupMembers([]);
          } catch (error) {
            throw error;
          }
        }}
        onDeleteGroup={async () => {
          try {
            await deleteGroup(currentGroup.id, user.id);
            await refreshUser();
            setCurrentGroup(null);
            setGroupMembers([]);
          } catch (error) {
            throw error;
          }
        }}
      />

      {/* 그룹 LP 정보 모달 */}
      <GroupLPInfoModal
        isOpen={isLPInfoModalOpen}
        onClose={() => setIsLPInfoModalOpen(false)}
        members={groupMembers}
        todayVerifications={todayVerifications}
      />
    </div>
  );
};

export default GroupPage;
