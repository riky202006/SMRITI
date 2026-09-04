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
import { IconStats, IconGamepad, IconDocument, IconSparkles, IconDownload } from '@/components/icons';
import { generateGameResultPdf } from '@/services/pdfService';

function parseSessionSummary(rawSummary) {
  if (!rawSummary) return { baseSummary: 'Memory Game Session', aiReflection: null, isCaretakerNote: false };
  const isCaretakerNote = rawSummary.includes('[Caretaker Observation]');

  if (rawSummary.includes('[AI Report]:')) {
    const parts = rawSummary.split('[AI Report]:');
    return {
      baseSummary: parts[0].trim() || 'Memory Game Session',
      aiReflection: parts[1]?.trim() || null,
      isCaretakerNote,
    };
  }

  if (rawSummary.includes('[AI Reflection]:')) {
    const parts = rawSummary.split('[AI Reflection]:');
    return {
      baseSummary: parts[0].trim() || 'Memory Game Session',
      aiReflection: parts[1]?.trim() || null,
      isCaretakerNote,
    };
  }

  return {
    baseSummary: rawSummary.trim(),
    aiReflection: null,
    isCaretakerNote,
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [customAccuracy, setCustomAccuracy] = useState('80');
  const [customNotes, setCustomNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);

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

  // Handle downloading PDF for any session with AI Report
  const handleDownloadSessionPdf = (sess, aiReflectionText) => {
    try {
      setDownloadingSessionId(sess.id);
      generateGameResultPdf({
        report: {
          date: new Date(sess.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          totalRounds: sess.total_rounds || 5,
          correctCount: sess.correct_count ?? 0,
          accuracy: Math.round(Number(sess.accuracy || 0)),
          score: sess.score || 0,
        },
        aiReflection: aiReflectionText,
        patientName,
        autoDownload: true,
      });
      showToast('Downloaded SMRITI AI Report PDF!');
    } catch {
      showToast('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingSessionId(null);
    }
  };

  // Find latest session containing an AI report
  const latestAiSession = sessions.find((s) => {
    const parsed = parseSessionSummary(s.summary);
    return Boolean(parsed.aiReflection);
  });
  const latestAiParsed = latestAiSession ? parseSessionSummary(latestAiSession.summary) : null;

  // Format data for chart
  const chartReports = sessions.map((s) => {
    const parsed = parseSessionSummary(s.summary);
    return {
      id: s.id,
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: Number(s.accuracy) || 0,
      score: s.score || 0,
      correctCount: s.correct_count || 0,
      totalRounds: s.total_rounds || 5,
      summary: parsed.baseSummary,
      timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

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
                Track cognitive health trends, accuracy curves, and AI-generated cognitive reflections across memory challenges.
              </p>
            </Card>

            {/* Featured Latest AI Report Insight for Caretaker */}
            {latestAiSession && latestAiParsed?.aiReflection && (
              <Card
                style={{
                  padding: '20px 22px',
                  marginBottom: 20,
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534' }}>
                    <IconSparkles size={20} color="#16a34a" />
                    <h3 className="headline-sm" style={{ fontSize: '16px', margin: 0, color: '#166534', fontWeight: 700 }}>
                      Latest SMRITI AI Cognitive Insight
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      {new Date(latestAiSession.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      disabled={downloadingSessionId === latestAiSession.id}
                      onClick={() => handleDownloadSessionPdf(latestAiSession, latestAiParsed.aiReflection)}
                      style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        minHeight: '28px',
                        borderColor: '#86efac',
                        color: '#15803d',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <IconDownload size={14} color="#15803d" />
                      {downloadingSessionId === latestAiSession.id ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </div>

                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#14532d', margin: '0 0 10px', fontWeight: 500 }}>
                  &ldquo;{latestAiParsed.aiReflection}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                  <span>🎯 Score: {latestAiSession.accuracy}%</span>
                  <span>•</span>
                  <span>✅ Correct: {latestAiSession.correct_count}/{latestAiSession.total_rounds || 5}</span>
                  <span>•</span>
                  <span>🏆 Points: +{latestAiSession.score}</span>
                </div>
              </Card>
            )}

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
                <p>When {patientName} completes memory games, their scores, accuracy logs, and AI reports will appear here.</p>
              </Card>
            ) : (
              <div className="grid-responsive-2">
                {sessions.map((sess) => {
                  const parsed = parseSessionSummary(sess.summary);
                  return (
                    <Card key={sess.id} style={{ borderLeft: '5px solid var(--primary)', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <IconGamepad size={22} style={{ color: 'var(--primary)' }} />
                          <span className="headline-sm" style={{ fontSize: 16 }}>
                            {parsed.isCaretakerNote ? 'Caretaker Note' : 'Memory Game Session'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {parsed.aiReflection && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#15803d',
                                backgroundColor: '#dcfce7',
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-pill)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              <IconSparkles size={11} color="#16a34a" /> AI Report
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 600 }}>
                            {new Date(sess.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="body-md" style={{ marginBottom: parsed.aiReflection ? 10 : 12, fontSize: 14, lineHeight: 1.4 }}>
                        {parsed.baseSummary}
                      </p>

                      {/* Display Embedded AI Report if present */}
                      {parsed.aiReflection && (
                        <div
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 12,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <IconSparkles size={13} color="#16a34a" /> AI Cognitive Reflection
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDownloadSessionPdf(sess, parsed.aiReflection)}
                              disabled={downloadingSessionId === sess.id}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#15803d',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                padding: '2px 4px',
                              }}
                            >
                              <IconDownload size={12} color="#15803d" /> PDF
                            </button>
                          </div>
                          <p style={{ fontSize: '13px', lineHeight: 1.4, color: '#14532d', margin: 0 }}>
                            {parsed.aiReflection}
                          </p>
                        </div>
                      )}

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
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

