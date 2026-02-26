import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
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
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
})();
