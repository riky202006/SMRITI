import { Navigate, Route, Routes } from 'react-router-dom';
import DeviceFrame from './components/layout/DeviceFrame';
import RoleSelectPage from './pages/patient/auth/RoleSelectPage';
import PatientRoutes from './routes/PatientRoutes';
import CaretakerRoutes from './routes/CaretakerRoutes';

export default function App() {
  return (
    <DeviceFrame>
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/patient/*" element={<PatientRoutes />} />
        <Route path="/caretaker/*" element={<CaretakerRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DeviceFrame>
  );
}
