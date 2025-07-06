import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle Supabase magic link redirect
if (window.location.hash.includes('access_token')) {
  window.location.replace('/auth/email-confirmed' + window.location.hash);
}

createRoot(document.getElementById("root")!).render(<App />);
