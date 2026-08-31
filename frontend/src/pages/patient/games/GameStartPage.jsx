import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconGamepad } from '@/components/icons';

export default function GameStartPage() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Face Recognition Game" />

      <div style={{ flex: 1, padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <Card style={{ padding: 32 }}>
          <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <IconGamepad size={36} />
          </div>
          <h2 className="headline-md" style={{ marginBottom: 8 }}>Memory Challenge</h2>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24 }}>
            Recognize your family members and loved ones to boost your memory streak.
          </p>

          <Button variant="primary" onClick={() => navigate('/patient/games/instructions')}>
            Start Challenge
          </Button>
        </Card>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
