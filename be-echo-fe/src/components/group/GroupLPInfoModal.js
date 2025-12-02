import React, { useMemo } from "react";
import "../../styles/group-modal.css";

const GroupLPInfoModal = ({ isOpen, onClose, members }) => {
  const totalLP = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.lp || 0), 0);
  }, [members]);

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

        </div>
      </div>
    </div>
  );
};

export default GroupLPInfoModal;

