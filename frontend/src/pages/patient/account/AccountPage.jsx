import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedCaretakersForPatient, getPatientSettings, updatePatientSettings } from '@/services/patients';
import { IconUser, IconPhone } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, profile, patientRecord, logout } = useAuth();
  const { showToast } = useToast();

  const [selectedLang, setSelectedLang] = useState('English');
  const [loggingOut, setLoggingOut] = useState(false);
  const [caretakers, setCaretakers] = useState([]);
  const [loadingCaretakers, setLoadingCaretakers] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const patientId = patientRecord?.id || '';
  const connectionCode = patientRecord?.connection_code || patientId;

  const nerLanguages = [
    { label: 'English', code: 'en' },
    { label: 'Hindi (हिंदी)', code: 'hi' },
    { label: 'Assamese (অসমীয়া)', code: 'as' },
    { label: 'Boro (বর\' / Bodo)', code: 'brx' },
    { label: 'Tripuri / Kokborok (কোকবোরোক)', code: 'trp' },
    { label: 'Manipuri / Meitei (মৈতৈলোন্)', code: 'mni' },
  ];

  // Load patient settings & connected caretakers from Supabase
  useEffect(() => {
    if (patientId) {
      setLoadingCaretakers(true);
      getAssignedCaretakersForPatient(patientId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCaretakers(data);
          }
        })
        .finally(() => {
          setLoadingCaretakers(false);
        });

      getPatientSettings(patientId).then(({ data }) => {
        if (data?.language) {
          setSelectedLang(data.language);
        }
      });
    }
  }, [patientId]);

  const handleCopyCode = () => {
    if (!connectionCode) return;
    navigator.clipboard.writeText(connectionCode);
    setCopiedCode(true);
    showToast('Patient Connection Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleLanguageChange = async (e) => {
    const val = e.target.value;
    setSelectedLang(val);
    if (patientId) {
      await updatePatientSettings(patientId, { language: val });
    }
    showToast(`Language preference saved: ${val}`);
  };

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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Patient User';
  const displayEmailOrPhone = user?.email || profile?.phone || 'No contact specified';

  return (
    <AppLayout mode="patient">
      <TopBar title="My Profile & Settings" />

      <div style={{ maxWidth: '640px', width: '100%', margin: '8px auto 0' }}>
        <Card style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 20 }}>
          <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={40} />
          </div>
          <h2 className="headline-md" style={{ fontSize: '24px', margin: '0 0 6px' }}>{displayName}</h2>
          <p className="body-md" style={{ color: 'var(--outline)', margin: 0 }}>{displayEmailOrPhone}</p>
        </Card>

        {/* Patient Connection Code Card */}
        <Card style={{ marginBottom: 20, backgroundColor: 'var(--mint-soft)', border: '1.5px solid var(--primary)' }}>
          <h3 className="label-lg" style={{ color: 'var(--primary)', marginBottom: 6, letterSpacing: '0.5px' }}>
            PATIENT CONNECTION CODE
          </h3>
          <p className="body-md" style={{ color: 'var(--on-surface)', fontSize: '14px', marginBottom: 12 }}>
            Share this short code with your caretaker or family member to link accounts:
          </p>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--primary)',
              fontFamily: 'monospace',
              fontSize: '20px',
              letterSpacing: '2px',
              color: 'var(--primary)',
              fontWeight: 800,
              marginBottom: 12,
              textAlign: 'center',
              userSelect: 'all',
            }}
          >
            {connectionCode || 'Generating connection code...'}
          </div>

          <Button
            variant="primary"
            onClick={handleCopyCode}
            disabled={!connectionCode}
            style={{ width: '100%', fontSize: '15px' }}
          >
            {copiedCode ? '✓ Copied to Clipboard' : '📋 Copy Connection Code'}
          </Button>
        </Card>

        {/* Connected Caretakers Card */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 14, fontSize: '18px' }}>Connected Caregiver</h3>

          {loadingCaretakers ? (
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading caregiver status...</p>
          ) : caretakers.length > 0 ? (
            caretakers.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
                    <IconPhone size={22} />
                  </div>
                  <div>
                    <p className="label-lg" style={{ fontSize: '16px', margin: 0 }}>{c.caretaker?.full_name || 'Assigned Caretaker'}</p>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: '2px 0 0' }}>
                      {c.relationship || 'Caregiver'} • {c.caretaker?.phone || 'Connected'}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  Active
                </span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--surface-container)', color: 'var(--outline)' }}>
                <IconPhone size={22} />
              </div>
              <div>
                <p className="label-lg" style={{ color: 'var(--outline)', margin: 0 }}>No Caretaker Connected</p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: '2px 0 0' }}>
                  Share your connection code above with your caretaker.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Language Preference Dropdown */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 8, fontSize: '18px' }}>Language Preference</h3>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 14, fontSize: '14px' }}>
            Regional North-East &amp; National languages:
          </p>

          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            className="form-select"
            style={{ fontWeight: 600, fontSize: '15px' }}
          >
            {nerLanguages.map((lang) => (
              <option key={lang.code} value={lang.label}>
                {lang.label}
              </option>
            ))}
          </select>
        </Card>

        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <Button variant="danger" onClick={handleLogout} disabled={loggingOut} style={{ width: '100%' }}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
