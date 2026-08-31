import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelectPage from '@/pages/caretaker/auth/RoleSelectPage';
import NameSetupPage from '@/pages/caretaker/auth/NameSetupPage';

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
      <Route path="auth/role-select" element={<RoleSelectPage />} />
      <Route path="auth/name-setup" element={<NameSetupPage />} />

      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="patient-profile" element={<PatientProfilePage />} />
      <Route path="medications" element={<MedicinePage />} />
      <Route path="visits" element={<VisitsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="gallery" element={<GalleryPage />} />
      <Route path="gallery/add" element={<AddImagePage />} />
      <Route path="memory" element={<MemorySetupPage />} />
      <Route path="documents" element={<DocsSetupPage />} />
      <Route path="sos" element={<SosPage />} />
      <Route path="live-tracking" element={<MapPage />} />
      <Route path="account" element={<AccountPage />} />

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
