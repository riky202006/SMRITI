import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IconUser, IconHeart } from '@/components/icons';
import { useAppData } from '@/hooks/useAppData';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useAppData();

  const handleSelectRole = (role) => {
    setRole(role);
    if (role === 'patient') {
      navigate('/patient/auth/name-setup');
    } else {
      navigate('/caretaker/auth/name-setup');
    }
  };

  return (
    <div style={{ padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '9999px', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', marginBottom: 16 }}>
          <IconHeart size={48} />
        </div>
        <h1 className="headline-lg">Welcome to Smriti</h1>
        <p className="body-md" style={{ color: 'var(--outline)', marginTop: 8 }}>
          Your warm and calm daily memory companion.
        </p>
      </div>

      <Card onClick={() => handleSelectRole('patient')} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
        <div style={{ padding: 14, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
          <IconUser size={32} />
        </div>
        <div>
          <h2 className="headline-sm">I am a Patient</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>Easy reminders, memory games & help.</p>
        </div>
      </Card>

      <Card onClick={() => handleSelectRole('caretaker')} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
        <div style={{ padding: 14, borderRadius: 'var(--radius-pill)', backgroundColor: '#fff3e0', color: 'var(--secondary)' }}>
          <IconHeart size={32} />
        </div>
        <div>
          <h2 className="headline-sm">I am a Caretaker</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>Manage care, tracking & routines.</p>
        </div>
      </Card>
    </div>
  );
}
