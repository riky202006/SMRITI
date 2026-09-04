import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MemoryActivityChart from '@/components/charts/MemoryActivityChart';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients } from '@/services/patients';
import { useMemorySessions } from '@/hooks/useMemorySessions';
import { IconStats, IconGamepad, IconDocument } from '@/components/icons';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

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

  const {
    sessions,
    loading: loadingSessions,
    error: sessionsError,
    recordSession,
  } = useMemorySessions(patientId, 30);

  // 4. Handle Caretaker Manual Memory Note
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!customNotes || !patientId) return;

    setSavingNote(true);
    const acc = Math.min(100, Math.max(0, parseInt(customAccuracy, 10) || 80));
    const correctCount = Math.round((acc / 100) * 5);
    const score = correctCount * 10;

    try {
      const { error } = await recordSession({
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
      }
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
    summary: s.summary,
    timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Cognitive & Game Analytics" />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient analytics...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to access cognitive session analytics.
            </p>
          </Card>
        ) : (
          <>
            {/* Banner */}
            <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', padding: '24px', marginBottom: 20, borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <IconStats size={30} style={{ color: 'var(--mint-soft)' }} />
                <h2 className="headline-md" style={{ color: 'var(--white)', margin: 0, fontSize: '22px' }}>
                  {patientName}&apos;s Cognitive Activity
                </h2>
              </div>
              <p className="body-md" style={{ color: 'var(--mint-soft)', margin: 0, fontSize: '14px' }}>
                Track cognitive health trends, accuracy curves, and round performance across memory challenges.
              </p>
            </Card>

            {sessionsError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '14px',
                  marginBottom: 16,
                }}
              >
                {sessionsError.message || 'Error loading cognitive analytics.'}
              </div>
            )}

            {/* Chart View */}
            <div style={{ marginBottom: 24 }}>
              <MemoryActivityChart reports={chartReports} />
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0, letterSpacing: '0.5px' }}>
                MEMORY LOGS &amp; SESSIONS ({sessions.length})
              </h3>
              <Button
                variant={showAddForm ? 'secondary' : 'outline'}
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ fontSize: 13, padding: '6px 14px' }}
              >
                {showAddForm ? 'Cancel Note' : '+ Add Clinical Observation'}
              </Button>
            </div>

            {/* Caretaker Manual Memory Observation Report Form */}
            {showAddForm && (
              <Card style={{ marginBottom: 20, border: '2px solid var(--primary)', backgroundColor: 'var(--mint-soft)', padding: '24px' }}>
                <h4 className="headline-sm" style={{ margin: '0 0 14px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '18px' }}>
                  <IconDocument size={22} /> Record Caregiver Memory Observation
                </h4>
                <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Estimated Memory Recall Accuracy (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={customAccuracy}
                      onChange={(e) => setCustomAccuracy(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Notes &amp; Patient Response Observation</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="e.g. Patient recognized daughter Anita in 3s, took longer with Sanjay..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={savingNote} style={{ width: '100%' }}>
                    {savingNote ? 'Saving to Cloud...' : 'Save & Sync to Analytics Chart'}
                  </Button>
                </form>
              </Card>
            )}

            {/* List of Reports */}
            {loadingSessions ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <div className="spinner" />
                <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cloud session history...</p>
              </Card>
            ) : sessions.length === 0 ? (
              <Card className="empty-state-card">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
                <h4 style={{ fontSize: 17, fontWeight: 700 }}>No Game Sessions Recorded</h4>
                <p>When {patientName} completes memory games, their scores and accuracy logs will appear here.</p>
              </Card>
            ) : (
              <div className="grid-responsive-2">
                {sessions.map((sess) => (
                  <Card key={sess.id} style={{ borderLeft: '5px solid var(--primary)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconGamepad size={22} style={{ color: 'var(--primary)' }} />
                        <span className="headline-sm" style={{ fontSize: 16 }}>
                          {sess.summary?.includes('Caretaker Observation') ? 'Caretaker Note' : 'Memory Game Session'}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 600 }}>
                        {new Date(sess.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="body-md" style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.4 }}>{sess.summary}</p>

                    <div style={{ display: 'flex', gap: 14, backgroundColor: 'var(--surface-container-low)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <p className="label-lg" style={{ color: 'var(--primary)', margin: 0, fontSize: '15px' }}>{sess.accuracy}%</p>
                        <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Accuracy</p>
                      </div>
                      <div>
                        <p className="label-lg" style={{ color: 'var(--secondary)', margin: 0, fontSize: '15px' }}>{sess.correct_count}/{sess.total_rounds || 5}</p>
                        <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Correct</p>
                      </div>
                      <div>
                        <p className="label-lg" style={{ color: '#2e7d32', margin: 0, fontSize: '15px' }}>+{sess.score}</p>
                        <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Score</p>
                      </div>
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
