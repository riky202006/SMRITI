import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconGamepad } from '@/components/icons';

export default function GameStartPage() {
  const navigate = useNavigate();

  return (
    <AppLayout mode="patient">
      <TopBar title="Face Recognition Game" />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <Card style={{ maxWidth: '480px', width: '100%', padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <IconGamepad size={40} />
          </div>
          <h2 className="headline-md" style={{ marginBottom: 8, fontSize: '24px' }}>Memory Challenge</h2>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 28, fontSize: '15px' }}>
            Recognize your family members and loved ones to practice memory recall and strengthen cognitive health.
          </p>

          <Button variant="primary" onClick={() => navigate('/patient/games/instructions')} style={{ width: '100%' }}>
            Start Memory Challenge
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}
