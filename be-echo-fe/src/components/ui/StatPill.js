import React from "react";

const StatPill = ({ label, value, accent }) => (
  <div className={`stat-pill ${accent || ""}`}>
    <p>{label}</p>
    <strong>{value}</strong>
  </div>
);

export default StatPill;

