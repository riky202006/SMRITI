import { useState, useEffect, useCallback } from 'react';
import {
  getMedications,
  getMedicationLogs,
  addMedication as apiAddMedication,
  updateMedication as apiUpdateMedication,
  deleteMedication as apiDeleteMedication,
  logMedicationIntake,
  subscribeMedications,
  subscribeMedicationLogs,
} from '@/services/medications';

export function useMedications(patientId) {
  const [medications, setMedications] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const refresh = useCallback(async () => {
    if (!patientId) {
      setMedications([]);
      setTodayLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [medsRes, logsRes] = await Promise.all([
        getMedications(patientId),
        getMedicationLogs(patientId, todayStr, todayStr),
      ]);

      if (medsRes.error) {
        setError(medsRes.error);
      } else {
        setMedications(medsRes.data || []);
      }

      if (logsRes.data) {
        setTodayLogs(logsRes.data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId, todayStr]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time subscription
  useEffect(() => {
    if (!patientId) return undefined;

    const subMeds = subscribeMedications(patientId, () => {
      refresh();
    });

    const subLogs = subscribeMedicationLogs(patientId, () => {
      refresh();
    });

    return () => {
      subMeds.unsubscribe();
      subLogs.unsubscribe();
    };
  }, [patientId, refresh]);

  const addMed = async (medData) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiAddMedication(patientId, medData);
    if (!res.error) refresh();
    return res;
  };

  const updateMed = async (medId, updates) => {
    const res = await apiUpdateMedication(medId, updates);
    if (!res.error) refresh();
    return res;
  };

  const deleteMed = async (medId) => {
    const res = await apiDeleteMedication(medId);
    if (!res.error) refresh();
    return res;
  };

  const toggleIntake = async (medicationId, scheduledTime, nextTakenState) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };

    const res = await logMedicationIntake({
      medicationId,
      patientId,
      scheduledDate: todayStr,
      scheduledTime,
      taken: nextTakenState,
      takenAt: nextTakenState ? new Date().toISOString() : null,
    });

    if (!res.error) refresh();
    return res;
  };

  const isTakenToday = (medicationId, scheduledTime) => {
    const formattedTime = scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;
    const log = todayLogs.find(
      (l) => l.medication_id === medicationId && (l.scheduled_time === formattedTime || l.scheduled_time === scheduledTime)
    );
    return Boolean(log?.taken);
  };

  const getIntakeLog = (medicationId, scheduledTime) => {
    const formattedTime = scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;
    return todayLogs.find(
      (l) => l.medication_id === medicationId && (l.scheduled_time === formattedTime || l.scheduled_time === scheduledTime)
    );
  };

  return {
    medications,
    todayLogs,
    loading,
    error,
    refresh,
    addMedication: addMed,
    updateMedication: updateMed,
    deleteMedication: deleteMed,
    toggleIntake,
    isTakenToday,
    getIntakeLog,
  };
}
