import { Routes, Route, Navigate } from 'react-router-dom';
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
      <Route path="auth/role-select" element={<RoleSelectPage />} />
      <Route path="auth/name-setup" element={<NameSetupPage />} />
      <Route path="auth/login" element={<LoginPage />} />

      <Route path="home" element={<HomePage />} />

      <Route path="games" element={<GameStartPage />} />
      <Route path="games/instructions" element={<GameInstructionsPage />} />
      <Route path="games/countdown" element={<GameCountdownPage />} />
      <Route path="games/ready" element={<GameReadyPage />} />
      <Route path="games/question" element={<GameQuestionPage />} />
      <Route path="games/correct" element={<GameCorrectPage />} />
      <Route path="games/result" element={<GameResultPage />} />

      <Route path="medications" element={<RemindersPage />} />
      <Route path="stats" element={<StatsPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="sos" element={<SosPage />} />
      <Route path="gallery" element={<GalleryPage />} />

      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}
