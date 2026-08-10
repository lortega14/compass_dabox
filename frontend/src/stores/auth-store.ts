import { create } from "zustand";
import { api } from "../lib/api";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ mustChangePassword: boolean; role: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  changePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/auth/login", { username, password });
      const { token, user, mustChangePassword } = response.data;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      set({
        user,
        isAuthenticated: !mustChangePassword, // if they must change, they are not fully authenticated yet
        isLoading: false,
      });
      return { mustChangePassword, role: user.role };
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      set({ isLoading: false, user: null, isAuthenticated: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/auth/me");
      const user = response.data.user;
      set({
        user,
        isAuthenticated: !user.mustChangePassword,
        isLoading: false,
      });
      return user;
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  changePassword: async (password) => {
    set({ isLoading: true });
    try {
      const response = await api.post("/api/auth/change-password", { password });
      const { user } = response.data;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
