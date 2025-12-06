import React from "react";
import {
  HomeIcon,
  TrophyIcon,
  ChartIcon,
  CameraIcon,
  SettingsIcon,
  CommunityIcon,
} from "../icons";

const ICON_MAP = {
  home: HomeIcon,
  camera: CameraIcon,
  group: SettingsIcon,
  community: CommunityIcon,
  ranking: TrophyIcon,
  insights: ChartIcon,
  stats: ChartIcon,
  trophy: TrophyIcon,
};

const TabIcon = ({ name, active }) => {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;

  // CameraIcon은 active prop을 지원하지 않으므로 조건부로 처리
  if (name === "camera") {
    return <Icon />;
  }

  return <Icon active={active} />;
};

export default TabIcon;
