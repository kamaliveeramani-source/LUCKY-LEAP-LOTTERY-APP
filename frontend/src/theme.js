export const themeLocalKey = "lotteryAppTheme";

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked in private browsing / restricted mobile modes.
  }
}

export function getStoredTheme() {
  return readStorage(themeLocalKey) || "light";
}

export function applyTheme(theme = getStoredTheme()) {
  if (typeof document !== "undefined" && document.body) {
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${theme}`);
  }
  writeStorage(themeLocalKey, theme);
  return theme;
}
