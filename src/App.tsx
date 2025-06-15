import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrandingProvider } from '@/contexts/BrandingContext';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Templates from '@/pages/Templates';
import TemplateDetail from '@/pages/TemplateDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Users from '@/pages/admin/Users';
import TemplatesAdmin from '@/pages/admin/TemplatesAdmin';
import TemplateBuilder from '@/pages/admin/templates/TemplateBuilder';
import Organizations from '@/pages/admin/Organizations';
import Settings from '@/pages/admin/Settings';
import Branding from '@/pages/admin/Branding';
import VerifyDocument from './pages/VerifyDocument';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/:id" element={<TemplateDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/templates" element={<TemplatesAdmin />} />
              <Route path="/admin/templates/builder" element={<TemplateBuilder />} />
              <Route path="/admin/organizations" element={<Organizations />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/branding" element={<Branding />} />
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
