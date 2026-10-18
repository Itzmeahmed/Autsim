import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingAuthPage } from './pages/LandingAuthPage';
import { AboutDevelopersPage } from './pages/AboutDevelopersPage';
import { PatientLoginPage } from './pages/PatientLoginPage';
import { PatientRegisterPage } from './pages/PatientRegisterPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { ScreeningPage } from './pages/ScreeningPage';
import { ScreeningResultPage } from './pages/ScreeningResultPage';
import { CliniciansDirectoryPage } from './pages/CliniciansDirectoryPage';
import { ClinicianLoginPage } from './pages/ClinicianLoginPage';
import { ClinicianDashboard } from './pages/ClinicianDashboard';
import { ClinicianPatientView } from './pages/ClinicianPatientView';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Strict Role Guard Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to matching role homepage
    if (user.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'clinician') return <Navigate to="/clinician/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="pb-16 md:pb-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingAuthPage />} />
            <Route path="/about" element={<AboutDevelopersPage />} />

            {/* Separate Patient Portal Routes */}
            <Route path="/patient/login" element={<PatientLoginPage />} />
            <Route path="/patient/register" element={<PatientRegisterPage />} />
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />

            {/* Screening & Clinical Connection Routes */}
            <Route
              path="/screening"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <ScreeningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result/:id"
              element={
                <ProtectedRoute>
                  <ScreeningResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinicians"
              element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <CliniciansDirectoryPage />
                </ProtectedRoute>
              }
            />

            {/* Separate Clinician / Doctor Portal Routes */}
            <Route path="/clinician/login" element={<ClinicianLoginPage />} />
            <Route
              path="/clinician/dashboard"
              element={
                <ProtectedRoute allowedRoles={['clinician']}>
                  <ClinicianDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/clinician" element={<Navigate to="/clinician/dashboard" replace />} />
            <Route
              path="/clinician/patient/:id"
              element={
                <ProtectedRoute allowedRoles={['clinician', 'admin']}>
                  <ClinicianPatientView />
                </ProtectedRoute>
              }
            />

            {/* Separate Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
