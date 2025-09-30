import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, setToken as setApiToken } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

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
  const [initialLoading, setInitialLoading] = useState(true); // For initial auth check
  const [error, setError] = useState("");

  useEffect(() => {
    setApiToken(token);
  }, [token]);

  // Refresh user data from server
  const refreshMe = useCallback(async () => {
    if (!token) {
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error refreshing user:", error);
      if (error.response?.status === 401) {
        clearAuth();
      }
    } finally {
      setInitialLoading(false);
    }
  }, [token]);

  // Initial auth check on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        await refreshMe();
      } else {
        setInitialLoading(false);
      }
    };

    initializeAuth();
  }, [token, user, refreshMe]);

  // Save auth to state + localStorage
  const saveAuth = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setError("");
    setInitialLoading(false);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setApiToken(null);
    setInitialLoading(false);
  };

  // Update profile function
  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message || "Failed to update profile";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
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
      navigate("/");
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || error.message || "Login failed.";
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
      const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      saveAuth(data.user, data.token);
      navigate("/");
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Registration failed.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearAuth();
    setError("");
    navigate("/login");
  }, [navigate]);

  // Clear error
  const clearError = useCallback(() => {
    setError("");
  }, []);

  const value = {
    user,
    token,
    loading,
    initialLoading,
    error,
    setError,
    clearError,
    login,
    register,
    logout,
    refreshMe,
    updateProfile,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
