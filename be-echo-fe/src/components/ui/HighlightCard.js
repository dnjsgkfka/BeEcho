import React from "react";

const HighlightCard = ({
  title,
  description,
  badge,
  badgeVariant = "default",
}) => (
  <div className="highlight-card">
    <div>
      <p className="highlight-title">{title}</p>
      <p className="highlight-desc">{description}</p>
    </div>
    {badge && <span className={`highlight-pill ${badgeVariant}`}>{badge}</span>}
  </div>
);

export default HighlightCard;

