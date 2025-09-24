import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken as setApiToken } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Load user and token from localStorage if exists
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    if (stored) setApiToken(stored);
    return stored;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync token with API interceptor
  useEffect(() => {
    setApiToken(token);
  }, [token]);

  // Refresh user data from server
  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error refreshing user:", error);
      if (error.response?.status === 401) clearAuth();
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) refreshMe();
  }, [token, user, refreshMe]);

  // Save auth to state + localStorage
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

  // Login
  const login = async (email, password, isAdminLogin = false) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password });

      if (isAdminLogin && !data.user.isAdmin) {
        throw new Error("Admin privileges required");
      }

      saveAuth(data.user, data.token);
      navigate("/"); // redirect after login
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || error.message || "Login failed.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/register", { username, email, password });
      saveAuth(data.user, data.token);
      navigate("/"); // redirect after register
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Registration failed.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setError("");
    navigate("/login"); // redirect after logout
  };

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
