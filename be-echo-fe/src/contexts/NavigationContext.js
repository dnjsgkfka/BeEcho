import React, { createContext, useContext } from "react";

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children, onChangeTab }) => {
  return (
    <NavigationContext.Provider value={{ onChangeTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

