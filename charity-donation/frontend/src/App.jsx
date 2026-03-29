import { createContext, useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { getStoredTheme, applyTheme } from "./utils/theme";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

import { ConfigProvider, theme as antdTheme } from "antd";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => { },
});

function App() {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4F46E5', // Matches HopeFund primary color
          fontFamily: 'var(--font-body)',
        }
      }}
    >
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
          </BrowserRouter>
        </AuthProvider>
      </ThemeContext.Provider>
    </ConfigProvider>
  );
}

export default App;