import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import SmritiLogo from '@/components/ui/SmritiLogo';
import { IconUser, IconHeart } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  // If already authenticated, redirect to appropriate portal
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'caretaker') {
        navigate('/caretaker/dashboard', { replace: true });
      } else {
        navigate('/patient/home', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSelectRole = (role) => {
    if (role === 'patient') {
      navigate('/patient/auth/login');
    } else {
      navigate('/caretaker/auth/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SmritiLogo size="medium" style={{ marginBottom: 16 }} />

          <h1 className="headline-lg" style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', margin: '0 0 6px' }}>
            Select Your Role
          </h1>

          <p className="body-md" style={{ color: 'var(--outline)', margin: 0, fontSize: '15px' }}>
            Choose how you would like to use SMRITI today.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient Card */}
          <Card
            onClick={() => handleSelectRole('patient')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              cursor: 'pointer',
              padding: '22px',
              border: '2px solid transparent',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--mint-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUser size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="headline-sm" style={{ fontSize: '19px', margin: 0 }}>I am a Patient</h2>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', margin: '4px 0 0' }}>
                Easy reminders, family memory games &amp; emergency help.
              </p>
            </div>
          </Card>

          {/* Caretaker Card */}
          <Card
            onClick={() => handleSelectRole('caretaker')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              cursor: 'pointer',
              padding: '22px',
              border: '2px solid transparent',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#fff3e0',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconHeart size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="headline-sm" style={{ fontSize: '19px', margin: 0 }}>I am a Caretaker</h2>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', margin: '4px 0 0' }}>
                Manage prescriptions, appointments, tracking &amp; cognitive reports.
              </p>
            </div>
          </Card>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--outline)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px',
            }}
          >
            ← Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
}
