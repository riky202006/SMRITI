import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import MedListItem from './components/MedListItem';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMedications } from '@/hooks/useMedications';

export default function RemindersPage() {
  const { patientRecord } = useAuth();
  const { showToast } = useToast();
  const patientId = patientRecord?.id;

  const {
    medications,
    loading,
    error,
    toggleIntake,
    isTakenToday,
    getIntakeLog,
  } = useMedications(patientId);

  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (medId, time, nextTakenState) => {
    setTogglingId(medId);
    try {
      const { error: err } = await toggleIntake(medId, time, nextTakenState);
      if (err) {
        showToast('Sync failed: ' + err.message);
      } else {
        showToast(nextTakenState ? '✓ Dose marked as TAKEN!' : 'Dose marked as pending.');
      }
    } catch {
      showToast('Error recording dose intake.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AppLayout mode="patient">
      <TopBar title="Daily Medications" />

      <div style={{ marginTop: 8 }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20 }}>
          Here are your scheduled doses for today. Tap &ldquo;Mark as Taken&rdquo; when you take your medicine.
        </p>

        {error && (
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
            {error.message || 'Error fetching medications.'}
          </div>
        )}

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Loading your daily prescriptions...
            </p>
          </Card>
        ) : medications.length === 0 ? (
          <Card className="empty-state-card">
            <div style={{ fontSize: 36, marginBottom: 10 }}>💊</div>
            <h3 className="headline-sm" style={{ marginBottom: 6 }}>No Prescriptions Scheduled</h3>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Your caretaker has not added any daily medications for you yet.
            </p>
          </Card>
        ) : (
          <div className="grid-responsive-2">
            {medications.map((med) => {
              const primaryTime = med.times?.[0] || '08:00';
              const log = getIntakeLog(med.id, primaryTime);
              const isTaken = isTakenToday(med.id, primaryTime);
              const takenAt = log?.taken_at || null;

              return (
                <MedListItem
                  key={med.id}
                  medicine={med}
                  isTaken={isTaken}
                  takenAt={takenAt}
                  onToggle={handleToggle}
                  toggling={togglingId === med.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
