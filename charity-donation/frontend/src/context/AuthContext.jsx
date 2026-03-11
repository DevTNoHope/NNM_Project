import React, { createContext, useState, useEffect, useContext } from "react";
import http, { setAccessToken } from "../api/http";

export const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                // Try getting new access token using HttpOnly cookie refresh token
                const refreshRes = await http.post("/api/auth/refresh");
                const { accessToken } = refreshRes.data.data;
                setAccessToken(accessToken);

                // Fetch user info
                const meRes = await http.get("/api/auth/me");
                setUser(meRes.data.data);
            } catch (error) {
                console.log("No active session or refresh token expired.");
            } finally {
                setLoading(false);
            }
        };

        restoreSession();

        const handleForceLogout = () => {
            setAccessToken(null);
            setUser(null);
        };

        window.addEventListener("auth:logout", handleForceLogout);
        return () => window.removeEventListener("auth:logout", handleForceLogout);
    }, []);

    const login = (userData, accessToken) => {
        setAccessToken(accessToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await http.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
