
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Routes>
              <Route path="/" element={<Templates />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/:id" element={<TemplateDetail />} />
              <Route path="/template-builder" element={<TemplateBuilder />} />
              <Route path="/verify/:hash" element={<VerifyDocument />} />
            </Routes>
            <Toaster />
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
