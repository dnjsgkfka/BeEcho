import React from "react";
import { ReactComponent as LogoIcon } from "../icons/LogoIcon.svg";

const Logo = ({ size = 24 }) => {
  return (
    <div className="app-logo">
      <LogoIcon width={size} height={size} />
    </div>
  );
};

export default Logo;
