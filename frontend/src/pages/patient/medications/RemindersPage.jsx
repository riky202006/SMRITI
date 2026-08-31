import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import MedListItem from './components/MedListItem';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId } from '@/services/patients';
import {
  getMedications,
  getMedicationLogs,
  logMedicationIntake,
  subscribeMedications,
  subscribeMedicationLogs,
} from '@/services/medications';

export default function RemindersPage() {
  const { showToast } = useAppData();
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
  const [medications, setMedications] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Resolve patient ID
  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) {
          setPatientId(data.id);
        }
      });
    }
  }, [patientRecord?.id, user?.id]);

  // 2. Fetch medication list & intake logs from Supabase
  const loadMedicationsAndLogs = useCallback(() => {
    if (!patientId) return;
    setLoading(true);
    setErrorMsg('');

    Promise.all([
      getMedications(patientId),
      getMedicationLogs(patientId, todayStr, todayStr),
    ])
      .then(([medsRes, logsRes]) => {
        if (medsRes.error) {
          setErrorMsg(medsRes.error.message || 'Failed to fetch medications from Supabase.');
        } else {
          setMedications(medsRes.data || []);
        }

        if (logsRes.data) {
          setMedLogs(logsRes.data || []);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Network error fetching medications.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId, todayStr]);

  useEffect(() => {
    loadMedicationsAndLogs();
  }, [loadMedicationsAndLogs]);

  // 3. Realtime subscription for updates
  useEffect(() => {
    if (!patientId) return undefined;

    const subMeds = subscribeMedications(patientId, () => {
      loadMedicationsAndLogs();
    });

    const subLogs = subscribeMedicationLogs(patientId, () => {
      loadMedicationsAndLogs();
    });

    return () => {
      subMeds.unsubscribe();
      subLogs.unsubscribe();
    };
  }, [patientId, loadMedicationsAndLogs]);

  // 4. Handle dose intake toggle
  const handleToggle = async (medId, time, nextTakenState) => {
    if (!patientId) return;

    setTogglingId(medId);
    try {
      const { data, error } = await logMedicationIntake({
        medicationId: medId,
        patientId,
        scheduledDate: todayStr,
        scheduledTime: time,
        taken: nextTakenState,
        takenAt: nextTakenState ? new Date().toISOString() : null,
      });

      if (error) {
        showToast('Sync failed: ' + error.message);
        return;
      }

      if (data) {
        showToast(nextTakenState ? '✓ Dose marked as TAKEN!' : 'Dose marked as pending.');
        loadMedicationsAndLogs();
      }
    } catch (err) {
      showToast('Error recording intake.');
    } finally {
      setTogglingId(null);
    }
  };

  // Helper to check if dose is taken
  const getLogForMed = (medId, time) => {
    const formattedTime = time.length === 5 ? `${time}:00` : time;
    return medLogs.find(
      (l) => l.medication_id === medId && (l.scheduled_time === formattedTime || l.scheduled_time === time)
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Daily Medications" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
          Here are your scheduled doses for today. Tap "Mark as Taken" when you take your pills.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              fontSize: '14px',
              marginBottom: 16,
            }}
          >
            {errorMsg}
          </div>
        )}

        {loading ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Loading your daily medications from Supabase...
            </p>
          </Card>
        ) : medications.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 28 }}>
            <h3 className="headline-sm" style={{ marginBottom: 6 }}>No Prescriptions Scheduled</h3>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Your caretaker has not added any medications for you yet.
            </p>
          </Card>
        ) : (
          medications.map((med) => {
            const primaryTime = med.times?.[0] || '08:00';
            const log = getLogForMed(med.id, primaryTime);
            const isTaken = log?.taken || false;
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
          })
        )}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
