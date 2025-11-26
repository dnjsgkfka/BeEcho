import React from "react";
import { ReactComponent as CameraIconSvg } from "./CameraIcon.svg";
import { ReactComponent as HomeIconSvg } from "./HomeIcon.svg";
import { ReactComponent as InfoIconSvg } from "./InfoIcon.svg";
import { ReactComponent as RotateIconSvg } from "./RotateIcon.svg";
import { ReactComponent as SettingsIconSvg } from "./SettingsIcon.svg";
import { ReactComponent as LockIconSvg } from "./LockIcon.svg";
import { ReactComponent as ChartIconSvg } from "./ChartIcon.svg";
import { ReactComponent as TrophyIconSvg } from "./TrophyIcon.svg";
import { ReactComponent as GoogleIconSvg } from "./GoogleIcon.svg";

export const CameraIcon = () => <CameraIconSvg />;

export const HomeIcon = ({ active }) => (
  <HomeIconSvg className={active ? "active" : ""} />
);

export const InfoIcon = () => <InfoIconSvg />;

export const RotateIcon = () => <RotateIconSvg />;

export const SettingsIcon = ({ active }) => (
  <SettingsIconSvg className={active ? "active" : ""} />
);

export const LockIcon = () => <LockIconSvg />;

export const ChartIcon = ({ active }) => (
  <ChartIconSvg className={active ? "active" : ""} />
);

export const TrophyIcon = ({ active }) => (
  <TrophyIconSvg className={active ? "active" : ""} />
);

export const GoogleIcon = () => <GoogleIconSvg />;
