import { useState, useEffect, useCallback } from 'react';
import {
  getActiveSosAlerts,
  getSosHistory,
  triggerSosAlert as apiTriggerSosAlert,
  acknowledgeSosAlert as apiAcknowledgeSosAlert,
  resolveSosAlert as apiResolveSosAlert,
  subscribeToSosAlerts,
} from '@/services/sos';

export function useSos(patientId) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setActiveAlerts([]);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [activeRes, histRes] = await Promise.all([
        getActiveSosAlerts(patientId),
        getSosHistory(patientId, 10),
      ]);

      if (activeRes.error) {
        setError(activeRes.error);
      } else {
        setActiveAlerts(activeRes.data || []);
      }

      if (histRes.data) {
        setHistory(histRes.data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToSosAlerts(patientId, () => {
      refresh();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, refresh]);

  const trigger = async (coords = null) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiTriggerSosAlert({
      patientId,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
    });
    if (!res.error) refresh();
    return res;
  };

  const acknowledge = async (alertId) => {
    const res = await apiAcknowledgeSosAlert(alertId);
    if (!res.error) refresh();
    return res;
  };

  const resolve = async (alertId) => {
    const res = await apiResolveSosAlert(alertId);
    if (!res.error) refresh();
    return res;
  };

  const currentActive = activeAlerts[0] || null;

  return {
    activeAlerts,
    currentActive,
    history,
    isEmergency: currentActive?.status === 'active',
    isAcknowledged: currentActive?.status === 'acknowledged',
    loading,
    error,
    refresh,
    triggerSos: trigger,
    acknowledgeSos: acknowledge,
    resolveSos: resolve,
  };
}
