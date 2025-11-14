import React from "react";
import { HomeIcon } from "../icons";

const ICON_MAP = {
  home: HomeIcon,
};

const TabIcon = ({ name, active }) => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon active={active} /> : null;
};

export default TabIcon;
