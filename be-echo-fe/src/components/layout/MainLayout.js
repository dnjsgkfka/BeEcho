import React from "react";
import "../../styles/layout.css";
import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";
import HomePage from "../../pages/HomePage";
import { DEFAULT_TAB } from "../../constants/navigation";
import { useAppData } from "../../contexts/AppDataContext";

const TAB_COMPONENTS = {
  home: HomePage,
};

const MainLayout = ({ activeTab = DEFAULT_TAB, onChangeTab }) => {
  const ActiveComponent = TAB_COMPONENTS[activeTab] || HomePage;
  const { user, fact, actions } = useAppData();

  return (
    <div className="mobile-shell main">
      <AppHeader
        userName={user?.name}
        lp={user?.lp}
        streak={user?.streakDays}
        fact={fact}
        onReset={actions.resetState}
        onUpdateName={actions.updateProfile}
      />
      <main className="screen">
        <ActiveComponent />
      </main>
      <BottomNavigation activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  );
};

export default MainLayout;
