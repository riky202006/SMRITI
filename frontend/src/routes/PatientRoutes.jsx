import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import RoleSelectPage from '@/pages/patient/auth/RoleSelectPage';
import NameSetupPage from '@/pages/patient/auth/NameSetupPage';
import LoginPage from '@/pages/patient/auth/LoginPage';

import HomePage from '@/pages/patient/home/HomePage';
import GameStartPage from '@/pages/patient/games/GameStartPage';
import GameInstructionsPage from '@/pages/patient/games/GameInstructionsPage';
import GameCountdownPage from '@/pages/patient/games/GameCountdownPage';
import GameReadyPage from '@/pages/patient/games/GameReadyPage';
import GameQuestionPage from '@/pages/patient/games/GameQuestionPage';
import GameCorrectPage from '@/pages/patient/games/GameCorrectPage';
import GameResultPage from '@/pages/patient/games/GameResultPage';

import RemindersPage from '@/pages/patient/medications/RemindersPage';
import StatsPage from '@/pages/patient/stats/StatsPage';
import AccountPage from '@/pages/patient/account/AccountPage';
import DocumentsPage from '@/pages/patient/documents/DocumentsPage';
import SosPage from '@/pages/patient/sos/SosPage';
import GalleryPage from '@/pages/patient/gallery/GalleryPage';

export default function PatientRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="auth/role-select" element={<RoleSelectPage />} />
      <Route path="auth/login" element={<LoginPage />} />
      <Route path="auth/name-setup" element={<NameSetupPage />} />

      {/* Protected Patient Routes */}
      <Route
        path="home"
        element={
          <ProtectedRoute allowedRole="patient">
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameStartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/instructions"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameInstructionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/countdown"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameCountdownPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/ready"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameReadyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/question"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameQuestionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/correct"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameCorrectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="games/result"
        element={
          <ProtectedRoute allowedRole="patient">
            <GameResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="medications"
        element={
          <ProtectedRoute allowedRole="patient">
            <RemindersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="stats"
        element={
          <ProtectedRoute allowedRole="patient">
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="account"
        element={
          <ProtectedRoute allowedRole="patient">
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="documents"
        element={
          <ProtectedRoute allowedRole="patient">
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="sos"
        element={
          <ProtectedRoute allowedRole="patient">
            <SosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="gallery"
        element={
          <ProtectedRoute allowedRole="patient">
            <GalleryPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
