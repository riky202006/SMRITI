import { useState, useEffect, useCallback } from 'react';
import {
  getMemorySessions,
  getPatientStats,
  saveMemorySession as apiSaveMemorySession,
  subscribeToMemorySessions,
} from '@/services/analytics';

export function useMemorySessions(patientId, limit = 50) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, avgAccuracy: 0, totalScore: 0, totalCorrect: 0 });
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setSessions([]);
      setStats({ totalSessions: 0, avgAccuracy: 0, totalScore: 0, totalCorrect: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [sessRes, statsRes] = await Promise.all([
        getMemorySessions(patientId, limit),
        getPatientStats(patientId),
      ]);

      if (sessRes.error) {
        setError(sessRes.error);
      } else {
        setSessions(sessRes.data || []);
      }

      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToMemorySessions(patientId, () => {
      refresh();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, refresh]);

  const recordSession = async (sessionData) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiSaveMemorySession({ patientId, ...sessionData });
    if (!res.error) refresh();
    return res;
  };

  return {
    sessions,
    stats,
    loading,
    error,
    refresh,
    recordSession,
  };
}
