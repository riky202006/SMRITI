import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/hooks/useAppData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { showToast, updateCaretakerName } = useAppData();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const formatErrorMessage = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;

    if (err.code === 'over_email_send_rate_limit' || err.status === 429) {
      setIsRateLimited(true);
      return 'Email rate limit reached on Supabase [429 over_email_send_rate_limit]. If you already registered this account, please click "Sign In" below. Otherwise, please wait a short while for the limit to reset.';
    }

    if (err.isExistingUser || err.code === 'user_already_exists') {
      return 'This account is already registered. Please sign in below.';
    }

    const parts = [];
    if (err.code) parts.push(`Code: ${err.code}`);
    if (err.status) parts.push(`Status: ${err.status}`);
    const details = parts.length > 0 ? ` [${parts.join(', ')}]` : '';
    return `${err.message || 'Authentication error'}${details}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsRateLimited(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const caretakerName = fullName.trim() || 'Caretaker';
        const { user, error } = await signup({
          email: trimmedEmail,
          password,
          fullName: caretakerName,
          role: 'caretaker',
          phone: phone.trim(),
        });

        if (error) {
          setErrorMsg(formatErrorMessage(error));
          if (error.isExistingUser) {
            setIsSignUp(false);
          }
          return;
        }

        if (user) {
          updateCaretakerName(caretakerName);
          showToast('Caretaker account created successfully!');
          navigate('/caretaker/dashboard', { replace: true });
        }
      } else {
        const { user, profile, error } = await login({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMsg(formatErrorMessage(error));
          return;
        }

        if (user) {
          if (profile?.full_name) {
            updateCaretakerName(profile.full_name);
          }
          showToast('Welcome to Caretaker Dashboard');
          navigate('/caretaker/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <Card>
        <h1 className="headline-md" style={{ marginBottom: 8 }}>
          {isSignUp ? 'Caretaker Registration' : 'Caretaker Portal Login'}
        </h1>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20 }}>
          {isSignUp
            ? 'Create an account to monitor patients, medications & safety.'
            : 'Sign in to access patient analytics, live tracking & schedules.'}
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isRateLimited ? '#fff3e0' : 'var(--error-container)',
              color: isRateLimited ? '#e65100' : 'var(--on-error-container)',
              fontSize: '14px',
              marginBottom: 16,
              lineHeight: 1.4,
              wordBreak: 'break-word',
              border: isRateLimited ? '1px solid #ffb74d' : 'none',
            }}
          >
            <strong>{isRateLimited ? 'Notice:' : 'Supabase Auth Error:'}</strong> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anita Sharma"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--outline-variant)',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--outline-variant)',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. caretaker@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--outline-variant)',
                fontSize: '16px',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--outline-variant)',
                fontSize: '16px',
                outline: 'none',
              }}
              required
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
            {loading ? 'Authenticating...' : isSignUp ? 'Create Caretaker Account' : 'Sign In'}
          </Button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setIsRateLimited(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              {isSignUp ? 'Already registered? Sign In' : 'New caretaker? Register here'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--outline)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              Switch Role
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
