import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';

export default function NameSetupPage() {
  const navigate = useNavigate();
  const { appData, updateCaretakerName } = useAppData();
  const [name, setName] = useState(appData.caretakerName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      updateCaretakerName(name.trim());
      navigate('/caretaker/dashboard');
    }
  };

  return (
    <div style={{ padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <Card>
        <h1 className="headline-md" style={{ marginBottom: 12 }}>Caretaker Name</h1>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24 }}>
          Enter your name to set up the caretaker control dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="body-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Caretaker Full Name"
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--outline-variant)',
              marginBottom: 24,
              outline: 'none',
            }}
            required
          />

          <Button type="submit" variant="primary">
            Enter Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
