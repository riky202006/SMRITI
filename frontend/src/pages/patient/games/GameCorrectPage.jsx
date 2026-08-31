import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconCheck } from '@/components/icons';

export default function GameCorrectPage() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--gutter)', justifyContent: 'center' }}>
      <Card style={{ textAlign: 'center', padding: 32, backgroundColor: 'var(--mint-soft)' }}>
        <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCheck size={48} />
        </div>
        <h1 className="headline-md" style={{ color: 'var(--primary)', marginBottom: 8 }}>Correct! 🎉</h1>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>
          Great memory! You recognized your family member correctly.
        </p>

        <Button variant="primary" onClick={() => navigate('/patient/games/result')}>
          View Game Result
        </Button>
      </Card>
    </div>
  );
}
