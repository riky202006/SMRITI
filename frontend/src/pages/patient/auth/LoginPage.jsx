import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/patient/home');
  };

  return (
    <div style={{ padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <Card>
        <h1 className="headline-md" style={{ marginBottom: 12 }}>Patient Login</h1>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24 }}>
          Enter your 4-digit security PIN or tap continue.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="• • • •"
            style={{
              width: '100%',
              padding: '16px',
              textAlign: 'center',
              fontSize: '32px',
              letterSpacing: '12px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--outline-variant)',
              marginBottom: 24,
              outline: 'none',
            }}
          />

          <Button type="submit" variant="primary">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}
