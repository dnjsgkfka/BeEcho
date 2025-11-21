import React, { useState } from "react";
import "../styles/home.css";
import { InfoIcon, CameraIcon } from "../components/icons";
import { StatPill, Character } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";
import { useNavigation } from "../contexts/NavigationContext";
import { deriveGradeCode, getGradeGuide } from "../utils/grade";

const HomePage = () => {
  const { home, user } = useAppData();
  const { onChangeTab } = useNavigation();
  const [isGradeInfoOpen, setGradeInfoOpen] = useState(false);

  const handleGoToVerification = () => {
    onChangeTab("verification");
  };

  return (
    <section className="screen-section home">
      {/* 인증 헤더 */}
      <div className="page-heading">
        <p className="date">{home.dateLabel}</p>
        <h2>
          {user.name}님, {user.streakDays}일째 인증 중!{" "}
        </h2>
      </div>

      {/* 레벨 카드 */}
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

      {/* 인증하러가기 */}
      <article className="verification-cta-card">
        <div className="verification-cta-content">
          <div className="verification-cta-text">
            <h3>오늘의 인증</h3>
            <p>{home.certificationMessage}</p>
          </div>
          <button
            className="verification-cta-button"
            type="button"
            onClick={handleGoToVerification}
          >
            <CameraIcon />
            인증하러가기
          </button>
        </div>
      </article>

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
              <div>
                <h3>등급 안내</h3>
                <p>다음 등급까지 남은 LP를 확인해보세요.</p>
              </div>
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
              <div className="home-guide-grid">
                {getGradeGuide().map((item) => (
                  <article
                    key={item.label}
                    className={`home-guide-card grade-card accent-${
                      item.accent
                    } ${
                      deriveGradeCode(user.lp) === item.accent ? "active" : ""
                    }`}
                  >
                    <div className="home-guide-text">
                      <h4>{item.label}</h4>
                      <span>{item.range}</span>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
