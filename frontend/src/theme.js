export const themeLocalKey = "lotteryAppTheme";

export function getStoredTheme() {
  return localStorage.getItem(themeLocalKey) || "light";
}

export function applyTheme(theme = getStoredTheme()) {
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem(themeLocalKey, theme);
  return theme;
}
