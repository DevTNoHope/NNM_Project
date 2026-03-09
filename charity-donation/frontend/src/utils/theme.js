import { THEME_KEY } from './constants';

export const getStoredTheme = () => {
  try { return localStorage.getItem(THEME_KEY) || 'light'; }
  catch { return 'light'; }
};

export const setStoredTheme = (theme) => {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
};

export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  setStoredTheme(theme);
};