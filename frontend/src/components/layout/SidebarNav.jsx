import { useLocation, useNavigate } from 'react-router-dom';
import SmritiLogo from '@/components/ui/SmritiLogo';
import {
  IconHome,
  IconMedication,
  IconGamepad,
  IconSos,
  IconUser,
  IconStats,
  IconMap,
  IconGallery,
  IconCalendar,
  IconDocument,
} from '../icons';

export default function SidebarNav({ mode = 'patient' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const patientItems = [
    { label: 'Home', path: '/patient/home', icon: IconHome },
    { label: 'Daily Meds', path: '/patient/medications', icon: IconMedication },
    { label: 'Memory Game', path: '/patient/games', icon: IconGamepad },
    { label: 'Family Photos', path: '/patient/gallery', icon: IconGallery },
    { label: 'Documents', path: '/patient/documents', icon: IconDocument },
    { label: 'Progress Stats', path: '/patient/stats', icon: IconStats },
    { label: 'Emergency SOS', path: '/patient/sos', icon: IconSos },
    { label: 'My Account', path: '/patient/account', icon: IconUser },
  ];

  const caretakerItems = [
    { label: 'Dashboard', path: '/caretaker/dashboard', icon: IconHome },
    { label: 'Patient Profile', path: '/caretaker/patient-profile', icon: IconUser },
    { label: 'Medications', path: '/caretaker/medications', icon: IconMedication },
    { label: 'Appointments', path: '/caretaker/visits', icon: IconCalendar },
    { label: 'Live GPS Map', path: '/caretaker/live-tracking', icon: IconMap },
    { label: 'Analytics', path: '/caretaker/analytics', icon: IconStats },
    { label: 'Photo Album', path: '/caretaker/gallery', icon: IconGallery },
    { label: 'Documents', path: '/caretaker/documents', icon: IconDocument },
    { label: 'SOS Monitor', path: '/caretaker/sos', icon: IconSos },
    { label: 'Account', path: '/caretaker/account', icon: IconUser },
  ];

  const items = mode === 'caretaker' ? caretakerItems : patientItems;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <SmritiLogo
          size="sidebar"
          subtitle={mode === 'caretaker' ? 'Caretaker Portal' : 'Patient Companion'}
        />
      </div>

      <nav className="sidebar-nav-list">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
