import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedCaretakersForPatient } from '@/services/patients';
import { IconUser, IconPhone } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { appData, setAppData, showToast } = useAppData();
  const { user, profile, patientRecord, logout } = useAuth();
  const [selectedLang, setSelectedLang] = useState(appData.language || 'English');
  const [loggingOut, setLoggingOut] = useState(false);
  const [caretakers, setCaretakers] = useState([]);
  const [loadingCaretakers, setLoadingCaretakers] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const nerLanguages = [
    { label: 'English', code: 'en' },
    { label: 'Hindi (हिंदी)', code: 'hi' },
    { label: 'Assamese (অসমীয়া)', code: 'as' },
    { label: 'Boro (বর\' / Bodo)', code: 'brx' },
    { label: 'Tripuri / Kokborok (কোকবোরোক)', code: 'trp' },
    { label: 'Manipuri / Meitei (মৈতৈলোন্)', code: 'mni' },
  ];

  const patientCode = patientRecord?.id || '';

  // Load connected caretakers from Supabase
  useEffect(() => {
    if (patientRecord?.id) {
      setLoadingCaretakers(true);
      getAssignedCaretakersForPatient(patientRecord.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCaretakers(data);
          }
        })
        .finally(() => {
          setLoadingCaretakers(false);
        });
    }
  }, [patientRecord?.id]);

  const handleCopyCode = () => {
    if (!patientCode) return;
    navigator.clipboard.writeText(patientCode);
    setCopiedCode(true);
    showToast('Patient Connection Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setSelectedLang(val);
    setAppData((prev) => ({ ...prev, language: val }));
    showToast(`Language preference selected: ${val}`);
  };

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

  const displayName = profile?.full_name || appData.patientName || 'Ravi Kumar';
  const displayEmailOrPhone = user?.email || profile?.phone || appData.patientPhone || '+91 9876543210';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="My Profile & Settings" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={36} />
          </div>
          <h2 className="headline-md">{displayName}</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>{displayEmailOrPhone}</p>
        </Card>

        {/* Patient Connection Code Card */}
        <Card style={{ marginBottom: 16, backgroundColor: 'var(--mint-soft)', border: '1.5px solid var(--primary)' }}>
          <h3 className="label-lg" style={{ color: 'var(--primary)', marginBottom: 4 }}>
            PATIENT CONNECTION CODE
          </h3>
          <p className="body-md" style={{ color: 'var(--on-surface)', fontSize: '13px', marginBottom: 10 }}>
            Share this code with your caretaker or family member to link accounts:
          </p>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--primary)',
              fontFamily: 'monospace',
              fontSize: '13px',
              wordBreak: 'break-all',
              color: 'var(--ink)',
              fontWeight: 600,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            {patientCode || 'Generating connection code...'}
          </div>

          <Button
            variant="primary"
            onClick={handleCopyCode}
            disabled={!patientCode}
            style={{ width: '100%', fontSize: '14px', padding: '8px 16px' }}
          >
            {copiedCode ? '✓ Copied to Clipboard' : '📋 Copy Connection Code'}
          </Button>
        </Card>

        {/* Connected Caretakers Card */}
        <Card style={{ marginBottom: 16 }}>
          <h3 className="headline-sm" style={{ marginBottom: 12 }}>Connected Caretaker</h3>

          {loadingCaretakers ? (
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading caretaker status...</p>
          ) : caretakers.length > 0 ? (
            caretakers.map((c) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconPhone size={24} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="label-lg">{c.caretaker?.full_name || 'Assigned Caretaker'}</p>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px' }}>
                      {c.relationship || 'Caregiver'} • {c.caretaker?.phone || 'Connected'}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Active
                </span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconPhone size={24} style={{ color: 'var(--outline)' }} />
              <div>
                <p className="label-lg" style={{ color: 'var(--outline)' }}>No Caretaker Connected</p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px' }}>
                  Share your connection code above with your caretaker.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Language Preference Dropdown */}
        <Card style={{ marginBottom: 16 }}>
          <h3 className="headline-sm" style={{ marginBottom: 8 }}>Language Preference</h3>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 12, fontSize: '13px' }}>
            Regional North-East & National languages:
          </p>

          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--primary)',
              fontSize: '16px',
              fontFamily: 'inherit',
              backgroundColor: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {nerLanguages.map((lang) => (
              <option key={lang.code} value={lang.label}>
                {lang.label}
              </option>
            ))}
          </select>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <Button variant="danger" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Button>

          <Button variant="outline" onClick={() => navigate('/')}>
            Switch User Role
          </Button>
        </div>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
