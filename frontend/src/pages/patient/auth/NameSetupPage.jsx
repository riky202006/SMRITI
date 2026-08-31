import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';

export default function NameSetupPage() {
  const navigate = useNavigate();
  const { appData, updatePatientName, setAppData } = useAppData();
  const [name, setName] = useState(appData.patientName || '');
  const [language, setLanguage] = useState(appData.language || 'English');

  const nerLanguages = [
    'English',
    'Hindi (हिंदी)',
    'Assamese (অসমীয়া)',
    'Boro (বর\' / Bodo)',
    'Tripuri / Kokborok (কোকবোরোক)',
    'Manipuri / Meitei (মৈতৈলোন্)',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      updatePatientName(name.trim());
      setAppData((prev) => ({ ...prev, language }));
      navigate('/patient/home');
    }
  };

  return (
    <div style={{ padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <Card>
        <h1 className="headline-md" style={{ marginBottom: 8 }}>What is your name?</h1>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20 }}>
          Personalize your daily reminders and preferences.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Your Name</label>
          <input
            type="text"
            className="body-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--outline-variant)',
              marginBottom: 20,
              outline: 'none',
            }}
            required
          />

          <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Language Preference (NER & National)</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--outline-variant)',
              fontSize: '18px',
              backgroundColor: 'var(--surface-container-lowest)',
              marginBottom: 24,
              outline: 'none',
            }}
          >
            {nerLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <Button type="submit" variant="primary">
            Continue to App
          </Button>
        </form>
      </Card>
    </div>
  );
}
