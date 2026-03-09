import { createContext, useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { getStoredTheme, applyTheme } from "./utils/theme";
import "./styles/global.css";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

function App() {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;