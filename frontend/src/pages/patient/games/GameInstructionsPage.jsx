import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function GameInstructionsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Instructions" />

      <div style={{ flex: 1, padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Card style={{ padding: 24 }}>
          <h2 className="headline-md" style={{ marginBottom: 16 }}>How to Play</h2>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ padding: '4px 10px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700 }}>1</span>
              <p className="body-md">Look carefully at the family photo shown on screen.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ padding: '4px 10px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700 }}>2</span>
              <p className="body-md">Tap the correct name of the person from the options provided.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ padding: '4px 10px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700 }}>3</span>
              <p className="body-md">Take your time and enjoy remembering fond memories!</p>
            </div>
          </div>

          <Button variant="primary" onClick={() => navigate('/patient/games/countdown')}>
            Got it, Let's Go!
          </Button>
        </Card>
      </div>
    </div>
  );
}
