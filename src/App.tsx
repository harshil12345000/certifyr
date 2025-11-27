import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RootRedirect } from "@/components/auth/RootRedirect";
import Index from "@/pages/Index";
import Documents from "@/pages/Documents";
import NewDocuments from "@/pages/NewDocuments";
import OldDocuments from "@/pages/OldDocuments";
import DocumentDetail from "@/pages/DocumentDetail";
import DocumentBuilder from "@/pages/DocumentBuilder";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import History from "@/pages/History";
import RequestPortal from "@/pages/RequestPortal";
import Branding from "@/pages/admin/branding";
import TempBonafideComparison from "@/pages/TempBonafideComparison";
import AdminDocuments from "@/pages/admin/documents";
import AdminDocumentBuilder from "@/pages/admin/documents/DocumentBuilder";
import NotFound from "@/pages/NotFound";
import VerifyDocument from "@/pages/VerifyDocument";
import EmployeePortal from "@/pages/EmployeePortal";
import EmployeeDocumentDetail from "@/pages/employee-portal/EmployeeDocumentDetail";
import { EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import NoAccess from "@/pages/employee-portal/NoAccess";
import { BookmarksPage } from "./pages/Index";
import { BookmarksProvider } from "./contexts/BookmarksContext";
import Auth from "@/pages/Auth";
import AuthConfirm from "@/pages/auth/confirm";
import EmailConfirmed from "@/pages/auth/email-confirmed";
import EmailVerified from "@/pages/auth/email-verified";
import CheckEmail from "@/pages/auth/check-email";
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
                {/* Root route - handles redirect logic based on localStorage */}
                <Route path="/" element={<RootRedirect />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                  {/* New routes */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <NewDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/old-documents"
            element={
              <ProtectedRoute>
                <OldDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-builder/:id"
            element={
              <ProtectedRoute>
                <DocumentBuilder />
              </ProtectedRoute>
            }
          />
          <Route
                    path="/templates/:id"
                    element={
                      <ProtectedRoute>
                        <DocumentDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates/:id/edit"
                    element={
                      <ProtectedRoute>
                        <DocumentBuilder />
                      </ProtectedRoute>
                    }
                  />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/auth/signup" element={<Onboarding />} />
                <Route path="/auth/email-confirmed" element={<EmailConfirmed />} />
                <Route path="/auth/email-verified" element={<EmailVerified />} />
                <Route path="/auth/check-email" element={<CheckEmail />} />
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
                  path="/portal/:slug"
                  element={<EmployeePortal />}
                />
                <Route
                  path="/portal/:slug/documents/:id"
                  element={<EmployeeDocumentDetail />}
                />
                <Route
                  path="/portal/:slug/templates/:id"
                  element={<EmployeeDocumentDetail />}
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                  {/* New admin routes */}
                  <Route
                    path="/admin/documents"
                    element={
                      <ProtectedRoute>
                        <AdminDocuments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/documents/:id"
                    element={
                      <ProtectedRoute>
                        <AdminDocumentBuilder />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Legacy admin routes for backward compatibility */}
                  <Route
                    path="/admin/templates"
                    element={
                      <ProtectedRoute>
                        <AdminDocuments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/templates/:id"
                    element={
                      <ProtectedRoute>
                        <AdminDocumentBuilder />
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
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route path="/verify/:hash" element={<VerifyDocument />} />
                <Route path="/no-access" element={<NoAccess />} />
                <Route
                  path="/temp-doc/bonafide"
                  element={
                    <ProtectedRoute>
                      <TempBonafideComparison />
                    </ProtectedRoute>
                  }
                />
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
