import React from "react";
import { HomeIcon, TrophyIcon, ChartIcon } from "../icons";

const ICON_MAP = {
  home: HomeIcon,
  insights: ChartIcon,
  trophy: TrophyIcon,
};

const TabIcon = ({ name, active }) => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon active={active} /> : null;
};

export default TabIcon;
