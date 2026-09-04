import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function GameInstructionsPage() {
  const navigate = useNavigate();

  return (
    <AppLayout mode="patient">
      <TopBar title="How to Play" />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <Card style={{ maxWidth: '520px', width: '100%', padding: '32px 24px' }}>
          <h2 className="headline-md" style={{ marginBottom: 20, fontSize: '24px' }}>How the Game Works</h2>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              <p className="body-md" style={{ fontSize: '15px' }}>Look carefully at the family photo shown on your screen.</p>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              <p className="body-md" style={{ fontSize: '15px' }}>Tap or say the person&apos;s name out loud using your voice microphone.</p>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              <p className="body-md" style={{ fontSize: '15px' }}>Complete up to 5 rounds. Your progress is automatically recorded for your caretaker.</p>
            </div>
          </div>

          <Button variant="primary" onClick={() => navigate('/patient/games/countdown')} style={{ width: '100%' }}>
            Got it, Let&apos;s Go!
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
