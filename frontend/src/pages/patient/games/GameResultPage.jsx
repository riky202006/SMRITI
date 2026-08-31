import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconCheck, IconHeart } from '@/components/icons';

export default function GameResultPage() {
  const navigate = useNavigate();
  const { appData } = useAppData();

  const report = appData.latestReport || {
    totalRounds: 5,
    correctCount: 4,
    accuracy: 80,
    score: 40,
    summary: 'Recognized 4 of 5 family members correctly (80% accuracy).',
    rounds: [],
  };

  const total = report.totalRounds || 5;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={`${total}-Round Challenge Complete`} />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto', textAlign: 'center' }}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconCheck size={36} />
          </div>
          <h1 className="headline-md" style={{ marginBottom: 4 }}>Great Job! 🎉</h1>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
            You completed all {total} rounds of the memory challenge!
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
            <div>
              <p className="headline-md" style={{ color: 'var(--primary)' }}>{report.accuracy}%</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>Accuracy</p>
            </div>
            <div>
              <p className="headline-md" style={{ color: 'var(--secondary)' }}>{report.correctCount}/{total}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>Correct</p>
            </div>
            <div>
              <p className="headline-md" style={{ color: '#2e7d32' }}>+{report.score}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>Points</p>
            </div>
          </div>

          {/* Caretaker Report Confirmation Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 'var(--radius-pill)', backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>
            <IconHeart size={20} />
            Report &amp; Analytics sent to Caretaker!
          </div>
        </Card>

        {/* Round Breakdown */}
        {report.rounds && report.rounds.length > 0 && (
          <Card style={{ textAlign: 'left', marginBottom: 20 }}>
            <h3 className="label-lg" style={{ marginBottom: 12, textAlign: 'left' }}>
              {total}-ROUND PERFORMANCE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.rounds.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: r.isCorrect ? 'var(--mint-soft)' : 'var(--error-container)',
                    fontSize: 14,
                  }}
                >
                  <span>Round {r.round}: {r.targetName}</span>
                  <span style={{ fontWeight: 700, color: r.isCorrect ? 'var(--primary)' : 'var(--error)' }}>
                    {r.isCorrect ? '✓ Correct' : `✗ (${r.chosenName})`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="primary" onClick={() => navigate('/patient/games/countdown')}>
            Play New Rounds
          </Button>
          <Button variant="outline" onClick={() => navigate('/patient/home')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
