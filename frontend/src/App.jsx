import { Navigate, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/patient/auth/WelcomePage';
import RoleSelectPage from './pages/patient/auth/RoleSelectPage';
import PatientRoutes from './routes/PatientRoutes';
import CaretakerRoutes from './routes/CaretakerRoutes';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/select-role" element={<RoleSelectPage />} />
      <Route path="/patient/*" element={<PatientRoutes />} />
      <Route path="/caretaker/*" element={<CaretakerRoutes />} />
      <Route path="*" element={<Navigate to="/select-role" replace />} />
    </Routes>
  );
}
