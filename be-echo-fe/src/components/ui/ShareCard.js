import React from "react";
import { deriveGradeCode, deriveGradeName } from "../../utils/grade";
import { ReactComponent as LogoIcon } from "../icons/LogoIcon.svg";
import "../../styles/share-card.css";

const ShareCard = ({ user, insights, achievements }) => {
  const userLp = user?.lp ?? 0;
  const gradeCode = deriveGradeCode(userLp);
  const gradeName = deriveGradeName(userLp);

  const gradeThemes = {
    bronze: {
      emoji: "🌱",
      gradient:
        "linear-gradient(135deg, #8B6F47 0%, #A67C52 50%, #CD7F32 100%)",
      accent: "#CD7F32",
      light: "rgba(205, 127, 50, 0.15)",
    },
    silver: {
      emoji: "🌿",
      gradient:
        "linear-gradient(135deg, #A8A8A8 0%, #C0C0C0 50%, #D3D3D3 100%)",
      accent: "#C0C0C0",
      light: "rgba(192, 192, 192, 0.15)",
    },
    gold: {
      emoji: "🌳",
      gradient:
        "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFED4E 100%)",
      accent: "#FFD700",
      light: "rgba(255, 215, 0, 0.15)",
    },
    platinum: {
      emoji: "🌺",
      gradient:
        "linear-gradient(135deg, #B8B8B8 0%, #E5E4E2 50%, #F5F5F5 100%)",
      accent: "#E5E4E2",
      light: "rgba(229, 228, 226, 0.15)",
    },
    diamond: {
      emoji: "🌍",
      gradient:
        "linear-gradient(135deg, #4A90E2 0%, #5BA3F5 50%, #6BB6FF 100%)",
      accent: "#5BA3F5",
      light: "rgba(91, 163, 245, 0.15)",
    },
    master: {
      emoji: "👑",
      gradient:
        "linear-gradient(135deg, #02B95D 0%, #05C46B 50%, #08D179 100%)",
      accent: "#05C46B",
      light: "rgba(5, 196, 107, 0.15)",
    },
  };

  const theme = gradeThemes[gradeCode] || gradeThemes.bronze;

  return (
    <div className="share-card" id="share-card" data-grade={gradeCode}>
      <div className="share-card-content-wrapper">
        <div className="share-card-header">
          <div className="share-card-logo">
            <LogoIcon className="share-card-logo-icon" width={40} height={40} />
            <span className="share-card-logo-text">
              <span className="share-card-logo-be">Be</span>
              <span className="share-card-logo-echo">Echo</span>.
            </span>
          </div>
          <div className="share-card-subtitle">
            {user?.name ?? "user"}님의 텀블러 사용 리포트
          </div>
        </div>

        <div className="share-card-main">
          <div className="share-card-grade-section">
            <div className="share-card-grade-info">
              <div className="share-card-grade-badge-row">
                <div className="share-card-emoji-wrapper">
                  <div
                    className="share-card-emoji-glow"
                    style={{ backgroundColor: theme.light }}
                  />
                  <div className="share-card-emoji">{theme.emoji}</div>
                </div>
                <div className="share-card-wrapper">
                  <div
                    className="share-card-grade-badge"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {gradeName}
                  </div>
                </div>
                <div className="share-card-grade-lp">
                  <span className="share-card-lp-value">{user?.lp ?? 0}</span>
                  <span className="share-card-lp-unit">LP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="share-card-stats">
            <div className="share-card-stat">
              <div className="share-card-stat-icon">🔥</div>
              <div className="share-card-stat-value">
                {user?.streakDays ?? 0}
              </div>
              <div className="share-card-stat-label">연속 인증</div>
            </div>
            <div className="share-card-stat">
              <div className="share-card-stat-icon">✅</div>
              <div className="share-card-stat-value">
                {insights?.summary?.totalSuccess ?? 0}
              </div>
              <div className="share-card-stat-label">총 인증</div>
            </div>
            <div className="share-card-stat">
              <div className="share-card-stat-icon">🏆</div>
              <div className="share-card-stat-value">
                {achievements?.personal?.length ?? 0}
              </div>
              <div className="share-card-stat-label">달성 업적</div>
            </div>
          </div>
        </div>

        <div className="share-card-footer">
          <div className="share-card-watermark">
            <span className="share-card-watermark-be">Be</span>
            <span className="share-card-watermark-echo">Echo</span>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
