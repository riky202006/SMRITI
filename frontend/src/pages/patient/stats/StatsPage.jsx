import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';
import { IconStats, IconGamepad } from '@/components/icons';

export default function StatsPage() {
  const { appData } = useAppData();
  const stats = appData.stats || { games: 4, score: 30, correct: 3 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Cognitive Progress" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', textAlign: 'center', padding: 24 }}>
          <IconStats size={48} style={{ color: 'var(--mint-soft)', marginBottom: 8 }} />
          <h2 className="headline-lg" style={{ color: 'var(--white)' }}>Weekly Summary</h2>
          <p className="body-md" style={{ color: 'var(--mint-soft)', marginTop: 4 }}>
            Consistency is key to maintaining mental sharpness!
          </p>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <Card style={{ textAlign: 'center' }}>
            <p className="headline-lg" style={{ color: 'var(--primary)' }}>{stats.games || 0}</p>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Games Played</p>
          </Card>

          <Card style={{ textAlign: 'center' }}>
            <p className="headline-lg" style={{ color: 'var(--secondary)' }}>{stats.score || 0}</p>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Total Score</p>
          </Card>
        </div>

        <Card style={{ marginTop: 16 }}>
          <h3 className="headline-sm" style={{ marginBottom: 12 }}>Memory Streaks</h3>
          <p className="body-md" style={{ color: 'var(--outline)' }}>
            🔥 5-Day Active Practice Streak! Keep playing daily to maintain your record.
          </p>
        </Card>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
