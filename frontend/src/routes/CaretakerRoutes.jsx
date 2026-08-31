import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import RoleSelectPage from '@/pages/caretaker/auth/RoleSelectPage';
import NameSetupPage from '@/pages/caretaker/auth/NameSetupPage';
import LoginPage from '@/pages/caretaker/auth/LoginPage';

import DashboardPage from '@/pages/caretaker/dashboard/DashboardPage';
import PatientProfilePage from '@/pages/caretaker/patient-profile/PatientProfilePage';
import MedicinePage from '@/pages/caretaker/medications/MedicinePage';
import VisitsPage from '@/pages/caretaker/visits/VisitsPage';
import AnalyticsPage from '@/pages/caretaker/analytics/AnalyticsPage';
import GalleryPage from '@/pages/caretaker/gallery/GalleryPage';
import AddImagePage from '@/pages/caretaker/gallery/AddImagePage';
import MemorySetupPage from '@/pages/caretaker/memory/MemorySetupPage';
import DocsSetupPage from '@/pages/caretaker/documents/DocsSetupPage';
import SosPage from '@/pages/caretaker/sos/SosPage';
import MapPage from '@/pages/caretaker/live-tracking/MapPage';
import AccountPage from '@/pages/caretaker/account/AccountPage';

export default function CaretakerRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="auth/role-select" element={<RoleSelectPage />} />
      <Route path="auth/login" element={<LoginPage />} />
      <Route path="auth/name-setup" element={<NameSetupPage />} />

      {/* Protected Caretaker Routes */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="patient-profile"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="medications"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <MedicinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="visits"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <VisitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="analytics"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="gallery"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <GalleryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="gallery/add"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <AddImagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="memory"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <MemorySetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="documents"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <DocsSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="sos"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <SosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="live-tracking"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <MapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="account"
        element={
          <ProtectedRoute allowedRole="caretaker">
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
