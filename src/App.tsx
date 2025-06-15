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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/templates/:id" element={<ProtectedRoute><TemplateDetail /></ProtectedRoute>} />
              <Route path="/template-builder" element={<ProtectedRoute><TemplateBuilder /></ProtectedRoute>} />
              <Route path="/verify/:hash" element={<VerifyDocument />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
            <Toaster />
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
