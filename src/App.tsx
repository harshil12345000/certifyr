import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrandingProvider } from '@/contexts/BrandingContext';
import Dashboard from '@/pages/Templates';
import Templates from '@/pages/Templates';
import TemplateDetail from '@/pages/TemplateDetail';
import TemplateBuilder from '@/pages/TemplateBuilder';
import VerifyDocument from './pages/VerifyDocument';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import Settings from '@/pages/Settings';
import CertifyrAdmin from '@/pages/certifyradmin';
import Branding from '@/pages/admin/branding';
import TemplatesDashboard from '@/pages/admin/templates';
import AdminTemplateBuilder from '@/pages/admin/templates/TemplateBuilder';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/templates/:id" element={<ProtectedRoute><TemplateDetail /></ProtectedRoute>} />
              <Route path="/template-builder" element={<ProtectedRoute><TemplateBuilder /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/templates" element={<ProtectedRoute><TemplatesDashboard /></ProtectedRoute>} />
              <Route path="/admin/templates/builder" element={<ProtectedRoute><AdminTemplateBuilder /></ProtectedRoute>} />
              <Route path="/admin/branding" element={<ProtectedRoute><Branding /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/verify/:hash" element={<VerifyDocument />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
