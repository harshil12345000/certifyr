import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Templates from "@/pages/Templates";
import TemplateDetail from "@/pages/TemplateDetail";
import TemplateBuilder from "@/pages/TemplateBuilder";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import RequestPortal from "@/pages/RequestPortal";
import Branding from "@/pages/admin/branding";
import AdminTemplates from "@/pages/admin/templates";
import AdminTemplateBuilder from "@/pages/admin/templates/TemplateBuilder";
import NotFound from "@/pages/NotFound";
import VerifyDocument from "@/pages/VerifyDocument";
import EmployeePortal from "@/pages/EmployeePortal";
import EmployeeTemplateDetail from "@/pages/employee-portal/EmployeeTemplateDetail";
import { EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import NoAccess from "@/pages/employee-portal/NoAccess";
import { BookmarksPage } from "./pages/Index";
import { BookmarksProvider } from "./contexts/BookmarksContext";
import Auth from "@/pages/Auth";
import EmailConfirmed from "@/pages/auth/email-confirmed";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <BookmarksProvider>
              <Routes>
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
                  path="/templates/:id/edit"
                  element={
                    <ProtectedRoute>
                      <TemplateBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/signup" element={<Onboarding />} />
                <Route path="/auth/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/request-portal"
                  element={
                    <ProtectedRoute>
                      <RequestPortal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/:organizationId/request-portal"
                  element={<EmployeePortal />}
                />
                <Route
                  path="/:organizationId/request-portal/templates/:id"
                  element={
                    <EmployeePortalProvider
                      organizationId={window.location.pathname.split("/")[1]}
                    >
                      <EmployeeTemplateDetail />
                    </EmployeePortalProvider>
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
                  path="/admin/templates"
                  element={
                    <ProtectedRoute>
                      <AdminTemplates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/templates/:id"
                  element={
                    <ProtectedRoute>
                      <AdminTemplateBuilder />
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
                <Route path="/verify/:hash" element={<VerifyDocument />} />
                <Route path="/no-access" element={<NoAccess />} />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <BookmarksPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BookmarksProvider>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
