import { createContext, useContext, useEffect, useState } from "react";
import { api, attachToken } from "../lib/api.js";

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => { attachToken(token); }, [token]);

  const saveAuth = (user, token) => {
    setUser(user); setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    saveAuth(data.user, data.token);
  };

  const register = async (username, email, password) => {
    const { data } = await api.post("/api/auth/register", { username, email, password });
    saveAuth(data.user, data.token);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("user"); localStorage.removeItem("token");
  };

  const refreshMe = async () => {
    if (!token) return;
    const { data } = await api.get("/api/auth/me");
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const updateProfile = async (formData) => {
    const { data } = await api.put("/api/users/me", formData, { headers: { "Content-Type": "multipart/form-data" }});
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const value = { user, token, login, register, logout, updateProfile, refreshMe };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
