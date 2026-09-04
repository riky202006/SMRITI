import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetch all appointments for a patient (ordered by date, time).
 */
export async function getAppointments(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch today's appointments for a patient.
 */
export async function getTodayAppointments(patientId, todayDateStr) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const targetDate = todayDateStr || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .eq('date', targetDate)
    .order('time', { ascending: true });

  return { data: data || [], error };
}

/**
 * Add a new appointment for a patient.
 */
export async function addAppointment(patientId, {
  name,
  kind = 'doctor',
  specialization = '',
  relation = '',
  date,
  time = '10:00 AM',
  location = '',
  purpose = '',
}) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        patient_id: patientId,
        name: name.trim(),
        kind: kind || 'doctor',
        specialization: specialization?.trim() || null,
        relation: relation?.trim() || null,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        location: location?.trim() || null,
        purpose: purpose?.trim() || null,
        status: 'scheduled',
        acknowledged: false,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing appointment.
 */
export async function updateAppointment(appointmentId, updates) {
  if (!isSupabaseConfigured || !appointmentId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();

  return { data, error };
}

/**
 * Acknowledge an appointment by patient.
 */
export async function acknowledgeAppointment(appointmentId) {
  if (!isSupabaseConfigured || !appointmentId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('appointments')
    .update({ acknowledged: true })
    .eq('id', appointmentId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete an appointment.
 */
export async function deleteAppointment(appointmentId) {
  if (!isSupabaseConfigured || !appointmentId) return { error: null };

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  return { error };
}

/**
 * Realtime subscription to appointments for a patient.
 */
export function subscribeToAppointments(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`appointments:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
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
