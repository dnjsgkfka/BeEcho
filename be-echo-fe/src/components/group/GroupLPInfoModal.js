import React, { useMemo } from "react";
import "../../styles/group-modal.css";

const GroupLPInfoModal = ({ isOpen, onClose, members, todayVerifications }) => {
  const totalLP = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.lp || 0), 0);
  }, [members]);

  const verifiedMemberIds = useMemo(() => {
    return new Set(todayVerifications.map((v) => v.userId));
  }, [todayVerifications]);

  const allMembersVerified = useMemo(() => {
    return members.length > 0 && members.every((m) => verifiedMemberIds.has(m.id));
  }, [members, verifiedMemberIds]);

  const bonusLP = allMembersVerified ? 30 : 0;

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay" onClick={onClose}>
      <div className="group-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="group-modal-header">
          <h3>그룹 LP 정보</h3>
          <button className="group-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="group-lp-info-content">
          <div className="group-lp-info-section">
            <h4>현재 그룹 LP</h4>
            <div className="group-lp-total">
              <span className="group-lp-value">{totalLP}</span>
              <span className="group-lp-label">LP</span>
            </div>
          </div>

          <div className="group-lp-info-section">
            <h4>LP 획득 방법</h4>
            <div className="group-lp-methods">
              <div className="group-lp-method-item">
                <span className="group-lp-method-icon">✅</span>
                <div>
                  <div className="group-lp-method-title">텀블러 인증</div>
                  <div className="group-lp-method-desc">인증 1회당 +10 LP</div>
                </div>
              </div>
              <div className="group-lp-method-item">
                <span className="group-lp-method-icon">👥</span>
                <div>
                  <div className="group-lp-method-title">그룹 일일 보너스</div>
                  <div className="group-lp-method-desc">
                    모든 멤버 인증 시 +30 LP (그룹 전체)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group-lp-info-section">
            <h4>오늘의 LP</h4>
            <div className="group-lp-members">
              {members
                .sort((a, b) => {
                  const aVerified = verifiedMemberIds.has(a.id);
                  const bVerified = verifiedMemberIds.has(b.id);
                  if (aVerified !== bVerified) return bVerified ? 1 : -1;
                  return (b.lp || 0) - (a.lp || 0);
                })
                .map((member) => {
                  const isVerified = verifiedMemberIds.has(member.id);
                  const todayLP = isVerified ? 10 : 0;
                  const bonusLP = allMembersVerified && isVerified ? 30 : 0;
                  const totalTodayLP = todayLP + bonusLP;

                  return (
                    <div key={member.id} className="group-lp-member-item">
                      <div className="group-lp-member-info">
                        <div className="group-lp-member-avatar">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.name} />
                          ) : (
                            <span>{member.name?.[0] || "?"}</span>
                          )}
                        </div>
                        <div>
                          <div className="group-lp-member-name">
                            {member.name || "이름 없음"}
                            {isVerified && (
                              <span className="group-lp-verified-badge">✓</span>
                            )}
                          </div>
                          <div className="group-lp-member-meta">
                            {member.streakDays || 0}일 연속
                          </div>
                        </div>
                      </div>
                      <div className="group-lp-member-lp">
                        {totalTodayLP > 0 ? (
                          <div className="group-lp-today-lp">
                            <span>{todayLP}LP</span>
                            {bonusLP > 0 && (
                              <span className="group-lp-bonus-text">
                                + 보너스 {bonusLP}LP
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="group-lp-no-lp">0LP</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupLPInfoModal;

