import React, { useState } from "react";
import "../styles/home.css";
import { InfoIcon } from "../components/icons";
import { StatPill, Character } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";
import { useNavigation } from "../contexts/NavigationContext";
import { deriveGradeCode, getGradeGuide } from "../utils/grade";

const HomePage = () => {
  const { home, user, fact } = useAppData();
  const { changeTab } = useNavigation();
  const [isGradeInfoOpen, setGradeInfoOpen] = useState(false);

  const gradeEmojis = {
    master: "👑",
    diamond: "🌍",
    platinum: "🌲",
    gold: "🌳",
    silver: "🌿",
    bronze: "🌱",
  };

  return (
    <section className="screen-section home">
      <div className="page-heading">
        <p className="date">{home.dateLabel}</p>
        <h2>{user.name}님, 환영합니다!</h2>
      </div>

      <article className="status-card">
        <button
          type="button"
          className="info-button"
          onClick={() => setGradeInfoOpen(true)}
        >
          <InfoIcon />
        </button>
        <Character lp={user.lp} streakDays={user.streakDays} />
      </article>

      <div className="home-verification-section">
        <div className="home-verification-header">
          <h3>오늘의 인증</h3>
          <div
            className={`home-verification-badge ${
              home.canVerify ? "available" : "completed"
            }`}
          >
            {home.canVerify ? "인증 가능" : "완료됨"}
          </div>
        </div>
        <p className="home-verification-message">{home.certificationMessage}</p>
        {home.canVerify && (
          <button
            className="home-verification-button"
            onClick={() => changeTab("verification")}
          >
            인증하러 가기
          </button>
        )}
      </div>

      <div className="stat-grid">
        {home.stats.map((stat) => (
          <StatPill
            key={stat.id}
            label={stat.label}
            value={stat.value}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* 등급 안내 */}
      {isGradeInfoOpen && (
        <div className="home-modal" role="dialog" aria-modal="true">
          <div className="home-modal-content">
            <header>
              <h3>등급 안내</h3>
              <button
                type="button"
                onClick={() => {
                  setGradeInfoOpen(false);
                }}
              >
                닫기
              </button>
            </header>
            <div className="home-modal-body">
              <div className="home-grade-list">
                {getGradeGuide().map((item) => (
                  <article
                    key={item.label}
                    className={`home-grade-card accent-${item.accent} ${
                      deriveGradeCode(user.lp) === item.accent ? "active" : ""
                    }`}
                  >
                    <div className="home-grade-card-left">
                      <div className="home-grade-card-emoji">
                        {gradeEmojis[item.accent]}
                      </div>
                      <div className="home-grade-card-content">
                        <h4>{item.label}</h4>
                        <span>{item.range}</span>
                      </div>
                    </div>
                    {deriveGradeCode(user.lp) === item.accent && (
                      <div className="home-grade-card-badge">현재</div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 fact */}
      {fact && (
        <div className="page-bottom-fact">
          <strong>{fact.title || "오늘의 환경 정보"}</strong>
          <p>{fact.description || "텀블러 인증으로 지구를 지켜요."}</p>
        </div>
      )}
    </section>
  );
};

export default HomePage;
