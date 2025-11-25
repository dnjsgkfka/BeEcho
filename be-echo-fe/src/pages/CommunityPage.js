import React, { useState } from "react";
import "../styles/community.css";
import GroupPage from "./GroupPage";
import RankingPage from "./RankingPage";
import { COMMUNITY_SUBTABS } from "../constants/navigation";

const CommunityPage = () => {
  const [activeSubtab, setActiveSubtab] = useState(COMMUNITY_SUBTABS[0].id);

  return (
    <section className="screen-section community">
      <div className="page-heading">
        <h2>커뮤니티</h2>
        <p className="page-subtitle">함께 인증하고 경쟁해요!</p>
      </div>

      {/* 서브탭 네비게이션 */}
      <div className="subtab-nav">
        {COMMUNITY_SUBTABS.map((subtab) => (
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
        {activeSubtab === "group" && <GroupPage />}
        {activeSubtab === "ranking" && <RankingPage />}
      </div>
    </section>
  );
};

export default CommunityPage;
