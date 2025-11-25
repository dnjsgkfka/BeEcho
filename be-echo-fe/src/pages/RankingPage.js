import React, { useState } from "react";
import "../styles/ranking.css";
import { useAppData } from "../contexts/AppDataContext";

const RankingPage = () => {
  const { user } = useAppData();
  const [activeTab, setActiveTab] = useState("personal"); // "personal" or "group"

  // TODO: Firebase 랭킹 데이터 연결
  const personalRankings = []; // 개인 랭킹
  const groupRankings = []; // 그룹 랭킹
  const myPersonalRank = null; // 내 개인 순위
  const myGroupRank = null; // 내 그룹 순위

  const rankings = activeTab === "personal" ? personalRankings : groupRankings;
  const myRank = activeTab === "personal" ? myPersonalRank : myGroupRank;

  return (
    <div className="ranking-page">
      {/* 탭 전환 */}
      <div className="ranking-tabs">
        <button
          className={`ranking-tab ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          개인 랭킹
        </button>
        <button
          className={`ranking-tab ${activeTab === "group" ? "active" : ""}`}
          onClick={() => setActiveTab("group")}
        >
          그룹 랭킹
        </button>
      </div>

      {/* 내 순위 표시 */}
      {myRank && (
        <div className="ranking-my-rank">
          <div className="ranking-my-rank-header">
            <span>내 순위</span>
            <strong>#{myRank.rank}</strong>
          </div>
          <div className="ranking-my-rank-content">
            <div className="ranking-item ranking-item-highlight">
              <div className="ranking-rank">{myRank.rank}</div>
              <div className="ranking-avatar">
                {myRank.photoURL ? (
                  <img src={myRank.photoURL} alt={myRank.name} />
                ) : (
                  <span>{myRank.name?.[0] || "?"}</span>
                )}
              </div>
              <div className="ranking-info">
                <div className="ranking-name">
                  {myRank.name || "이름 없음"}
                  <span className="ranking-badge">나</span>
                </div>
                <div className="ranking-meta">
                  {activeTab === "personal" ? "개인" : myRank.groupName}
                </div>
              </div>
              <div className="ranking-lp">{myRank.lp || 0} LP</div>
            </div>
          </div>
        </div>
      )}

      {/* 랭킹 리스트 */}
      <div className="ranking-list">
        <div className="ranking-list-header">
          <h4>전체 랭킹</h4>
          <span className="ranking-list-count">{rankings.length}명</span>
        </div>

        {rankings.length > 0 ? (
          <div className="ranking-items">
            {rankings.map((item, index) => (
              <div
                key={item.id || index}
                className={`ranking-item ${
                  item.id === user.id ? "ranking-item-me" : ""
                }`}
              >
                <div className="ranking-rank">{item.rank || index + 1}</div>
                <div className="ranking-avatar">
                  {item.photoURL ? (
                    <img src={item.photoURL} alt={item.name} />
                  ) : (
                    <span>{item.name?.[0] || "?"}</span>
                  )}
                </div>
                <div className="ranking-info">
                  <div className="ranking-name">
                    {item.name || "이름 없음"}
                    {activeTab === "group" && item.leaderId && (
                      <span className="ranking-badge">👑</span>
                    )}
                  </div>
                  <div className="ranking-meta">
                    {activeTab === "personal"
                      ? `${item.streakDays || 0}일 연속`
                      : item.groupName || "그룹 이름"}
                  </div>
                </div>
                <div className="ranking-lp">{item.lp || 0} LP</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ranking-empty">
            <p>아직 랭킹 데이터가 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;
