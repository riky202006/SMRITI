import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Transform 4-digit PIN to standard Supabase auth password (min 6 chars)
  const pinToPassword = (p) => `${p}#smriti2026`;

  const formatErrorMessage = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;

    if (err.code === 'over_email_send_rate_limit' || err.status === 429) {
      setIsRateLimited(true);
      return 'Email rate limit reached on Supabase. If you already registered this email, please click "Sign In" below.';
    }

    if (err.isExistingUser || err.code === 'user_already_exists') {
      return 'This account is already registered. Please sign in below using your 4-digit PIN.';
    }

    return err.message || 'Authentication error';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsRateLimited(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMsg('Please enter a 4-digit security PIN.');
      return;
    }

    // Client-side confirmation validation for patient registration
    if (isSignUp) {
      if (!confirmPin || confirmPin.length < 4) {
        setErrorMsg('Please confirm your 4-digit security PIN.');
        return;
      }

      if (pin !== confirmPin) {
        setErrorMsg('PINs do not match. Please ensure both 4-digit PINs are identical.');
        return;
      }
    }

    const authEmail = trimmedEmail.includes('@')
      ? trimmedEmail
      : `${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '')}@patient.smriti.app`;

    const authPassword = pinToPassword(pin);

    setLoading(true);

    try {
      if (isSignUp) {
        const patientName = fullName.trim() || 'Patient';
        const { user, error } = await signup({
          email: authEmail,
          password: authPassword,
          fullName: patientName,
          role: 'patient',
        });

        if (error) {
          setErrorMsg(formatErrorMessage(error));
          if (error.isExistingUser) {
            setIsSignUp(false);
          }
          return;
        }

        if (user) {
          showToast('Account created successfully!');
          navigate('/patient/home', { replace: true });
        }
      } else {
        const { user, error } = await login({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          setErrorMsg(formatErrorMessage(error));
          return;
        }

        if (user) {
          showToast('Welcome back!');
          navigate('/patient/home', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <Card style={{ padding: '32px 28px' }}>
          <h1 className="headline-md" style={{ marginBottom: 8, fontSize: '24px' }}>
            {isSignUp ? 'Create Patient Profile' : 'Patient Login'}
          </h1>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: '15px' }}>
            {isSignUp
              ? 'Set up your email and 4-digit PIN for simple, safe access.'
              : 'Enter your email and 4-digit security PIN.'}
          </p>

          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isRateLimited ? '#fff3e0' : 'var(--error-container)',
                color: isRateLimited ? '#e65100' : 'var(--on-error-container)',
                fontSize: '14px',
                marginBottom: 20,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              <strong>Notice:</strong> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isSignUp && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. patient@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">4-Digit Security PIN</label>
              <input
                type="password"
                className="form-input"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • •"
                style={{
                  textAlign: 'center',
                  fontSize: '28px',
                  letterSpacing: '12px',
                  padding: '8px',
                }}
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label className="form-label">Confirm 4-Digit PIN</label>
                <input
                  type="password"
                  className="form-input"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • •"
                  style={{
                    textAlign: 'center',
                    fontSize: '28px',
                    letterSpacing: '12px',
                    padding: '8px',
                  }}
                  required
                />
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In with PIN'}
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '14px', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setIsRateLimited(false);
                  setPin('');
                  setConfirmPin('');
                }}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                {isSignUp ? 'Already registered? Sign In' : 'New patient? Register'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/select-role')}
                style={{ color: 'var(--outline)' }}
              >
                Switch Role
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
