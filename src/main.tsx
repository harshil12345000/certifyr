import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle Supabase magic link redirects
if (window.location.hash.includes('access_token')) {
  // Check the type parameter to determine correct redirect
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get('type');
  
  if (type === 'recovery') {
    // Password reset tokens go to reset-password page
    window.location.replace('/reset-password' + window.location.hash);
  } else {
    // Email confirmation and other auth tokens go to email-confirmed page
    window.location.replace('/auth/email-confirmed' + window.location.hash);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
