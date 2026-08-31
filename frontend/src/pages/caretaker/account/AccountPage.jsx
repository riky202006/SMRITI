import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconUser } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { appData } = useAppData();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Account" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ textAlign: 'center', padding: 24, marginBottom: 20 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fff3e0', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={36} />
          </div>
          <h2 className="headline-md">{appData.caretakerName || 'Anita Sharma'}</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>{appData.caretakerRole || 'Primary Caregiver'}</p>
        </Card>

        <Button variant="outline" onClick={() => navigate('/')}>
          Switch to Patient Mode
        </Button>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
