import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetch all medications for a patient.
 */
export async function getMedications(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Add a new medication for a patient.
 */
export async function addMedication(patientId, { name, type = 'Tablet', dosage = '', frequency = 1, times = [] }) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  const { data, error } = await supabase
    .from('medications')
    .insert([
      {
        patient_id: patientId,
        name: name.trim(),
        type: type || 'Tablet',
        dosage: dosage.trim(),
        frequency: Number(frequency) || 1,
        times: Array.isArray(times) ? times : [times],
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing medication.
 */
export async function updateMedication(medId, updates) {
  if (!isSupabaseConfigured || !medId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', medId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a medication and its related logs.
 */
export async function deleteMedication(medId) {
  if (!isSupabaseConfigured || !medId) return { error: null };

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medId);

  return { error };
}

/**
 * Get medication logs for a given date range.
 */
export async function getMedicationLogs(patientId, startDate, endDate) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  let query = supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId);

  if (startDate) query = query.gte('scheduled_date', startDate);
  if (endDate) query = query.lte('scheduled_date', endDate);

  const { data, error } = await query.order('scheduled_time', { ascending: true });
  return { data: data || [], error };
}

/**
 * Log or toggle medication intake status in Supabase.
 */
export async function logMedicationIntake({
  medicationId,
  patientId,
  scheduledDate,
  scheduledTime,
  taken = true,
  takenAt = new Date().toISOString(),
}) {
  if (!isSupabaseConfigured || !patientId || !medicationId) {
    return { data: null, error: new Error('Missing required fields for medication intake log.') };
  }

  // Format scheduled time to HH:MM:00 if necessary
  const formattedTime = scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;

  // First check if an intake log already exists for this dose
  const { data: existingLog } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('medication_id', medicationId)
    .eq('scheduled_date', scheduledDate)
    .eq('scheduled_time', formattedTime)
    .maybeSingle();

  if (existingLog) {
    // Update existing record
    const { data, error } = await supabase
      .from('medication_logs')
      .update({
        taken,
        taken_at: taken ? takenAt : null,
      })
      .eq('id', existingLog.id)
      .select()
      .single();

    return { data, error };
  }

  // Otherwise insert new record
  const { data, error } = await supabase
    .from('medication_logs')
    .insert([
      {
        medication_id: medicationId,
        patient_id: patientId,
        scheduled_date: scheduledDate,
        scheduled_time: formattedTime,
        taken,
        taken_at: taken ? takenAt : null,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Subscribe to real-time medication list changes for a patient.
 */
export function subscribeMedications(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`medications:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'medications',
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

/**
 * Subscribe to real-time medication intake log changes for a patient.
 */
export function subscribeMedicationLogs(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`medication_logs:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'medication_logs',
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
