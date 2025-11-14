import React from "react";
import { ReactComponent as CameraIconSvg } from "./CameraIcon.svg";
import { ReactComponent as HomeIconSvg } from "./HomeIcon.svg";
import { ReactComponent as InfoIconSvg } from "./InfoIcon.svg";
import { ReactComponent as RotateIconSvg } from "./RotateIcon.svg";
import { ReactComponent as SettingsIconSvg } from "./SettingsIcon.svg";

export const CameraIcon = () => <CameraIconSvg />;

export const HomeIcon = ({ active }) => (
  <HomeIconSvg className={active ? "active" : ""} />
);

export const InfoIcon = () => <InfoIconSvg />;

export const RotateIcon = () => <RotateIconSvg />;

export const SettingsIcon = () => <SettingsIconSvg />;
