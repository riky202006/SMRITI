import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import SmritiLogo from '@/components/ui/SmritiLogo';
import { useAuth } from '@/context/AuthContext';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  // If already authenticated, redirect directly to the dashboard
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'caretaker') {
        navigate('/caretaker/dashboard', { replace: true });
      } else {
        navigate('/patient/home', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const handleContinue = () => {
    navigate('/select-role');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
        <SmritiLogo size="large" style={{ marginBottom: 20 }} />

        <h1 className="headline-lg" style={{ fontSize: 'clamp(26px, 4vw, 36px)', margin: '0 0 10px' }}>
          Welcome to SMRITI
        </h1>

        <p className="body-md" style={{ color: 'var(--outline)', margin: '0 auto 32px', maxWidth: '420px', fontSize: '16px', lineHeight: 1.5 }}>
          Your calm, accessible daily memory &amp; care companion designed for patients and caregivers.
        </p>

        <Button
          variant="primary"
          onClick={handleContinue}
          style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
