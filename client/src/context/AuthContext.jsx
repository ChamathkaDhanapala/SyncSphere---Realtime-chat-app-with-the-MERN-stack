import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken as setApiToken } from "../lib/api.js";

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setApiToken(token);
  }, [token]);

  const saveAuth = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setError("");
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const login = async (email, password, isAdminLogin = false) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password });
      
      // Check if admin login is required but user is not admin
      if (isAdminLogin && !data.user.isAdmin) {
        throw new Error("Admin privileges required");
      }
      
      saveAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/register", { username, email, password });
      saveAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setError("");
  };

  const refreshMe = async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error refreshing user data:", error);

      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  };

  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.put("/users/me", formData);

      console.log("Update profile response:", data);

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshMe,
    updateProfile 
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}