import React, { useState, useEffect } from "react";
import "../styles/ranking.css";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  getPersonalRankings,
  getGroupRankings,
  getUserPersonalRank,
  getGroupRank,
} from "../services/rankings";

const RankingPage = () => {
  const { user: appDataUser } = useAppData();
  const { user: authUser } = useAuth();
  const user = authUser || appDataUser;
  const [activeTab, setActiveTab] = useState("personal"); // "personal" or "group"
  const [personalRankings, setPersonalRankings] = useState([]);
  const [groupRankings, setGroupRankings] = useState([]);
  const [myPersonalRank, setMyPersonalRank] = useState(null);
  const [myGroupRank, setMyGroupRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "personal") {
          const rankings = await getPersonalRankings(100);
          setPersonalRankings(rankings);
          if (user?.id) {
            const myRank = await getUserPersonalRank(user.id);
            setMyPersonalRank(myRank);
          }
        } else {
          const rankings = await getGroupRankings(100);
          setGroupRankings(rankings);
          if (user?.groupId) {
            const groupRank = await getGroupRank(user.groupId);
            setMyGroupRank(groupRank);
          }
        }
      } catch (error) {
        console.error("랭킹 데이터 로드 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankings();
  }, [activeTab, user?.id, user?.groupId]);

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
            <span>{activeTab === "personal" ? "내 순위" : "내 그룹 순위"}</span>
            <strong>#{myRank.rank}</strong>
          </div>
          <div className="ranking-my-rank-content">
            <div className="ranking-item ranking-item-highlight">
              {activeTab === "personal" && (
                <div className="ranking-avatar">
                  {myRank.photoURL ? (
                    <img src={myRank.photoURL} alt={myRank.name} />
                  ) : (
                    <span>{myRank.name?.[0] || "?"}</span>
                  )}
                </div>
              )}
              <div className="ranking-info">
                <div className="ranking-name">
                  {myRank.name || "이름 없음"}
                  <span className="ranking-badge">나</span>
                </div>
                <div className="ranking-meta">
                  {activeTab === "personal"
                    ? `${myRank.streakDays || 0}일 연속`
                    : myRank.name || "그룹 이름"}
                </div>
              </div>
              <div className="ranking-lp">
                {activeTab === "personal"
                  ? myRank.lp || 0
                  : myRank.totalLP || 0}{" "}
                LP
              </div>
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

        {isLoading ? (
          <div className="ranking-empty">
            <p>랭킹을 불러오는 중...</p>
          </div>
        ) : rankings.length > 0 ? (
          <div className="ranking-items">
            {rankings.map((item, index) => (
              <div
                key={item.id || index}
                className={`ranking-item ${
                  activeTab === "personal" && item.id === user?.id
                    ? "ranking-item-me"
                    : activeTab === "group" && item.id === user?.groupId
                    ? "ranking-item-me"
                    : ""
                }`}
              >
                <div
                  className={`ranking-rank ${
                    item.rank === 1
                      ? "top-1"
                      : item.rank === 2
                      ? "top-2"
                      : item.rank === 3
                      ? "top-3"
                      : ""
                  }`}
                >
                  {item.rank === 1
                    ? "🥇"
                    : item.rank === 2
                    ? "🥈"
                    : item.rank === 3
                    ? "🥉"
                    : item.rank || index + 1}
                </div>
                {activeTab === "personal" && (
                  <div className="ranking-avatar">
                    {item.photoURL ? (
                      <img src={item.photoURL} alt={item.name} />
                    ) : (
                      <span>{item.name?.[0] || "?"}</span>
                    )}
                  </div>
                )}
                <div className="ranking-info">
                  <div className="ranking-name">
                    {item.name || "이름 없음"}
                    {(activeTab === "personal" && item.id === user?.id) ||
                    (activeTab === "group" && item.id === user?.groupId) ? (
                      <span className="ranking-badge">나</span>
                    ) : null}
                  </div>
                  <div className="ranking-meta">
                    {activeTab === "personal"
                      ? `${item.streakDays || 0}일 연속`
                      : `${item.memberCount || 0}명`}
                  </div>
                </div>
                <div className="ranking-lp">
                  {activeTab === "personal" ? item.lp || 0 : item.totalLP || 0}{" "}
                  LP
                </div>
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
