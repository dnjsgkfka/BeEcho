import React, { useState } from "react";
import "../styles/achievements.css";
import { AchievementCard } from "../components/ui";
import ShareModal from "../components/ui/ShareModal";
import { useAppData } from "../contexts/AppDataContext";

const AchievementsPage = () => {
  const { achievements, user, insights } = useAppData();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="achievements-page">
      <div className="achievements-content">
        <div className="page-heading-row">
          <div>
            <h3>업적</h3>
            <p className="page-subtitle">{achievements.progress}</p>
          </div>
          <button
            className="share-button"
            onClick={() => setIsShareModalOpen(true)}
          >
            지금까지의 환경 보호 활동을 공유해보세요!
          </button>
        </div>
        <div className="achievement-grid">
          {achievements.all.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              variant={achievement.variant}
              unlocked={achievement.unlocked}
              emoji={achievement.emoji}
            />
          ))}
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          user={user}
          insights={insights}
          achievements={achievements}
        />
      </div>
    </div>
  );
};

export default AchievementsPage;
