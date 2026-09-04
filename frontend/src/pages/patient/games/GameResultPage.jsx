import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconCheck, IconHeart, IconSparkles } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useMemorySessions } from '@/hooks/useMemorySessions';
import { sendPromptToAssistant } from '@/services/aiService';
import { attachAiReflectionToSession } from '@/services/analytics';
import { useToast } from '@/context/ToastContext';

export default function GameResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, patientRecord } = useAuth();
  const { showToast } = useToast();
  const patientId = patientRecord?.id;

  // Retrieve recent memory sessions (up to 12) for historical cognitive analysis
  const { sessions, loading } = useMemorySessions(patientId, 12);

  // Use passed state report or fallback to latest session from database
  const passedReport = location.state?.report;
  const latestDbSession = sessions[0];

  const report = passedReport || (latestDbSession ? {
    sessionId: latestDbSession.id,
    totalRounds: latestDbSession.total_rounds,
    correctCount: latestDbSession.correct_count,
    accuracy: Math.round(Number(latestDbSession.accuracy)),
    score: latestDbSession.score,
    summary: latestDbSession.summary,
    rounds: [],
  } : null);

  const total = report?.totalRounds || 5;

  // AI Reflection & PDF State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReflection, setAiReflection] = useState('');
  const [aiError, setAiError] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [syncedToCaretaker, setSyncedToCaretaker] = useState(false);
  const [syncingCaretaker, setSyncingCaretaker] = useState(false);

  const handleGetReflection = async () => {
    if (aiLoading || !report) return;
    setAiLoading(true);
    setAiError(false);
    setPdfError('');

    try {
      // Extract up to 10 previous historical sessions (excluding current/latest session if already recorded in db)
      const previousHistory = (sessions || [])
        .filter((s) => s && s.accuracy != null && s.total_rounds)
        .slice(passedReport ? 1 : 0, passedReport ? 11 : 10)
        .map((s) => ({
          date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalRounds: s.total_rounds || 5,
          correctCount: s.correct_count ?? 0,
          accuracy: Math.round(Number(s.accuracy || 0)),
          score: s.score || 0,
        }));

      // Privacy: Send ONLY the minimum numerical/performance statistics
      const res = await sendPromptToAssistant({
        prompt: 'Please provide a warm, encouraging reflection on this memory game result.',
        context: {
          type: 'memory_game_result',
          accuracy: report.accuracy,
          correctCount: report.correctCount,
          totalRounds: total,
          score: report.score,
          history: previousHistory,
        },
      });

      const reflectionText =
        res.success && res.reply
          ? res.reply
          : `Wonderful effort completing all ${total} rounds with ${report.accuracy}% accuracy (${report.correctCount}/${total} correct)! Your daily practice is keeping your mind active and engaged.`;

      setAiReflection(reflectionText);

      // Auto-sync AI reflection to Caretaker Analytics in Cloud
      const targetSessionId = report.sessionId || latestDbSession?.id;
      if (targetSessionId || patientId) {
        setSyncingCaretaker(true);
        await attachAiReflectionToSession({
          sessionId: targetSessionId,
          patientId,
          aiReflection: reflectionText,
          baseSummary: report.summary,
        });
        setSyncedToCaretaker(true);
        setSyncingCaretaker(false);
      }
    } catch {
      const defaultReflection = `Wonderful effort completing all ${total} rounds with ${report.accuracy}% accuracy (${report.correctCount}/${total} correct)! Your daily practice is keeping your mind active and engaged.`;
      setAiReflection(defaultReflection);

      const targetSessionId = report.sessionId || latestDbSession?.id;
      if (targetSessionId || patientId) {
        await attachAiReflectionToSession({
          sessionId: targetSessionId,
          patientId,
          aiReflection: defaultReflection,
          baseSummary: report.summary,
        });
        setSyncedToCaretaker(true);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!aiReflection) return;
    setSyncingCaretaker(true);
    try {
      const targetSessionId = report.sessionId || latestDbSession?.id;
      const { error } = await attachAiReflectionToSession({
        sessionId: targetSessionId,
        patientId,
        aiReflection,
        baseSummary: report.summary,
      });
      if (error) {
        showToast('Failed to sync report: ' + error.message);
      } else {
        setSyncedToCaretaker(true);
        showToast('AI Report sent to Connected Caretaker Analytics!');
      }
    } finally {
      setSyncingCaretaker(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfGenerating || !report || !aiReflection) return;
    setPdfGenerating(true);
    setPdfError('');

    try {
      // Lazy load PDF generation service on demand
      const { generateGameResultPdf } = await import('@/services/pdfService');
      generateGameResultPdf({
        report: {
          ...report,
          totalRounds: total,
        },
        aiReflection,
        patientName: profile?.full_name || 'Patient',
        autoDownload: true,
      });
    } catch {
      setPdfError("Your game result is safe. We couldn't create the PDF right now. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const isPatient = profile?.role === 'patient';

  return (
    <AppLayout mode="patient">
      <TopBar title="Challenge Complete" onBack={() => navigate('/patient/home')} />

      <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto', padding: '16px 0', textAlign: 'center' }}>
        {loading && !report ? (
          <Card style={{ padding: '32px 20px' }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Loading game summary...
            </p>
          </Card>
        ) : !report ? (
          <Card className="empty-state-card">
            <h3 className="headline-sm">No Recent Game Session</h3>
            <p className="body-md" style={{ color: 'var(--outline)', margin: '8px 0 20px' }}>
              Start a new game session to practice memory recall.
            </p>
            <Button variant="primary" onClick={() => navigate('/patient/games')}>
              Play Game
            </Button>
          </Card>
        ) : (
          <>
            {/* Main Score & Accuracy Card */}
            <Card style={{ padding: '32px 24px', marginBottom: 20 }}>
              <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={40} />
              </div>
              <h1 className="headline-md" style={{ marginBottom: 6, fontSize: '26px' }}>Great Job! 🎉</h1>
              <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: '15px' }}>
                You completed the memory challenge!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '16px 8px', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <div>
                  <p className="headline-md" style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: 800 }}>{report.accuracy}%</p>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Accuracy</p>
                </div>
                <div>
                  <p className="headline-md" style={{ color: 'var(--secondary)', fontSize: '28px', fontWeight: 800 }}>{report.correctCount}/{total}</p>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Correct</p>
                </div>
                <div>
                  <p className="headline-md" style={{ color: '#2e7d32', fontSize: '28px', fontWeight: 800 }}>+{report.score}</p>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, fontWeight: 600 }}>Score</p>
                </div>
              </div>

              {/* Caretaker Notification Confirmation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 'var(--radius-pill)', backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 14 }}>
                <IconHeart size={20} />
                Report synced to Caretaker Cloud!
              </div>
            </Card>

            {/* SMRITI AI Game Result Sheet Section (Patient Only) */}
            {isPatient && (
              <Card
                style={{
                  padding: '24px',
                  marginBottom: 20,
                  textAlign: 'left',
                  border: '1.5px solid var(--mint-soft)',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
                    <IconSparkles size={22} />
                    <h2 className="headline-sm" style={{ fontSize: '18px', margin: 0, color: 'var(--primary)' }}>
                      SMRITI AI Game Result Sheet
                    </h2>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--mint-soft)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    AI Companion
                  </span>
                </div>

                {!aiReflection && !aiLoading && !aiError && (
                  <div>
                    <p className="body-md" style={{ fontSize: '15px', color: 'var(--on-surface)', margin: '0 0 16px', lineHeight: 1.5 }}>
                      Generate an AI-powered summary and downloadable result sheet for today&apos;s memory exercise.
                    </p>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleGetReflection}
                      style={{ width: '100%', minHeight: '46px', borderRadius: 'var(--radius-pill)', fontSize: '15px' }}
                    >
                      ✨ Get SMRITI Assistant Reflection
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {aiLoading && (
                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: 'var(--mint-soft)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid var(--primary)',
                        borderTopColor: 'transparent',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    SMRITI Assistant is thinking...
                  </div>
                )}

                {/* Full AI Result Sheet Display */}
                {aiReflection && !aiLoading && (
                  <div>
                    {/* Game Summary Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface-container-low)',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 14,
                        border: '1px solid var(--surface-container)',
                      }}
                    >
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--outline)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Game Summary
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 14px', fontSize: '14px' }}>
                        <div><strong>Rounds Completed:</strong> {total}</div>
                        <div><strong>Correct Answers:</strong> {report.correctCount} / {total}</div>
                        <div><strong>Recall Accuracy:</strong> {report.accuracy}%</div>
                        <div><strong>Points Earned:</strong> +{report.score}</div>
                      </div>
                    </div>

                    {/* SMRITI Assistant Reflection Message */}
                    <div
                      style={{
                        padding: '16px 18px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 800, fontSize: '12px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <IconSparkles size={16} /> SMRITI Assistant Reflection
                      </div>
                      <p
                        style={{
                          fontSize: '15px',
                          lineHeight: 1.6,
                          color: '#14532d',
                          margin: 0,
                          fontWeight: 500,
                        }}
                      >
                        {aiReflection}
                      </p>
                    </div>

                    {/* Caretaker Sync Confirmation Badge & Action */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065f46', fontSize: '13px', fontWeight: 600 }}>
                        <IconCheck size={18} color="#059669" />
                        <span>AI Report synced to Caretaker Analytics page!</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={syncingCaretaker}
                        onClick={handleManualSync}
                        style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          minHeight: '28px',
                          color: '#065f46',
                          borderColor: '#a7f3d0',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        {syncingCaretaker ? 'Syncing...' : '🔄 Re-send to Caretaker'}
                      </Button>
                    </div>

                    {/* AI Information & Disclaimer */}
                    <p style={{ fontSize: '12px', color: 'var(--outline)', margin: '0 0 4px' }}>
                      AI-generated reflection based on this SMRITI game result.
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--outline)', margin: '0 0 16px', lineHeight: 1.4, fontStyle: 'italic' }}>
                      ℹ️ AI reflections are informational only and are not a medical diagnosis, clinical assessment, or treatment recommendation.
                    </p>

                    {/* Download PDF Button */}
                    <Button
                      type="button"
                      variant="primary"
                      disabled={pdfGenerating}
                      onClick={handleDownloadPdf}
                      style={{ width: '100%', minHeight: '46px', borderRadius: 'var(--radius-pill)', fontSize: '15px' }}
                    >
                      {pdfGenerating ? 'Preparing your result sheet...' : '📥 Download Result Sheet as PDF'}
                    </Button>

                    {pdfError && (
                      <p style={{ color: 'var(--error)', fontSize: '13px', margin: '10px 0 0', textAlign: 'center' }}>
                        {pdfError}
                      </p>
                    )}
                  </div>
                )}

                {/* Error Fallback */}
                {aiError && !aiLoading && (
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--surface-container-low)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <p style={{ fontSize: '14px', color: 'var(--outline)', margin: 0 }}>
                      SMRITI Assistant is unavailable right now. Your game result is still saved.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetReflection}
                      style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Round-by-round breakdown if available */}
            {report.rounds && report.rounds.length > 0 && (
              <Card style={{ textAlign: 'left', marginBottom: 20 }}>
                <h3 className="label-lg" style={{ marginBottom: 14, letterSpacing: '0.5px' }}>
                  ROUND PERFORMANCE
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.rounds.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: r.isCorrect ? 'var(--mint-soft)' : 'var(--error-container)',
                        fontSize: 14,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Round {r.round}: {r.targetName}</span>
                      <span style={{ fontWeight: 800, color: r.isCorrect ? 'var(--primary)' : 'var(--error)' }}>
                        {r.isCorrect ? '✓ Correct' : `✗ (${r.chosenName})`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button variant="primary" onClick={() => navigate('/patient/games/countdown')} style={{ width: '100%' }}>
                Play Another Round
              </Button>
              <Button variant="outline" onClick={() => navigate('/patient/home')} style={{ width: '100%' }}>
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
