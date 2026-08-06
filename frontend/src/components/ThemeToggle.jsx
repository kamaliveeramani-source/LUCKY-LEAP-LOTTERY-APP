import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme } from "../theme";

function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={`theme-btn light ${theme === "light" ? "active" : ""}`}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={`theme-btn dark ${theme === "dark" ? "active" : ""}`}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
    </div>
  );
}

export default ThemeToggle;
