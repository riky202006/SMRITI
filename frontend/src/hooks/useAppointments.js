import { useState, useEffect, useCallback } from 'react';
import {
  getAppointments,
  addAppointment as apiAddAppointment,
  updateAppointment as apiUpdateAppointment,
  deleteAppointment as apiDeleteAppointment,
  acknowledgeAppointment as apiAcknowledgeAppointment,
  subscribeToAppointments,
} from '@/services/appointments';

export function useAppointments(patientId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const refresh = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await getAppointments(patientId);
      if (err) {
        setError(err);
      } else {
        setAppointments(data || []);
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

    const sub = subscribeToAppointments(patientId, () => {
      refresh();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, refresh]);

  const add = async (apptData) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiAddAppointment(patientId, apptData);
    if (!res.error) refresh();
    return res;
  };

  const update = async (apptId, updates) => {
    const res = await apiUpdateAppointment(apptId, updates);
    if (!res.error) refresh();
    return res;
  };

  const remove = async (apptId) => {
    const res = await apiDeleteAppointment(apptId);
    if (!res.error) refresh();
    return res;
  };

  const acknowledge = async (apptId) => {
    const res = await apiAcknowledgeAppointment(apptId);
    if (!res.error) refresh();
    return res;
  };

  // Helper filters
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter((a) => a.date >= todayStr);

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    loading,
    error,
    refresh,
    addAppointment: add,
    updateAppointment: update,
    deleteAppointment: remove,
    acknowledgeAppointment: acknowledge,
  };
}
