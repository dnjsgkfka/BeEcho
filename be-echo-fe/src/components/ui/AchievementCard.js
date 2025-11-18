import React from "react";
import { LockIcon } from "../icons";

const AchievementCard = ({
  title,
  description,
  variant,
  unlocked = false,
  emoji,
}) => (
  <article
    className={`achievement-card ${variant || ""} ${unlocked ? "" : "locked"}`}
  >
    <div className="achievement-decoration" aria-hidden="true" />
    {!unlocked && (
      <div className="achievement-lock">
        <LockIcon />
      </div>
    )}
    <div className="achievement-content">
      {emoji && <div className="achievement-emoji">{emoji}</div>}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
    </div>
    {unlocked && <div className="achievement-badge">✓</div>}
  </article>
);

export default AchievementCard;
