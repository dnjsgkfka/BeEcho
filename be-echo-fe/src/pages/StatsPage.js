import React, { useState } from "react";
import "../styles/stats.css";
import InsightsPage from "./InsightsPage";
import AchievementsPage from "./AchievementsPage";
import { STATS_SUBTABS } from "../constants/navigation";

const StatsPage = () => {
  const [activeSubtab, setActiveSubtab] = useState(STATS_SUBTABS[0].id);

  return (
    <section className="screen-section stats">
      <div className="page-heading">
        <h2>통계</h2>
        <p className="page-subtitle">나의 활동을 확인해보세요!</p>
      </div>

      {/* 서브탭 네비게이션 */}
      <div className="subtab-nav">
        {STATS_SUBTABS.map((subtab) => (
          <button
            key={subtab.id}
            type="button"
            className={`subtab-button ${
              activeSubtab === subtab.id ? "active" : ""
            }`}
            onClick={() => setActiveSubtab(subtab.id)}
          >
            {subtab.label}
          </button>
        ))}
      </div>

      {/* 서브탭 컨텐츠 */}
      <div className="subtab-content">
        {activeSubtab === "insights" && <InsightsPage />}
        {activeSubtab === "achievements" && <AchievementsPage />}
      </div>
    </section>
  );
};

export default StatsPage;
