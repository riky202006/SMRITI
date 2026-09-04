import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { IconUser } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showToast('Logged out successfully.');
      navigate('/select-role', { replace: true });
    } catch {
      showToast('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Caretaker User';
  const displayEmailOrPhone = user?.email || profile?.phone || 'No email registered';

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Caretaker Account" />

      <div style={{ maxWidth: '540px', width: '100%', margin: '8px auto 0' }}>
        <Card style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 20 }}>
          <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: '#fff3e0', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={40} />
          </div>
          <h2 className="headline-md" style={{ fontSize: '24px', margin: '0 0 4px' }}>{displayName}</h2>
          <p className="body-md" style={{ color: 'var(--outline)', margin: 0 }}>{displayEmailOrPhone}</p>
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                backgroundColor: 'var(--mint-soft)',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {profile?.role || 'Caretaker'} Portal Access
            </span>
          </div>
        </Card>

        <div>
          <Button variant="danger" onClick={handleLogout} disabled={loggingOut} style={{ width: '100%' }}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
