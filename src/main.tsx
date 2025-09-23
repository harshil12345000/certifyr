import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle Supabase auth redirects (recovery, confirmation, etc.)
const hash = window.location.hash;
const search = window.location.search;

// Helper to extract parameters from hash or search
const getParam = (key: string) => {
  const h = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
  const q = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
  return h.get(key) || q.get(key);
};

const hasAccessToken = hash.includes('access_token') || search.includes('access_token');
const hasCode = hash.includes('code=') || search.includes('code=');
const type = getParam('type');

console.log('Auth redirect check:', {
  hasAccessToken,
  hasCode,
  type,
  hash: hash.substring(0, 50) + '...',
  search: search.substring(0, 50) + '...'
});

if (hasAccessToken || hasCode) {
  // Preserve the complete parameter string
  const suffix = hash.length > 0 ? hash : search;
  
  if (type === 'recovery') {
    // Password reset - redirect to reset-password page with all parameters
    console.log('Redirecting to password reset page');
    window.location.replace('/reset-password' + suffix);
  } else {
    // Email confirmation and other auth tokens - redirect to confirmation page
    console.log('Redirecting to email confirmation page');
    window.location.replace('/auth/email-confirmed' + suffix);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
