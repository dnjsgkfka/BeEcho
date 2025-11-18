import React from "react";
import "../styles/achievements.css";
import { AchievementCard } from "../components/ui";
import { useAppData } from "../contexts/AppDataContext";

const AchievementsPage = () => {
  const { achievements } = useAppData();

  return (
    <section className="screen-section achievements">
      <div className="page-heading">
        <h2>업적</h2>
        <p className="page-subtitle">{achievements.progress}</p>
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
    </section>
  );
};

export default AchievementsPage;
