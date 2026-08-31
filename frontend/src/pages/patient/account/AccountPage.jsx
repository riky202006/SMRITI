import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconUser, IconPhone } from '@/components/icons';

export default function AccountPage() {
  const navigate = useNavigate();
  const { appData, setAppData, showToast } = useAppData();
  const [selectedLang, setSelectedLang] = useState(appData.language || 'English');

  const nerLanguages = [
    { label: 'English', code: 'en' },
    { label: 'Hindi (हिंदी)', code: 'hi' },
    { label: 'Assamese (অসমীয়া)', code: 'as' },
    { label: 'Boro (বর\' / Bodo)', code: 'brx' },
    { label: 'Tripuri / Kokborok (কোকবোরোক)', code: 'trp' },
    { label: 'Manipuri / Meitei (মৈতৈলোন্)', code: 'mni' },
  ];

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setSelectedLang(val);
    setAppData((prev) => ({ ...prev, language: val }));
    showToast(`Language preference selected: ${val}`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="My Profile & Settings" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ textAlign: 'center', padding: 24, marginBottom: 20 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconUser size={36} />
          </div>
          <h2 className="headline-md">{appData.patientName}</h2>
          <p className="body-md" style={{ color: 'var(--outline)' }}>{appData.patientPhone || '+91 9876543210'}</p>
        </Card>

        {/* NER Regional Language Preference Dropdown */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 8 }}>Language Preference</h3>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 12 }}>
            Select your preferred regional language (North-East Region & National):
          </p>

          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--primary)',
              fontSize: '18px',
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

        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 12 }}>Caretaker Info</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconPhone size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="label-lg">{appData.caretakerName || 'Anita Sharma'}</p>
              <p className="body-md" style={{ color: 'var(--outline)' }}>{appData.caretakerPhone || '+91 9876543211'}</p>
            </div>
          </div>
        </Card>

        <Button variant="outline" onClick={() => navigate('/')}>
          Switch User Role
        </Button>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
