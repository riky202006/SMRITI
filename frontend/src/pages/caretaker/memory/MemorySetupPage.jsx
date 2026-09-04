import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MemoryActivityChart from '@/components/charts/MemoryActivityChart';
import { useToast } from '@/context/ToastContext';
import { useCaretaker } from '@/context/CaretakerContext';
import { getPatientSettings, updatePatientSettings } from '@/services/patients';
import { useMemorySessions } from '@/hooks/useMemorySessions';

export default function MemorySetupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { activePatient: patient, loadingPatients: loadingPatient } = useCaretaker();

  const [difficulty, setDifficulty] = useState('Medium');
  const [savingSettings, setSavingSettings] = useState(false);

  const patientId = patient?.patient_id;
  const { sessions, loading: loadingSessions } = useMemorySessions(patientId, 15);

  useEffect(() => {
    if (patientId) {
      getPatientSettings(patientId).then(({ data }) => {
        if (data?.difficulty) {
          setDifficulty(data.difficulty);
        }
      });
    }
  }, [patientId]);

  const handleSaveSettings = async () => {
    if (!patientId) return;
    setSavingSettings(true);
    try {
      await updatePatientSettings(patientId, { difficulty });
      showToast(`Memory challenge difficulty updated: ${difficulty}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const chartReports = sessions.map((s) => ({
    id: s.id,
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: Number(s.accuracy) || 0,
    score: s.score || 0,
    correctCount: s.correct_count || 0,
    totalRounds: s.total_rounds || 5,
    summary: s.summary,
  }));

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Memory Game Configuration" />

      <div style={{ marginTop: 8 }}>
        <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
          PATIENT PERFORMANCE REPORT CHART
        </h3>

        <div style={{ marginBottom: 24 }}>
          {loadingSessions ? (
            <Card style={{ textAlign: 'center', padding: 24 }}>
              <div className="spinner" />
              <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cognitive report...</p>
            </Card>
          ) : (
            <MemoryActivityChart reports={chartReports} />
          )}
        </div>

        <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
          <Card style={{ padding: '24px' }}>
            <h3 className="headline-sm" style={{ marginBottom: 8, fontSize: '18px' }}>Difficulty &amp; Challenge Settings</h3>
            <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16, fontSize: '14px' }}>
              Adjust how many distractor options are shown during family photo recognition rounds.
            </p>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Challenge Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="form-select"
              >
                <option value="Easy">Easy (2 Choices)</option>
                <option value="Medium">Medium (4 Choices)</option>
                <option value="Hard">Hard (6 Choices)</option>
              </select>
            </div>

            <Button variant="primary" onClick={handleSaveSettings} disabled={savingSettings} style={{ width: '100%' }}>
              {savingSettings ? 'Saving...' : 'Save Settings to Cloud'}
            </Button>
          </Card>

          <Card style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--surface-container-low)' }}>
            <h4 className="headline-sm" style={{ margin: '0 0 6px', fontSize: '18px' }}>Want Full Analytics &amp; Notes?</h4>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14, marginBottom: 16 }}>
              View detailed historical session logs and record custom caretaker clinical observations.
            </p>
            <Button variant="outline" onClick={() => navigate('/caretaker/analytics')} style={{ width: '100%' }}>
              Go to Full Analytics Page →
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
