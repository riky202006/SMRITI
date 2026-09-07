import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Trigger an emergency SOS distress alert.
 */
export async function triggerSosAlert({ patientId, latitude = null, longitude = null }) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Unable to send SOS. Please try again.') };
  }

  // Strictly invoke Supabase Edge Function (trigger-sos) which validates, saves alert, and pushes notifications
  try {
    const { data: funcData, error: funcError } = await supabase.functions.invoke('trigger-sos', {
      body: {
        patientId,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
      },
    });

    if (funcError) {
      console.error('[triggerSosAlert] Edge function error:', funcError);
      return {
        data: null,
        error: new Error('Unable to send SOS. Please try again.'),
      };
    }

    if (!funcData || funcData.error) {
      console.error('[triggerSosAlert] Edge function returned error:', funcData?.error);
      return {
        data: null,
        error: new Error(funcData?.error || 'Unable to send SOS. Please try again.'),
      };
    }

    return {
      data: funcData.alert,
      alreadyActive: funcData.alreadyActive || false,
      pushStats: funcData.pushStats,
      error: null,
    };
  } catch (err) {
    console.error('[triggerSosAlert] Exception invoking trigger-sos Edge Function:', err);
    return {
      data: null,
      error: new Error('Unable to send SOS. Please try again.'),
    };
  }
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

  const channelName = `sos_alerts_${patientId}_${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sos_alerts',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        if (typeof callback === 'function') {
          callback(payload);
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.warn(`[Realtime SOS] Subscription warning for patient ${patientId}:`, err);
      }
    });

  return {
    unsubscribe: () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('[Realtime SOS] Error removing channel:', err);
      }
    },
  };
}
