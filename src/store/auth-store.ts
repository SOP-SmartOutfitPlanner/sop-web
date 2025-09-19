import { create } from "zustand";
import { User } from "@/lib/types/auth";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Mock login for development
    if (email === "test@example.com" && password === "123456") {
      set({
        user: {
          id: "1",
          name: "Test User",
          email,
        },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },

  register: async (name: string, email: string, password: string) => {
    // Mock register
    set({
      user: {
        id: Date.now().toString(),
        name,
        email,
      },
      isAuthenticated: true,
    });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));
