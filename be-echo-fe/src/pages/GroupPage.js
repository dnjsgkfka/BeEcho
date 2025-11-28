import React, { useState, useEffect } from "react";
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
import {
  formatTimeAgo,
  getLocalDateString,
  getTodayDateString,
} from "../utils/date";
import { log, logError, logWarn } from "../utils/logger";

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
        logError("그룹 정보 실시간 업데이트 오류:", error);
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
        logError("그룹 멤버 실시간 업데이트 오류:", error);
        setGroupMembers([]);
      }
    );

    // 로컬 시간대 기준으로 오늘 날짜 계산 (UTC 문제 방지)
    const today = new Date();
    const todayDateStr = getTodayDateString();

    log("그룹 인증 쿼리 설정:", {
      groupId,
      todayDateStr,
      groupIdType: typeof groupId,
      groupIdValue: groupId,
    });

    const verificationsRef = collection(db, "verifications");
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    // groupId가 null이 아닌 경우에만 쿼리 실행
    if (!groupId) {
      logWarn("groupId가 없어서 인증 쿼리를 실행할 수 없습니다.");
      setTodayVerifications([]);
      return;
    }

    // 보너스 LP 로직과 동일한 쿼리 사용
    const verificationsQuery = query(
      verificationsRef,
      where("groupId", "==", groupId),
      where("success", "==", true),
      where("date", "==", todayDateStr)
    );

    log("인증 쿼리 시작:", {
      groupId,
      todayDateStr,
      queryType: "groupId + success + date",
    });

    const unsubscribeVerifications = onSnapshot(
      verificationsQuery,
      (verificationsSnapshot) => {
        // 쿼리에서 이미 오늘 날짜로 필터링된 결과를 받음
        const todayVerifications = verificationsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        });

        log("오늘의 인증 데이터:", {
          count: todayVerifications.length,
          todayDateStr,
          groupId,
          verifications: todayVerifications.map((v) => ({
            id: v.id,
            userId: v.userId,
            userName: v.userName,
            groupId: v.groupId,
            date: v.date,
            success: v.success,
            hasImageUrl: !!(v.imageUrl || v.imageDataUrl || v.image_url),
            imageUrl: v.imageUrl || v.imageDataUrl || v.image_url,
          })),
          queryParams: {
            groupId,
            todayDateStr,
            success: true,
          },
        });

        // 이미지 URL이 있는 오늘의 인증만 필터링
        const validVerifications = todayVerifications.filter((v) => {
          const hasImage = !!(v.imageUrl || v.imageDataUrl || v.image_url);
          if (!hasImage) {
            logWarn("이미지 URL이 없는 인증:", {
              id: v.id,
              userId: v.userId,
              userName: v.userName,
              date: v.date,
            });
          }
          return hasImage;
        });

        log("유효한 인증 데이터:", {
          count: validVerifications.length,
          validVerifications: validVerifications.map((v) => ({
            id: v.id,
            userName: v.userName,
            imageUrl: v.imageUrl || v.imageDataUrl || v.image_url,
          })),
        });

        setTodayVerifications(validVerifications);
      },
      (error) => {
        logError("인증 사진 실시간 업데이트 오류:", error);
        logError("쿼리 파라미터:", {
          groupId,
          todayDateStr,
          success: true,
        });
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
      logError("복사 실패:", error);
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
          <h3>그룹에 참여해보세요</h3>
          <p>함께 인증하고 경쟁하며 환경 보호에 동참하세요</p>
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
              <div className="stat-pill streak">
                <p>멤버</p>
                <strong>{groupMembers.length || 1}명</strong>
              </div>
              <div className="stat-pill total">
                <p>오늘 인증</p>
                <strong>
                  {(() => {
                    const todayStr = getTodayDateString();
                    // 멤버 목록에서 오늘 인증한 멤버 수 계산
                    const todayVerifiedMembers = groupMembers.filter(
                      (member) => {
                        if (!member.lastSuccessDate) return false;
                        const lastDateStr = getLocalDateString(
                          new Date(member.lastSuccessDate)
                        );
                        return lastDateStr === todayStr;
                      }
                    );
                    // 인증 데이터와 멤버 데이터 중 더 큰 값 사용
                    return Math.max(
                      todayVerifications.length,
                      todayVerifiedMembers.length
                    );
                  })()}
                  명
                </strong>
              </div>
              <div
                className="stat-pill rank"
                onClick={() => setIsLPInfoModalOpen(true)}
                style={{ cursor: "pointer" }}
                title="그룹 LP 정보"
              >
                <p>그룹 LP</p>
                <strong>
                  {groupMembers.reduce((sum, m) => sum + (m.lp || 0), 0) || 0}
                </strong>
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
                        logError("이미지 로드 실패:", verification);
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
              logError("그룹 정보 로드 오류:", error);
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
              logError("그룹 정보 로드 오류:", error);
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
