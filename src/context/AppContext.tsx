import React, { useState, type ReactNode } from "react";
import { AppContext } from "./appContextTypes";
import type { AppState } from "./appContextTypes";

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppState["user"]>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [theme, setTheme] = useState<AppState["theme"]>("light");

  const setUserAndPersist = (user: AppState["user"]) => {
    setUser(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AppContext.Provider
      value={{ user, setUser: setUserAndPersist, logout, theme, setTheme }}
    >
      {children}
    </AppContext.Provider>
  );
};
