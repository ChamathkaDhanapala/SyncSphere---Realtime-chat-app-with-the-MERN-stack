import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, setToken as setApiToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setApiToken(stored);
    }
    return stored;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setApiToken(token);
  }, [token]);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error refreshing user data:", error);
      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      refreshMe();
    }
  }, [token, user, refreshMe]);

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
      const { data } = await api.post("/api/auth/login", { email, password });

      if (isAdminLogin && !data.user.isAdmin) {
        throw new Error("Admin privileges required");
      }

      saveAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
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
      const { data } = await api.post("/api/auth/register", {
        username,
        email,
        password,
      });
      saveAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
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

  const updateProfile = async (formData) => {
    try {
      console.log("🔄 Updating profile...");

      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);

      const response = await api.put("/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Profile update response:", response);

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("✅ Profile updated successfully");
        return response.data;
      }
    } catch (error) {
      console.error("❌ Profile update failed:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error message:", error.message);
      throw error;
    }
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
