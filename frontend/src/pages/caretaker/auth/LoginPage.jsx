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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const formatErrorMessage = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;

    if (err.code === 'over_email_send_rate_limit' || err.status === 429) {
      setIsRateLimited(true);
      return 'Email rate limit reached on Supabase. If you already registered this account, please click "Sign In" below.';
    }

    if (err.isExistingUser || err.code === 'user_already_exists') {
      return 'This account is already registered. Please sign in below.';
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

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    // Client-side confirmation validation for registration
    if (isSignUp) {
      if (!confirmPassword) {
        setErrorMsg('Please confirm your password.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please ensure both passwords are identical.');
        return;
      }
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
          showToast('Caretaker account created successfully!');
          navigate('/caretaker/dashboard', { replace: true });
        }
      } else {
        const { user, error } = await login({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMsg(formatErrorMessage(error));
          return;
        }

        if (user) {
          showToast('Welcome to Caretaker Portal');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Card style={{ padding: '32px 28px' }}>
          <h1 className="headline-md" style={{ marginBottom: 8, fontSize: '24px' }}>
            {isSignUp ? 'Caretaker Registration' : 'Caretaker Portal Login'}
          </h1>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: '15px' }}>
            {isSignUp
              ? 'Create an account to monitor patients, prescriptions, live GPS & safety.'
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
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Anita Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. caretaker@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Authenticating...' : isSignUp ? 'Create Caretaker Account' : 'Sign In'}
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '14px', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setIsRateLimited(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                {isSignUp ? 'Already registered? Sign In' : 'New caretaker? Register'}
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
