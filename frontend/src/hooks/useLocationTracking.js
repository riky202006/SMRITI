import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getLatestLocation,
  getLocationHistory,
  startGpsTracking,
  subscribeToPatientLocation,
} from '@/services/location';

export function useLocationTracking(patientId) {
  const [latestLocation, setLatestLocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [loading, setLoading] = useState(Boolean(patientId));
  const stopTrackingRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setLatestLocation(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [latestRes, histRes] = await Promise.all([
        getLatestLocation(patientId),
        getLocationHistory(patientId, 20),
      ]);

      if (latestRes.data) {
        setLatestLocation(latestRes.data);
      }
      if (histRes.data) {
        setHistory(histRes.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time stream for Caretaker / Patient map view
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToPatientLocation(patientId, (newLoc) => {
      if (newLoc && newLoc.latitude != null && newLoc.longitude != null) {
        setLatestLocation(newLoc);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId]);

  // GPS Sharing toggle
  const startTracking = (throttleMs = 15000) => {
    if (!patientId) {
      setGpsError('Patient record missing.');
      return;
    }

    setGpsError(null);
    try {
      const cleanup = startGpsTracking({
        patientId,
        onPosition: (pos) => {
          setGpsCoords(pos);
          setLatestLocation({
            patient_id: patientId,
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: pos.accuracy,
            recorded_at: new Date(pos.timestamp).toISOString(),
          });
          setGpsError(null);
        },
        onError: (err) => {
          setGpsError(err.message || 'GPS tracking error');
          setIsTracking(false);
        },
        throttleMs,
      });

      stopTrackingRef.current = cleanup;
      setIsTracking(true);
    } catch (err) {
      setGpsError(err.message || 'Could not start GPS');
    }
  };

  const stopTracking = () => {
    if (stopTrackingRef.current) {
      stopTrackingRef.current();
      stopTrackingRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (stopTrackingRef.current) {
        stopTrackingRef.current();
        stopTrackingRef.current = null;
      }
    };
  }, []);

  return {
    latestLocation,
    history,
    isTracking,
    gpsCoords,
    gpsError,
    loading,
    refresh,
    startTracking,
    stopTracking,
  };
}
