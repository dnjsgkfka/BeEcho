import React, { useState } from "react";
import "../styles/group.css";
import CreateGroupModal from "../components/group/CreateGroupModal";
import JoinGroupModal from "../components/group/JoinGroupModal";
import { useAppData } from "../contexts/AppDataContext";

const GroupPage = () => {
  const { user } = useAppData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // TODO: Firebase에서 그룹 정보 가져오기
  const currentGroup = null;
  const groupMembers = []; // 그룹 멤버 목록
  const todayVerifications = []; // 오늘의 인증 사진들

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
                <p className="group-code">
                  코드: {currentGroup.code || "ABC123"}
                </p>
              </div>
              <div className="group-info-badge">
                {currentGroup.leaderId === user.id ? "그룹장" : "멤버"}
              </div>
            </div>
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
              <div className="group-stat-item">
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
                          <span className="group-member-badge">👑</span>
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
                      src={verification.imageUrl}
                      alt={`${verification.userName}의 인증`}
                    />
                    <div className="group-verification-overlay">
                      <span className="group-verification-name">
                        {verification.userName}
                      </span>
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
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* 그룹 참여 모달 */}
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
};

export default GroupPage;
