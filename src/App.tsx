import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionGate } from "@/components/auth/SubscriptionGate";
import { RootRedirect } from "@/components/auth/RootRedirect";
import { AIFloatingWidget } from "@/components/ai-assistant/AIFloatingWidget";
import { UpgradePrompt } from "@/components/shared/UpgradePrompt";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
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
import AIAssistant from "@/pages/AIAssistant";
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
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import OwnerDashboard from "@/pages/OwnerDashboard";

const queryClient = new QueryClient();

const Gated = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SubscriptionGate>{children}</SubscriptionGate>
  </ProtectedRoute>
);

function AppContent() {
  const [showUpgradePaywall, setShowUpgradePaywall] = useState(false);
  const { hasFeature } = usePlanFeatures();

  useEffect(() => {
    const handleShowUpgradePaywall = () => {
      setShowUpgradePaywall(true);
    };
    window.addEventListener('show-upgrade-paywall', handleShowUpgradePaywall);
    return () => window.removeEventListener('show-upgrade-paywall', handleShowUpgradePaywall);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<Gated><Index /></Gated>} />
        <Route path="/documents" element={<Gated><NewDocuments /></Gated>} />
        <Route path="/old-documents" element={<Gated><OldDocuments /></Gated>} />
        <Route path="/documents/:id" element={<Gated><DocumentDetail /></Gated>} />
        <Route path="/document-builder/:id" element={<Gated><DocumentBuilder /></Gated>} />
        <Route path="/templates/:id" element={<Gated><DocumentDetail /></Gated>} />
        <Route path="/templates/:id/edit" element={<Gated><DocumentBuilder /></Gated>} />
        <Route path="/request-portal" element={<Gated><RequestPortal /></Gated>} />
        <Route path="/ai-assistant" element={<Gated><AIAssistant /></Gated>} />
        <Route path="/organization" element={<Gated><Admin /></Gated>} />
        <Route path="/organization/documents" element={<Gated><AdminDocuments /></Gated>} />
        <Route path="/organization/documents/:id" element={<Gated><AdminDocumentBuilder /></Gated>} />
        <Route path="/organization/templates" element={<Gated><AdminDocuments /></Gated>} />
        <Route path="/organization/templates/:id" element={<Gated><AdminDocumentBuilder /></Gated>} />
        <Route path="/admin" element={<Gated><Admin /></Gated>} />
        <Route path="/admin/documents" element={<Gated><AdminDocuments /></Gated>} />
        <Route path="/admin/documents/:id" element={<Gated><AdminDocumentBuilder /></Gated>} />
        <Route path="/admin/templates" element={<Gated><AdminDocuments /></Gated>} />
        <Route path="/admin/templates/:id" element={<Gated><AdminDocumentBuilder /></Gated>} />
        <Route path="/settings" element={<Gated><Settings /></Gated>} />
        <Route path="/history" element={<Gated><History /></Gated>} />
        <Route path="/temp-doc/bonafide" element={<Gated><TempBonafideComparison /></Gated>} />
        <Route path="/bookmarks" element={<Gated><BookmarksPage /></Gated>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/signup" element={<Onboarding />} />
        <Route path="/auth/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/auth/email-verified" element={<EmailVerified />} />
        <Route path="/auth/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/portal/:slug" element={<EmployeePortal />} />
        <Route path="/portal/:slug/documents/:id" element={<EmployeeDocumentDetail />} />
        <Route path="/portal/:slug/templates/:id" element={<EmployeeDocumentDetail />} />
        <Route path="/verify/:hash" element={<VerifyDocument />} />
        <Route path="/no-access" element={<NoAccess />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      {hasFeature('aiAssistant') && <AIFloatingWidget />}
      <UpgradePrompt 
        requiredPlan="pro" 
        variant="dialog"
        open={showUpgradePaywall}
        onOpenChange={setShowUpgradePaywall}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <BookmarksProvider>
              <AppContent />
            </BookmarksProvider>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
