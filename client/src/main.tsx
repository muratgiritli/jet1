import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CURRENT_STORE } from "./lib/store";

// Apply the active store's branding before React mounts: theme color variables,
// favicon, PWA/theme-color meta and the default document title. This makes each
// custom domain render with its own colors and identity from first paint.
(function applyStoreBranding() {
  const root = document.documentElement;
  const { theme } = CURRENT_STORE;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-ring", theme.primary);

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", theme.topBar);

  const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appTitle) appTitle.setAttribute("content", CURRENT_STORE.shortName);

  const icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (icon) icon.href = CURRENT_STORE.favicon;

  if (document.title) document.title = CURRENT_STORE.seo.title;
})();

createRoot(document.getElementById("root")!).render(<App />);
