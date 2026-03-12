import React, { createContext, useState, useEffect, useContext } from "react";
import http, { setAccessToken } from "../api/http";

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // baseURL đã có /api rồi, nên KHÔNG thêm /api nữa
        const refreshRes = await http.post("/auth/refresh");
        const { accessToken, user: refreshedUser } = refreshRes.data.data;

        setAccessToken(accessToken);

        if (refreshedUser) {
          setUser(refreshedUser);
          localStorage.setItem("user", JSON.stringify(refreshedUser));
          window.dispatchEvent(new Event("auth-changed"));
        } else {
          // fallback nếu backend refresh không trả user
          const meRes = await http.get("/auth/me");
          const me = meRes.data.data;

          setUser(me);
          localStorage.setItem("user", JSON.stringify(me));
          window.dispatchEvent(new Event("auth-changed"));
        }
      } catch (error) {
        console.log("No active session or refresh token expired.");
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const handleForceLogout = () => {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    };

    const handleAuthChanged = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("auth:logout", handleForceLogout);
    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      window.removeEventListener("auth:logout", handleForceLogout);
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  const login = (userData, accessToken) => {
    setAccessToken(accessToken);
    setUser(userData);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    window.dispatchEvent(new Event("auth-changed"));
  };

  const logout = async () => {
    try {
      await http.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new Event("auth:logout"));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
