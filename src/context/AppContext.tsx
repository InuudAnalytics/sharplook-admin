import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./appContextTypes";
import type { AppState, UnauthorizedError } from "./appContextTypes";

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppState["user"]>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [theme, setTheme] = useState<AppState["theme"]>("light");
  const [unauthorizedError, setUnauthorizedError] = useState<UnauthorizedError>(
    {
      message: "",
      status: 0,
      show: false,
    }
  );

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

  const clearUnauthorizedError = () => {
    setUnauthorizedError({
      message: "",
      status: 0,
      show: false,
    });
  };

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      setUnauthorizedError({
        message: event.detail.message,
        status: event.detail.status,
        show: true,
      });
      // Navigate to unauthorized route to show the message within the layout
      navigate("/unauthorized");
    };

    window.addEventListener(
      "unauthorized",
      handleUnauthorized as EventListener
    );

    return () => {
      window.removeEventListener(
        "unauthorized",
        handleUnauthorized as EventListener
      );
    };
  }, [navigate]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: setUserAndPersist,
        logout,
        theme,
        setTheme,
        unauthorizedError,
        setUnauthorizedError,
        clearUnauthorizedError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
