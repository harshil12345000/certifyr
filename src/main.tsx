import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle Supabase magic link redirects (supports token and PKCE code flows)
const hash = window.location.hash;
const search = window.location.search;

// Helper to extract from hash or search
const getParam = (key: string) => {
  const h = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
  const q = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
  return h.get(key) || q.get(key);
};

const hasAccessToken = hash.includes('access_token');
const hasCode = hash.includes('code=') || search.includes('code=');
const type = getParam('type');

if (hasAccessToken || hasCode) {
  // Preserve whichever param string exists
  const suffix = hash.length > 0 ? hash : search;
  if (type === 'recovery') {
    // Password reset goes to reset-password page
    window.location.replace('/reset-password' + suffix);
  } else {
    // Email confirmation and other auth tokens go to email-confirmed page
    window.location.replace('/auth/email-confirmed' + suffix);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
