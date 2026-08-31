import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Record a new GPS location point for a patient in Supabase.
 */
export async function recordLocation({ patientId, latitude, longitude, accuracy = null }) {
  if (!isSupabaseConfigured || !patientId || latitude == null || longitude == null) {
    return { data: null, error: new Error('Missing required location fields or patient ID.') };
  }

  const { data, error } = await supabase
    .from('locations')
    .insert([
      {
        patient_id: patientId,
        latitude,
        longitude,
        accuracy: accuracy ? Math.round(accuracy) : null,
        recorded_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch the latest known location of a patient.
 */
export async function getLatestLocation(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

/**
 * Fetch recent location history breadcrumbs for a patient.
 */
export async function getLocationHistory(patientId, limit = 20) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Real-time subscription to live location stream of a patient.
 */
export function subscribeToPatientLocation(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`locations:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'locations',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        if (payload?.new) {
          callback(payload.new);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Start throttled GPS position tracking using browser Geolocation watchPosition.
 * Automatically throttles Supabase writes to prevent database spam.
 *
 * @param {Object} options
 * @param {string} options.patientId - The authenticated patient UUID
 * @param {function} options.onPosition - Callback receiving the latest GPS position
 * @param {function} options.onError - Callback receiving GeolocationPositionError
 * @param {number} [options.throttleMs=15000] - Minimum milliseconds between Supabase DB writes
 * @returns {function} stopTracking - Cleanup function to stop watchPosition
 */
export function startGpsTracking({
  patientId,
  onPosition,
  onError,
  throttleMs = 15000,
}) {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    if (onError) onError(new Error('Geolocation API is not supported by your browser.'));
    return () => {};
  }

  let lastWriteTimestamp = 0;
  let lastLat = null;
  let lastLng = null;

  const handleSuccess = async (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const now = Date.now();

    // Call local UI callback immediately for responsive UI display
    if (onPosition) {
      onPosition({
        latitude,
        longitude,
        accuracy,
        timestamp: now,
      });
    }

    // Check throttling threshold (time interval + significant movement delta)
    const timeElapsed = now - lastWriteTimestamp;
    const hasMovedSignificantly =
      lastLat === null ||
      Math.abs(latitude - lastLat) > 0.0001 ||
      Math.abs(longitude - lastLng) > 0.0001;

    if (timeElapsed >= throttleMs || (timeElapsed >= 5000 && hasMovedSignificantly)) {
      lastWriteTimestamp = now;
      lastLat = latitude;
      lastLng = longitude;

      // Save to Supabase cloud
      if (patientId) {
        await recordLocation({
          patientId,
          latitude,
          longitude,
          accuracy,
        });
      }
    }
  };

  const handleError = (err) => {
    if (onError) onError(err);
  };

  const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000,
  });

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
