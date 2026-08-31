import { Navigate, Route, Routes } from 'react-router-dom';
import { DeviceFrame } from '@/components/layout/DeviceFrame';
import { patientNavItems } from '@/components/layout/navItems';
import SplashPage from './auth/SplashPage';
import RoleSelectPage from './auth/RoleSelectPage';
import NameSetupPage from './auth/NameSetupPage';
import HomePage from './home/HomePage';
import GalleryPage from './gallery/GalleryPage';
import GameStartPage from './games/GameStartPage';
import GameInstructionsPage from './games/GameInstructionsPage';
import GamePlayPage from './games/GamePlayPage';
import MedicationsPage from './medications/MedicationsPage';
import StatsPage from './stats/StatsPage';
import AccountPage from './account/AccountPage';
import DocumentsPage from './documents/DocumentsPage';
import SosPage from './sos/SosPage';

function PatientShell({ children }) {
  return (
    <DeviceFrame showNav navItems={patientNavItems}>
      {children}
    </DeviceFrame>
  );
}

export default function PatientRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/role" element={<RoleSelectPage />} />
      <Route path="/name-setup" element={<NameSetupPage />} />
      <Route
        path="/home"
        element={
          <PatientShell>
            <HomePage />
          </PatientShell>
        }
      />
      <Route
        path="/gallery"
        element={
          <PatientShell>
            <GalleryPage />
          </PatientShell>
        }
      />
      <Route path="/games" element={<GameStartPage />} />
      <Route path="/games/instructions" element={<GameInstructionsPage />} />
      <Route path="/games/play" element={<GamePlayPage />} />
      <Route
        path="/medications"
        element={
          <PatientShell>
            <MedicationsPage />
          </PatientShell>
        }
      />
      <Route
        path="/stats"
        element={
          <PatientShell>
            <StatsPage />
          </PatientShell>
        }
      />
      <Route
        path="/account"
        element={
          <PatientShell>
            <AccountPage />
          </PatientShell>
        }
      />
      <Route
        path="/documents"
        element={
          <PatientShell>
            <DocumentsPage />
          </PatientShell>
        }
      />
      <Route
        path="/sos"
        element={
          <PatientShell>
            <SosPage />
          </PatientShell>
        }
      />
      <Route path="*" element={<Navigate to="/patient" replace />} />
    </Routes>
  );
}
