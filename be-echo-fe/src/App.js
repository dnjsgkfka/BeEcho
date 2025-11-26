import React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppDataProvider } from "./contexts/AppDataContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { ToastProvider } from "./contexts/ToastContext";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ToastProvider>
      <AppDataProvider>
        <NavigationProvider>
          <MainLayout />
        </NavigationProvider>
      </AppDataProvider>
    </ToastProvider>
  );
};

const App = () => {
  return (
    <div className="app-root">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
};

export default App;
