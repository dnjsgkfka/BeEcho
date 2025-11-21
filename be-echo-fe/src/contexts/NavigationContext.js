import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_TAB } from '../constants/navigation';

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);

  const changeTab = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  return (
    <NavigationContext.Provider value={{ activeTab, changeTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

