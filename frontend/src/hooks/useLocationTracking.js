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
  const [refreshing, setRefreshing] = useState(false);
  const stopTrackingRef = useRef(null);

  // Clear previous patient data immediately when patientId changes
  useEffect(() => {
    setLatestLocation(null);
    setHistory([]);
    setGpsCoords(null);
    setGpsError(null);
  }, [patientId]);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setLatestLocation(null);
      setHistory([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const [latestRes, histRes] = await Promise.all([
        getLatestLocation(patientId),
        getLocationHistory(patientId, 20),
      ]);

      setLatestLocation(latestRes.data || null);
      setHistory(histRes.data || []);
    } catch {
      // Ignore network errors gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time stream for Caretaker / Patient live location updates
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToPatientLocation(patientId, (newLoc) => {
      if (newLoc && newLoc.latitude != null && newLoc.longitude != null) {
        setLatestLocation(newLoc);
        setHistory((prev) => {
          const filtered = prev.filter((item) => item.id !== newLoc.id);
          return [newLoc, ...filtered.slice(0, 19)];
        });
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId]);

  // GPS Sharing toggle (used on patient side)
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
    refreshing,
    refresh,
    startTracking,
    stopTracking,
  };
}
