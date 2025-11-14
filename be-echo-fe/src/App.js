import React, { useState } from "react";
import "./App.css";
import { DEFAULT_TAB } from "./constants/navigation";
import { AppDataProvider } from "./contexts/AppDataContext";
import MainLayout from "./components/layout/MainLayout";

const App = () => {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  return (
    <div className="app-root">
      <AppDataProvider>
        <MainLayout activeTab={activeTab} onChangeTab={setActiveTab} />
      </AppDataProvider>
    </div>
  );
};

export default App;
