
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import TemplateBuilder from "./pages/admin/templates/TemplateBuilder";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CertifyrAdmin from "./pages/certifyradmin";

const queryClient = new QueryClient();

const App = () => {  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route
                  path="/admin/templates/builder"
                  element={
                    <ProtectedRoute>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/templates" 
                  element={
                    <ProtectedRoute>
                      <Templates />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/templates/:id" 
                  element={
                    <ProtectedRoute>
                      <TemplateDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/template-builder" 
                  element={
                    <ProtectedRoute>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/template-builder/:id" 
                  element={
                    <ProtectedRoute>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/certifyradmin" 
                  element={
                    <ProtectedRoute>
                      <CertifyrAdmin />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
