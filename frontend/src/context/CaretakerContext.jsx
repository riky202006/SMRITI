import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getAssignedPatients, connectPatientByCode, unlinkPatientFromCaretaker } from '@/services/patients';

const CaretakerContext = createContext(null);

const STORAGE_KEY_PREFIX = 'smriti_active_patient_';

export function CaretakerProvider({ children }) {
  const { user } = useAuth();
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [activePatientId, setActivePatientIdState] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const caretakerId = user?.id;

  // Persist active patient ID in localStorage keyed per caretaker
  const persistActivePatientId = useCallback(
    (patientId) => {
      if (!caretakerId) return;
      try {
        if (patientId) {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${caretakerId}`, patientId);
        } else {
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${caretakerId}`);
        }
      } catch (err) {
        console.warn('[CaretakerContext] Could not persist active patient ID:', err);
      }
    },
    [caretakerId]
  );

  // Load patients and resolve active patient
  const refreshPatients = useCallback(
    async (preferredPatientId = null) => {
      if (!caretakerId) {
        setAssignedPatients([]);
        setActivePatientIdState(null);
        setLoadingPatients(false);
        return [];
      }

      setLoadingPatients(true);
      try {
        const { data } = await getAssignedPatients(caretakerId);
        const patients = data || [];
        setAssignedPatients(patients);

        if (patients.length === 0) {
          setActivePatientIdState(null);
          persistActivePatientId(null);
          return [];
        }

        // Determine which patient should be active
        let targetId = null;

        if (preferredPatientId && patients.some((p) => p.patient_id === preferredPatientId)) {
          targetId = preferredPatientId;
        } else {
          let savedId = null;
          try {
            savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}${caretakerId}`);
          } catch {}

          if (activePatientId && patients.some((p) => p.patient_id === activePatientId)) {
            targetId = activePatientId;
          } else if (savedId && patients.some((p) => p.patient_id === savedId)) {
            targetId = savedId;
          } else {
            targetId = patients[0].patient_id;
          }
        }

        setActivePatientIdState(targetId);
        persistActivePatientId(targetId);
        return patients;
      } catch (err) {
        console.error('[CaretakerContext] Error loading assigned patients:', err);
        return [];
      } finally {
        setLoadingPatients(false);
      }
    },
    [caretakerId, activePatientId, persistActivePatientId]
  );

  // Initialize on mount or user switch
  useEffect(() => {
    if (caretakerId) {
      try {
        const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}${caretakerId}`);
        if (savedId) {
          setActivePatientIdState(savedId);
        }
      } catch {}

      refreshPatients();
    } else {
      setAssignedPatients([]);
      setActivePatientIdState(null);
      setLoadingPatients(false);
    }
  }, [caretakerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Select active patient
  const selectPatient = useCallback(
    (patientId) => {
      if (!patientId) return;
      setActivePatientIdState(patientId);
      persistActivePatientId(patientId);
    },
    [persistActivePatientId]
  );

  // Connect new patient by code and make them active immediately
  const connectPatient = useCallback(
    async ({ patientCode, relationship = 'Guardian' }) => {
      try {
        const res = await connectPatientByCode({ patientCode, relationship });
        if (res.error) {
          return res;
        }

        const newPatientId = res.data?.patient_id || res.data?.id;
        if (newPatientId) {
          selectPatient(newPatientId);
        }

        // Refresh list with the newly connected patient as preferred active
        await refreshPatients(newPatientId);

        return res;
      } catch (err) {
        return { data: null, error: err };
      }
    },
    [refreshPatients, selectPatient]
  );

  // Disconnect / unlink patient
  const unlinkPatient = useCallback(
    async (targetPatientId) => {
      if (!caretakerId || !targetPatientId) return { error: new Error('Missing arguments') };

      try {
        const { error } = await unlinkPatientFromCaretaker({
          caretakerId,
          patientId: targetPatientId,
        });

        if (error) return { error };

        const remaining = assignedPatients.filter((p) => p.patient_id !== targetPatientId);
        const nextActiveId = remaining.length > 0 ? remaining[0].patient_id : null;

        await refreshPatients(nextActiveId);

        return { error: null };
      } catch (err) {
        return { error: err };
      }
    },
    [caretakerId, assignedPatients, refreshPatients]
  );

  // Compute active patient object
  const activePatient = useMemo(() => {
    if (!assignedPatients || assignedPatients.length === 0) return null;
    const found = assignedPatients.find((p) => p.patient_id === activePatientId);
    return found || assignedPatients[0] || null;
  }, [assignedPatients, activePatientId]);

  const value = useMemo(
    () => ({
      assignedPatients,
      activePatient,
      activePatientId: activePatient?.patient_id || null,
      loadingPatients,
      selectPatient,
      connectPatient,
      unlinkPatient,
      refreshPatients,
    }),
    [assignedPatients, activePatient, loadingPatients, selectPatient, connectPatient, unlinkPatient, refreshPatients]
  );

  return <CaretakerContext.Provider value={value}>{children}</CaretakerContext.Provider>;
}

export function useCaretaker() {
  const context = useContext(CaretakerContext);
  if (!context) {
    throw new Error('useCaretaker must be used within a CaretakerProvider');
  }
  return context;
}
