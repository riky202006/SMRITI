import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId } from '@/services/patients';
import { getPatientStats, getMemorySessions, subscribeToMemorySessions } from '@/services/analytics';
import { IconStats, IconGamepad } from '@/components/icons';

export default function StatsPage() {
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
  const [stats, setStats] = useState({ totalSessions: 0, avgAccuracy: 0, totalScore: 0 });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Resolve patient ID
  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) setPatientId(data.id);
      });
    }
  }, [patientRecord?.id, user?.id]);

  // 2. Fetch stats and recent sessions
  const loadData = useCallback(() => {
    if (!patientId) return;
    setLoading(true);

    Promise.all([getPatientStats(patientId), getMemorySessions(patientId, 10)])
      .then(([statsRes, sessRes]) => {
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (sessRes.data) {
          setSessions(sessRes.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 3. Realtime subscription
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToMemorySessions(patientId, () => {
      loadData();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, loadData]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Cognitive Progress" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', textAlign: 'center', padding: 24 }}>
          <IconStats size={48} style={{ color: 'var(--mint-soft)', marginBottom: 8 }} />
          <h2 className="headline-lg" style={{ color: 'var(--white)' }}>Cognitive Health Summary</h2>
          <p className="body-md" style={{ color: 'var(--mint-soft)', marginTop: 4 }}>
            Consistency is key to maintaining mental sharpness!
          </p>
        </Card>

        {loading ? (
          <Card style={{ textAlign: 'center', padding: 24, marginTop: 16 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cognitive metrics...</p>
          </Card>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
              <Card style={{ textAlign: 'center', padding: 12 }}>
                <p className="headline-md" style={{ color: 'var(--primary)', fontSize: 22 }}>
                  {stats.totalSessions}
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 12 }}>Games</p>
              </Card>

              <Card style={{ textAlign: 'center', padding: 12 }}>
                <p className="headline-md" style={{ color: 'var(--secondary)', fontSize: 22 }}>
                  {stats.avgAccuracy}%
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 12 }}>Avg Accuracy</p>
              </Card>

              <Card style={{ textAlign: 'center', padding: 12 }}>
                <p className="headline-md" style={{ color: '#2e7d32', fontSize: 22 }}>
                  {stats.totalScore}
                </p>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 12 }}>Score</p>
              </Card>
            </div>

            <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, color: 'var(--outline)' }}>
              RECENT CHALLENGE HISTORY
            </h3>

            {sessions.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 20 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>
                  No games played yet. Play a memory game to track your progress!
                </p>
              </Card>
            ) : (
              sessions.map((sess) => (
                <Card key={sess.id} style={{ marginBottom: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconGamepad size={20} style={{ color: 'var(--primary)' }} />
                      <span className="headline-sm" style={{ fontSize: 15 }}>
                        {sess.summary?.includes('Caretaker Observation') ? 'Caretaker Note' : 'Memory Challenge'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--outline)' }}>
                      {new Date(sess.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="body-md" style={{ fontSize: 13, color: 'var(--outline)', marginBottom: 8 }}>
                    {sess.summary}
                  </p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Accuracy: {sess.accuracy}%</span>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>Correct: {sess.correct_count}/{sess.total_rounds}</span>
                    <span style={{ fontWeight: 700, color: '#2e7d32' }}>Score: +{sess.score}</span>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
