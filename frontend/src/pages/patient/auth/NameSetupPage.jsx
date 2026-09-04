import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateProfile } from '@/services/auth';
import { updatePatientSettings } from '@/services/patients';

export default function NameSetupPage() {
  const navigate = useNavigate();
  const { user, profile, patientRecord } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(profile?.full_name || '');
  const [language, setLanguage] = useState('English');
  const [saving, setSaving] = useState(false);

  const nerLanguages = [
    'English',
    'Hindi (हिंदी)',
    'Assamese (অসমীয়া)',
    'Boro (বর\' / Bodo)',
    'Tripuri / Kokborok (কোকবোরোক)',
    'Manipuri / Meitei (মৈতৈলোন্)',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (user?.id) {
        await updateProfile(user.id, { full_name: name.trim() });
      }
      if (patientRecord?.id) {
        await updatePatientSettings(patientRecord.id, { language });
      }
      showToast('Profile setup complete!');
      navigate('/patient/home', { replace: true });
    } catch {
      showToast('Failed to save profile. Continuing to home...');
      navigate('/patient/home', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Card style={{ padding: '32px 28px' }}>
          <h1 className="headline-md" style={{ marginBottom: 8, fontSize: '24px' }}>What is your name?</h1>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: '15px' }}>
            Personalize your daily reminders and preferences.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Language Preference (NER &amp; National)</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select"
              >
                {nerLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
              {saving ? 'Saving...' : 'Continue to App'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
