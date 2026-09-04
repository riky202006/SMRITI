import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconHome,
  IconMedication,
  IconGamepad,
  IconSos,
  IconUser,
  IconStats,
  IconMap,
} from '../icons';

export default function BottomNav({ mode = 'patient' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const patientItems = [
    { label: 'Home', path: '/patient/home', icon: IconHome },
    { label: 'Meds', path: '/patient/medications', icon: IconMedication },
    { label: 'Games', path: '/patient/games', icon: IconGamepad },
    { label: 'SOS', path: '/patient/sos', icon: IconSos },
    { label: 'Account', path: '/patient/account', icon: IconUser },
  ];

  const caretakerItems = [
    { label: 'Dashboard', path: '/caretaker/dashboard', icon: IconHome },
    { label: 'Meds', path: '/caretaker/medications', icon: IconMedication },
    { label: 'Live Map', path: '/caretaker/live-tracking', icon: IconMap },
    { label: 'Analytics', path: '/caretaker/analytics', icon: IconStats },
    { label: 'Account', path: '/caretaker/account', icon: IconUser },
  ];

  const items = mode === 'caretaker' ? caretakerItems : patientItems;

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
