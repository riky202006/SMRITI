import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { IconUser } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { appData, showToast } = useAppData();
  const { user, profile, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showToast('Logged out successfully.');
      navigate('/', { replace: true });
    } catch {
      showToast('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = profile?.full_name || appData.caretakerName || 'Anita Sharma';
  const displayEmailOrPhone = user?.email || profile?.phone || appData.caretakerEmail || 'caretaker@smriti.app';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Account" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ textAlign: 'center', padding: 24, marginBottom: 20 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fff3e0', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={36} />
          </div>
          <h2 className="headline-md">{displayName}</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>{displayEmailOrPhone}</p>
          <p className="label-sm" style={{ color: 'var(--primary)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {profile?.role || 'Caretaker'} Account
          </p>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="danger" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Button>

          <Button variant="outline" onClick={() => navigate('/')}>
            Switch to Patient Mode
          </Button>
        </div>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
