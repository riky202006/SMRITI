import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateProfile } from '@/services/auth';

export default function NameSetupPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (user?.id) {
        await updateProfile(user.id, { full_name: name.trim() });
      }
      showToast('Caretaker name saved!');
      navigate('/caretaker/dashboard', { replace: true });
    } catch {
      showToast('Failed to save name. Continuing to dashboard...');
      navigate('/caretaker/dashboard', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Card style={{ padding: '32px 28px' }}>
          <h1 className="headline-md" style={{ marginBottom: 8, fontSize: '24px' }}>Caretaker Profile Setup</h1>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: '15px' }}>
            Enter your name to set up the caretaker control dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Anita Sharma"
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
              {saving ? 'Saving...' : 'Enter Dashboard'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
