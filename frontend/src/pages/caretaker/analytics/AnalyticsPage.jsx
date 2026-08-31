import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MemoryActivityChart from '@/components/charts/MemoryActivityChart';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import { getMemorySessions, saveMemorySession, subscribeToMemorySessions } from '@/services/analytics';
import { IconStats, IconGamepad, IconDocument } from '@/components/icons';

export default function AnalyticsPage() {
  const { showToast } = useAppData();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [customAccuracy, setCustomAccuracy] = useState('80');
  const [customNotes, setCustomNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // 1. Fetch assigned patient
  useEffect(() => {
    if (user?.id) {
      setLoadingPatient(true);
      getAssignedPatients(user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPatient(data[0]);
          } else {
            setPatient(null);
          }
        })
        .finally(() => {
          setLoadingPatient(false);
        });
    }
  }, [user?.id]);

  const patientId = patient?.patient_id;
  const patientName = patient?.patient?.profiles?.full_name || 'Assigned Patient';

  // 2. Fetch memory game sessions
  const loadSessions = useCallback(() => {
    if (!patientId) return;
    setLoadingSessions(true);

    getMemorySessions(patientId, 30)
      .then(({ data }) => {
        setSessions(data || []);
      })
      .finally(() => {
        setLoadingSessions(false);
      });
  }, [patientId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 3. Realtime subscription
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToMemorySessions(patientId, () => {
      loadSessions();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, loadSessions]);

  // 4. Handle Caretaker Manual Memory Note
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!customNotes || !patientId) return;

    setSavingNote(true);
    const acc = Math.min(100, Math.max(0, parseInt(customAccuracy, 10) || 80));
    const correctCount = Math.round((acc / 100) * 5);
    const score = correctCount * 10;

    try {
      const { error } = await saveMemorySession({
        patientId,
        totalRounds: 5,
        correctCount,
        accuracy: acc,
        score,
        summary: `[Caretaker Observation] ${customNotes.trim()}`,
      });

      if (error) {
        showToast('Failed to save report: ' + error.message);
      } else {
        showToast('Patient memory report recorded in cloud!');
        setCustomNotes('');
        setShowAddForm(false);
        loadSessions();
      }
    } catch {
      showToast('Error saving memory note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Format data for chart
  const chartReports = sessions.map((s) => ({
    id: s.id,
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: Number(s.accuracy) || 0,
    score: s.score || 0,
    correctCount: s.correct_count || 0,
    totalRounds: s.total_rounds || 5,
  }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Cognitive & Game Analytics" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient analytics...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to access cognitive session analytics.
            </p>
          </Card>
        ) : (
          <>
            {/* Banner */}
            <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <IconStats size={28} style={{ color: 'var(--mint-soft)' }} />
                <h2 className="headline-md" style={{ color: 'var(--white)', margin: 0 }}>
                  {patientName}&apos;s Cognitive Activity
                </h2>
              </div>
              <p className="body-md" style={{ color: 'var(--mint-soft)', margin: 0, fontSize: 13 }}>
                Track cognitive health trends, accuracy curves, and round performance across memory challenges.
              </p>
            </Card>

            {/* Chart View */}
            <div style={{ marginBottom: 20 }}>
              <MemoryActivityChart reports={chartReports} />
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0 }}>
                MEMORY LOGS ({sessions.length})
              </h3>
              <Button
                variant={showAddForm ? 'secondary' : 'outline'}
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                {showAddForm ? 'Cancel Report' : '+ Create Caretaker Note'}
              </Button>
            </div>

            {/* Caretaker Manual Memory Observation Report Form */}
            {showAddForm && (
              <Card style={{ marginBottom: 16, border: '2px solid var(--primary)', backgroundColor: 'var(--mint-soft)' }}>
                <h4 className="headline-sm" style={{ margin: '0 0 12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconDocument size={20} /> Create Patient Memory Report Entry
                </h4>
                <form onSubmit={handleCreateReport}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Estimated Accuracy (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customAccuracy}
                    onChange={(e) => setCustomAccuracy(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
                    required
                  />

                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Caretaker Notes &amp; Patient Response Observation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Patient recognized daughter Anita in 3s, took longer with Sanjay..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
                    required
                  />

                  <Button type="submit" variant="primary" disabled={savingNote}>
                    {savingNote ? 'Saving to Cloud...' : 'Save & Add to Analytics Chart'}
                  </Button>
                </form>
              </Card>
            )}

            {/* List of Reports */}
            {loadingSessions ? (
              <Card style={{ textAlign: 'center', padding: 20 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cloud session history...</p>
              </Card>
            ) : sessions.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <h4 className="headline-sm" style={{ marginBottom: 4 }}>No Game Sessions Recorded</h4>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13 }}>
                  When {patientName} completes memory games, their scores and accuracy logs will appear here.
                </p>
              </Card>
            ) : (
              sessions.map((sess) => (
                <Card key={sess.id} style={{ marginBottom: 12, borderLeft: '6px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconGamepad size={22} style={{ color: 'var(--primary)' }} />
                      <span className="headline-sm" style={{ fontSize: 16 }}>
                        {sess.summary?.includes('Caretaker Observation') ? 'Caretaker Note' : 'Memory Game Session'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 600 }}>
                      {new Date(sess.created_at).toLocaleDateString()} at{' '}
                      {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="body-md" style={{ marginBottom: 10, fontSize: 14 }}>{sess.summary}</p>

                  <div style={{ display: 'flex', gap: 16, backgroundColor: 'var(--surface-container-low)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <p className="label-lg" style={{ color: 'var(--primary)', margin: 0 }}>{sess.accuracy}%</p>
                      <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Accuracy</p>
                    </div>
                    <div>
                      <p className="label-lg" style={{ color: 'var(--secondary)', margin: 0 }}>{sess.correct_count}/{sess.total_rounds || 5}</p>
                      <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Rounds Won</p>
                    </div>
                    <div>
                      <p className="label-lg" style={{ color: '#2e7d32', margin: 0 }}>+{sess.score}</p>
                      <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Points</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
