// Default Theme
const DEFAULT_THEME = "dracula";

// KittyChef Version
export const VERSION = "0.0.2";

// Get theme from localStorage or Default Theme
export function getTheme() {
  return localStorage.getItem("artly-theme") || DEFAULT_THEME;
}

// Apply theme to #main element
export const applyTheme = theme => {
  localStorage.setItem("artly-theme", theme);
  document.getElementById("artly-main")?.setAttribute("data-theme", theme);
};
