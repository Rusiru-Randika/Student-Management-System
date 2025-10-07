import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

/**
 * AuthProvider
 * - Manages auth state via JWT in localStorage
 * - Decodes token payload client-side (non-authoritative)
 * - Exposes login/logout and loading state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // You might want to verify the token with the backend here
      // For simplicity, we'll just decode it
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUser(decoded);
    } catch {
      // If decode fails, ensure clean state
      localStorage.removeItem("token");
      setUser(null);
      throw new Error('Invalid token received');
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
