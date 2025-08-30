import { createContext, useContext, useEffect, useState } from "react";
import { api, attachToken } from "../lib/api.js";

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
    attachToken(token); 
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

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password }); 
      saveAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
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

  const value = { user, token, loading, error, login, register, logout, refreshMe };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}