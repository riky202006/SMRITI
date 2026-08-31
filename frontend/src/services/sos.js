import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Trigger an emergency SOS distress alert.
 */
export async function triggerSosAlert({ patientId, latitude = null, longitude = null }) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  // Prevent duplicate spam if an active alert was created in the last 15 seconds
  const fifteenSecsAgo = new Date(Date.now() - 15000).toISOString();
  const { data: recentAlerts } = await supabase
    .from('sos_alerts')
    .select('id, status, triggered_at')
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .gte('triggered_at', fifteenSecsAgo)
    .limit(1);

  if (recentAlerts && recentAlerts.length > 0) {
    return {
      data: recentAlerts[0],
      error: null,
      alreadyActive: true,
    };
  }

  const { data, error } = await supabase
    .from('sos_alerts')
    .insert([
      {
        patient_id: patientId,
        status: 'active',
        latitude: latitude || null,
        longitude: longitude || null,
        triggered_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Caretaker acknowledges an SOS alert.
 */
export async function acknowledgeSosAlert(alertId) {
  if (!isSupabaseConfigured || !alertId) {
    return { data: null, error: new Error('Missing alert ID.') };
  }

  const { data, error } = await supabase
    .from('sos_alerts')
    .update({
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .select()
    .single();

  return { data, error };
}

/**
 * Resolve/Dismiss an SOS alert.
 */
export async function resolveSosAlert(alertId) {
  if (!isSupabaseConfigured || !alertId) {
    return { data: null, error: new Error('Missing alert ID.') };
  }

  const { data, error } = await supabase
    .from('sos_alerts')
    .update({
      status: 'resolved',
    })
    .eq('id', alertId)
    .select()
    .single();

  return { data, error };
}

/**
 * Get currently active or acknowledged SOS alert for a patient.
 */
export async function getActiveSosAlerts(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['active', 'acknowledged'])
    .order('triggered_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Get the single latest SOS alert for a patient (regardless of status).
 */
export async function getLatestSosAlert(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .order('triggered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

/**
 * Get SOS alerts history for a patient.
 */
export async function getSosHistory(patientId, limit = 10) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Real-time subscription to SOS alerts for a specific patient.
 */
export function subscribeToSosAlerts(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`sos_alerts:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sos_alerts',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
