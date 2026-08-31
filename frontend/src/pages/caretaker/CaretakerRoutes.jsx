import { Navigate, Route, Routes } from 'react-router-dom';
import { DeviceFrame } from '@/components/layout/DeviceFrame';
import { caretakerNavItems } from '@/components/layout/navItems';
import RoleSelectPage from './auth/RoleSelectPage';
import NameSetupPage from './auth/NameSetupPage';
import DashboardPage from './dashboard/DashboardPage';
import PatientProfilePage from './patient-profile/PatientProfilePage';
import DocsSetupPage from './documents/DocsSetupPage';
import MemorySetupPage from './memory/MemorySetupPage';
import AddImagePage from './gallery/AddImagePage';
import GalleryPage from './gallery/GalleryPage';
import MedicationsPage from './medications/MedicationsPage';
import VisitsPage from './visits/VisitsPage';
import AnalyticsPage from './analytics/AnalyticsPage';
import ReviewsPage from './reviews/ReviewsPage';
import SosPage from './sos/SosPage';
import InternshipPage from './internship/InternshipPage';
import MarketPage from './market/MarketPage';
import AccountPage from './account/AccountPage';
import MapPage from './live-tracking/MapPage';

function CaretakerShell({ children, showNav = true }) {
  return (
    <DeviceFrame showNav={showNav} navItems={caretakerNavItems}>
      {children}
    </DeviceFrame>
  );
}

export default function CaretakerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/caretaker/role" replace />} />
      <Route path="/role" element={<RoleSelectPage />} />
      <Route path="/name-setup" element={<NameSetupPage />} />
      <Route
        path="/dashboard"
        element={
          <CaretakerShell>
            <DashboardPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/patient"
        element={
          <CaretakerShell showNav={false}>
            <PatientProfilePage />
          </CaretakerShell>
        }
      />
      <Route
        path="/documents"
        element={
          <CaretakerShell showNav={false}>
            <DocsSetupPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/memory"
        element={
          <CaretakerShell>
            <MemorySetupPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/gallery/add"
        element={
          <CaretakerShell showNav={false}>
            <AddImagePage />
          </CaretakerShell>
        }
      />
      <Route
        path="/gallery"
        element={
          <CaretakerShell showNav={false}>
            <GalleryPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/medications"
        element={
          <CaretakerShell>
            <MedicationsPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/visits"
        element={
          <CaretakerShell>
            <VisitsPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/analytics"
        element={
          <CaretakerShell>
            <AnalyticsPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/reviews"
        element={
          <CaretakerShell showNav={false}>
            <ReviewsPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/sos"
        element={
          <CaretakerShell showNav={false}>
            <SosPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/internship"
        element={
          <CaretakerShell showNav={false}>
            <InternshipPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/market"
        element={
          <CaretakerShell showNav={false}>
            <MarketPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/account"
        element={
          <CaretakerShell showNav={false}>
            <AccountPage />
          </CaretakerShell>
        }
      />
      <Route
        path="/map"
        element={
          <CaretakerShell showNav={false}>
            <MapPage />
          </CaretakerShell>
        }
      />
      <Route path="*" element={<Navigate to="/caretaker/dashboard" replace />} />
    </Routes>
  );
}
