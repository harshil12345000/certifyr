import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";

// Check and clear corrupted session before anything else
const checkAndClearCorruptedSession = async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Corrupted session detected on startup, clearing...', error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastLogin");
      // Remove all Supabase stored session keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.error('Session check failed, clearing all storage:', e);
    localStorage.clear();
  }
};

// Run session check and initialize app
(async () => {
  await checkAndClearCorruptedSession();

  // Handle Supabase auth redirects (recovery, confirmation, etc.)
  const hash = window.location.hash;
  const search = window.location.search;
  const currentPath = window.location.pathname;

  // Helper to extract parameters from hash or search
  const getParam = (key: string) => {
    const h = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
    const q = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
    return h.get(key) || q.get(key);
  };

  const hasAccessToken = hash.includes('access_token') || search.includes('access_token');
  const hasTokenHash = search.includes('token_hash=');
  const hasCode = hash.includes('code=') || search.includes('code=');
  const type = getParam('type');

  // Only redirect if we're not already on the target page
  if ((hasAccessToken || hasCode || hasTokenHash) && !currentPath.includes('/auth/confirm') && !currentPath.includes('/reset-password')) {
    // Preserve the complete parameter string
    const suffix = hash.length > 0 ? hash : search;
    
    if (type === 'recovery') {
      // Password reset with token_hash - redirect to /auth/confirm first
      if (hasTokenHash) {
        window.location.replace('/auth/confirm' + suffix + '&next=/reset-password');
      } else {
        // Old format with access_token - direct to reset-password
        window.location.replace('/reset-password' + suffix);
      }
    } else if (type === 'signup' || type === 'email') {
      // Email confirmation - use confirm page for token_hash
      if (hasTokenHash) {
        window.location.replace('/auth/confirm' + suffix);
      } else {
        window.location.replace('/auth/email-confirmed' + suffix);
      }
    }
  }

  createRoot(document.getElementById("root")!).render(<App />);
})();
