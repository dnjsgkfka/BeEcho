import React from "react";
import "../../styles/layout.css";
import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";
import HomePage from "../../pages/HomePage";
import VerificationPage from "../../pages/VerificationPage";
import CommunityPage from "../../pages/CommunityPage";
import StatsPage from "../../pages/StatsPage";
import { useAppData } from "../../contexts/AppDataContext";
import { useNavigation } from "../../contexts/NavigationContext";

const TAB_COMPONENTS = {
  home: HomePage,
  verification: VerificationPage,
  community: CommunityPage,
  stats: StatsPage,
};

const MainLayout = () => {
  const { activeTab, changeTab } = useNavigation();
  const ActiveComponent = TAB_COMPONENTS[activeTab] || HomePage;
  const { user, actions } = useAppData();

  return (
    <div className="mobile-shell main">
      <AppHeader
        userName={user?.name}
        lp={user?.lp}
        streak={user?.streakDays}
        photoURL={user?.photoURL}
        onUpdateName={actions.updateProfile}
        onUpdatePhoto={actions.updateProfile}
      />
      <main className="screen">
        <ActiveComponent />
      </main>
      <BottomNavigation activeTab={activeTab} onChangeTab={changeTab} />
    </div>
  );
};

export default MainLayout;
