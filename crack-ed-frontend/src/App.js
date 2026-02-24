import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import PortalLoginPage from './pages/PortalLoginPage';
import PortalDashboardPage from './pages/PortalDashboardPage';
import PortalRegisterPage from './pages/PortalRegisterPage';
import { DataProvider } from './context/DataContext';
import PortalApplicationPage from './pages/PortalApplicationPage';
import PortalHomePage from './pages/PortalHomePage';
import PageSuccess from './pages/PageSuccess';
import PaymentOptionsPage from './components/PaymentOptionsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettingsPage from './pages/AdminSettingsPage';
import PaymentHistoryDashboard from './pages/PaymentHistoryDashboard';
import LoanPlans from './components/LoanProviders';
import ThankYouPage from './components/LoanThankyou';
import LoanDashboard from './pages/LoanDashboard.jsx';
import PaymentSuccess from './components/PaymentSuccess';
import AdminLoanProvidersDashboard from './pages/AdminLoanProvidersDashboard';

// Auth wrapper for protected routes
function RequireAdminAuth({ children }) {
  const location = useLocation();
  const role = localStorage.getItem('admin_role');
  if (!role) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/portal" replace />} />
              <Route path="/portal" element={<PortalHomePage />} />
              <Route path="/portal/dashboard" element={<PortalDashboardPage />} />
              <Route path="/portal/application-form" element={<PortalApplicationPage />} />  
              <Route path="/portal/application-success" element={<PageSuccess />} />
              <Route path="/portal/login" element={<PortalLoginPage />} />
              <Route path="/portal/register" element={<PortalRegisterPage />} />
              <Route path="/portal/payment-options" element={<PaymentOptionsPage />} />
              <Route path="/portal/payment-success" element={<PaymentSuccess />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/portal/loan-options" element={<LoanPlans />} />
              <Route path="/portal/loan-thankyou" element={<ThankYouPage />} />
              <Route path="/admin-dashboard" element={
                <RequireAdminAuth>
                  <AdminDashboard />
                </RequireAdminAuth>
              } />
              <Route path="/admin/dashboard" element={
                <RequireAdminAuth>
                  <AdminDashboard />
                </RequireAdminAuth>
              } />
              <Route path="/admin-payment-history" element={
                <RequireAdminAuth>
                  <PaymentHistoryDashboard />
                </RequireAdminAuth>
              } />
              <Route path="/admin-loan-dashboard" element={
                <RequireAdminAuth>
                  <LoanDashboard />
                </RequireAdminAuth>
              } />
              <Route path="/admin-settings" element={
                <RequireAdminAuth>
                  <AdminSettingsPage />
                </RequireAdminAuth>
              } />
               <Route path="/admin-loan-providers" element={<RequireAdminAuth><AdminLoanProvidersDashboard /></RequireAdminAuth>} />
              <Route path="/admin" element={<Navigate to="/admin-login" replace />} />
            </Routes>
          </DataProvider>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
