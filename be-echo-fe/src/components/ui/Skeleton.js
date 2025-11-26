import React from "react";
import "../../styles/skeleton.css";

const Skeleton = ({ width, height, borderRadius = "8px", className = "" }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height: height || "20px",
        borderRadius,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton width="60px" height="60px" borderRadius="12px" />
    <div className="skeleton-content">
      <Skeleton width="60%" height="16px" />
      <Skeleton width="40%" height="14px" />
    </div>
  </div>
);

export const SkeletonPill = () => (
  <div className="skeleton-pill">
    <Skeleton width="100%" height="40px" borderRadius="12px" />
  </div>
);

export default Skeleton;

