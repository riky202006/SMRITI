import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';
import {
  IconUser,
  IconMedication,
  IconMap,
  IconStats,
  IconGallery,
  IconDocument,
  IconCalendar,
  IconSos,
} from '@/components/icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { appData } = useAppData();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Hub" showBack={false} />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ backgroundColor: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-xl)' }}>
          <p className="body-md" style={{ color: 'var(--mint)' }}>Care Companion Active</p>
          <h2 className="headline-lg" style={{ color: 'var(--white)', marginTop: 4 }}>
            {appData.caretakerName || 'Anita'}
          </h2>
          <p className="body-md" style={{ opacity: 0.8, marginTop: 4 }}>
            Monitoring: <strong>{appData.patientName || 'Ravi Kumar'}</strong>
          </p>
        </Card>

        <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, color: 'var(--outline)' }}>
          CARE MANAGEMENT
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card onClick={() => navigate('/caretaker/patient-profile')} style={{ cursor: 'pointer' }}>
            <IconUser size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
            <p className="label-lg">Patient Profile</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/medications')} style={{ cursor: 'pointer' }}>
            <IconMedication size={28} style={{ color: 'var(--secondary)', marginBottom: 8 }} />
            <p className="label-lg">Medicine Setup</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/live-tracking')} style={{ cursor: 'pointer' }}>
            <IconMap size={28} style={{ color: '#00796b', marginBottom: 8 }} />
            <p className="label-lg">Live GPS Map</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/visits')} style={{ cursor: 'pointer' }}>
            <IconCalendar size={28} style={{ color: '#54534e', marginBottom: 8 }} />
            <p className="label-lg">Appointments</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/analytics')} style={{ cursor: 'pointer' }}>
            <IconStats size={28} style={{ color: '#2e7d32', marginBottom: 8 }} />
            <p className="label-lg">Analytics</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/gallery')} style={{ cursor: 'pointer' }}>
            <IconGallery size={28} style={{ color: '#e67e22', marginBottom: 8 }} />
            <p className="label-lg">Photo Gallery</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/documents')} style={{ cursor: 'pointer' }}>
            <IconDocument size={28} style={{ color: '#1565c0', marginBottom: 8 }} />
            <p className="label-lg">Documents</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/sos')} style={{ cursor: 'pointer', backgroundColor: 'var(--error-container)' }}>
            <IconSos size={28} style={{ color: 'var(--error)', marginBottom: 8 }} />
            <p className="label-lg" style={{ color: 'var(--on-error-container)' }}>SOS Alerts</p>
          </Card>
        </div>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
