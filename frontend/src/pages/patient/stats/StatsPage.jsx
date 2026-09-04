import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useMemorySessions } from '@/hooks/useMemorySessions';
import { IconStats, IconGamepad } from '@/components/icons';

export default function StatsPage() {
  const { patientRecord } = useAuth();
  const patientId = patientRecord?.id;

  const { stats, sessions, loading, error } = useMemorySessions(patientId, 15);

  return (
    <AppLayout mode="patient">
      <TopBar title="Cognitive Progress" />

      <div style={{ marginTop: 8 }}>
        <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', textAlign: 'center', padding: '28px 20px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--mint-soft)', marginBottom: 12 }}>
            <IconStats size={40} />
          </div>
          <h2 className="headline-lg" style={{ color: 'var(--white)', fontSize: '24px', margin: 0 }}>Cognitive Health Summary</h2>
          <p className="body-md" style={{ color: 'var(--mint-soft)', marginTop: 6, fontSize: '15px' }}>
            Daily practice strengthens brain health and preserves happy memories.
          </p>
        </Card>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              fontSize: '14px',
              margin: '16px 0',
            }}
          >
            {error.message || 'Error loading statistics.'}
          </div>
        )}

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '36px 20px', marginTop: 20 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cognitive metrics...</p>
          </Card>
        ) : (
          <>
            {/* Stat Counters Responsive Grid */}
            <div className="grid-responsive-3" style={{ marginTop: 20 }}>
              <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                <p className="headline-md" style={{ color: 'var(--primary)', fontSize: '32px', fontWeight: 800 }}>
                  {stats.totalSessions}
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Total Sessions</p>
              </Card>

              <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                <p className="headline-md" style={{ color: 'var(--secondary)', fontSize: '32px', fontWeight: 800 }}>
                  {stats.avgAccuracy}%
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Avg Accuracy</p>
              </Card>

              <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
                <p className="headline-md" style={{ color: '#2e7d32', fontSize: '32px', fontWeight: 800 }}>
                  +{stats.totalScore}
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Total Points</p>
              </Card>
            </div>

            <h3 className="label-lg" style={{ marginTop: 28, marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
              RECENT CHALLENGE HISTORY
            </h3>

            {sessions.length === 0 ? (
              <Card className="empty-state-card">
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧠</div>
                <h4 style={{ fontSize: 17, fontWeight: 700 }}>No Games Completed Yet</h4>
                <p>Play a memory game to track your accuracy and progress over time!</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.map((sess) => (
                  <Card key={sess.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <IconGamepad size={22} style={{ color: 'var(--primary)' }} />
                        <span className="headline-sm" style={{ fontSize: 16 }}>
                          {sess.summary?.includes('Caretaker Observation') ? 'Caretaker Note' : 'Memory Challenge'}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--outline)', fontWeight: 600 }}>
                        {new Date(sess.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="body-md" style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.4 }}>
                      {sess.summary}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 13, borderTop: '1px solid var(--surface-container)', paddingTop: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Accuracy: {sess.accuracy}%</span>
                      <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>Correct: {sess.correct_count}/{sess.total_rounds}</span>
                      <span style={{ fontWeight: 700, color: '#2e7d32' }}>Score: +{sess.score}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
