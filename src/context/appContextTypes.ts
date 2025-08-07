import { createContext } from "react";

// Define the shape of your user data
export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  // Add any other fields you need
}

// Define the shape of your context state
export interface AppState {
  user: User | null;
  theme: "light" | "dark";
  setUser: (user: User | null) => void;
  logout: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

// Create the context with a default value (will be overridden by the provider)
export const AppContext = createContext<AppState | undefined>(undefined);
