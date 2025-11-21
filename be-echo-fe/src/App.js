import React from "react";
import "./App.css";
import { AppDataProvider } from "./contexts/AppDataContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import MainLayout from "./components/layout/MainLayout";

const App = () => {
  return (
    <div className="app-root">
      <AppDataProvider>
        <NavigationProvider>
          <MainLayout />
        </NavigationProvider>
      </AppDataProvider>
    </div>
  );
};

export default App;
