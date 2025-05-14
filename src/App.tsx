

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import TemplateBuilder from "./pages/TemplateBuilder";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AIGenerator from "./pages/AIGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/template-builder" element={<TemplateBuilder />} />
            <Route path="/template-builder/:id" element={<TemplateBuilder />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-generator" element={<AIGenerator />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

