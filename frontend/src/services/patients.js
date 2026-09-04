import { supabase, isSupabaseConfigured } from './supabase';
import { generateSmritiCode, normalizeConnectionCode, isValidConnectionCode, isValidUuid } from '@/utils/codeGenerator';

/**
 * Get patient record with profile info by patient ID.
 */
export async function getPatientById(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      profile_id,
      connection_code,
      created_at,
      profiles:profile_id (
        id,
        full_name,
        phone,
        role
      )
    `)
    .eq('id', patientId)
    .single();

  return { data, error };
}

/**
 * Get patient record for a user profile ID.
 */
export async function getPatientByProfileId(profileId) {
  if (!isSupabaseConfigured || !profileId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  // If patient record exists but has no connection_code (legacy account), assign one immediately
  if (data && !data.connection_code) {
    const generatedCode = generateSmritiCode();
    data.connection_code = generatedCode;
    supabase
      .from('patients')
      .update({ connection_code: generatedCode })
      .eq('id', data.id)
      .then();
  }

  return { data, error };
}

/**
 * Create or ensure patient record for a profile with an immediate SMRITI connection code.
 */
export async function createPatientRecord(profileId, customCode = null) {
  if (!isSupabaseConfigured || !profileId) return { data: null, error: null };

  const connectionCode = customCode || generateSmritiCode();

  const { data, error } = await supabase
    .from('patients')
    .upsert(
      { profile_id: profileId, connection_code: connectionCode },
      { onConflict: 'profile_id' }
    )
    .select()
    .single();

  return { data, error };
}

/**
 * Get all patients assigned to a caretaker profile ID.
 */
export async function getAssignedPatients(caretakerProfileId) {
  if (!isSupabaseConfigured || !caretakerProfileId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('caretaker_patient')
    .select(`
      id,
      relationship,
      patient_id,
      patient:patient_id (
        id,
        profile_id,
        connection_code,
        created_at,
        profiles:profile_id (
          id,
          full_name,
          phone
        )
      )
    `)
    .eq('caretaker_id', caretakerProfileId);

  return { data: data || [], error };
}

/**
 * Get all caretakers connected to a specific patient.
 */
export async function getAssignedCaretakersForPatient(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('caretaker_patient')
    .select(`
      id,
      relationship,
      caretaker_id,
      profiles:caretaker_id (
        id,
        full_name,
        phone,
        role
      )
    `)
    .eq('patient_id', patientId);

  return { data: data || [], error };
}

/**
 * Connect a caretaker to a patient using patient connection code (e.g. SMRITI-X7K9P2 or legacy UUID).
 */
export async function connectPatientByCode({ patientCode, relationship = 'Caregiver' }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const cleanCode = normalizeConnectionCode(patientCode);

  if (!cleanCode || !isValidConnectionCode(cleanCode)) {
    return {
      data: null,
      error: new Error('Invalid Patient Connection Code. Please enter a valid format (e.g. SMRITI-X7K9P2).'),
    };
  }

  // 1. Try using RPC function `connect_patient`
  const { data: rpcData, error: rpcError } = await supabase.rpc('connect_patient', {
    p_code: cleanCode,
    p_relationship: relationship,
  });

  if (!rpcError && rpcData?.success) {
    return { data: rpcData, error: null };
  }

  // If error was explicit logic error from DB (e.g. self-link, not found), return it
  if (rpcError && !rpcError.message?.includes('function') && !rpcError.message?.includes('schema')) {
    return { data: null, error: new Error(rpcError.message) };
  }

  // 2. Direct fallback lookup and link
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) {
    return { data: null, error: new Error('You must be signed in to link a patient.') };
  }

  let patientIdToLink = null;
  if (isValidUuid(cleanCode)) {
    patientIdToLink = cleanCode;
  } else {
    const { data: foundPatient, error: lookupErr } = await supabase
      .from('patients')
      .select('id, profile_id')
      .eq('connection_code', cleanCode)
      .maybeSingle();

    if (lookupErr || !foundPatient) {
      return {
        data: null,
        error: new Error('Patient connection code not found. Please verify the code.'),
      };
    }

    if (foundPatient.profile_id === authUser.user.id) {
      return {
        data: null,
        error: new Error('You cannot link your own patient account as a caretaker.'),
      };
    }

    patientIdToLink = foundPatient.id;
  }

  const { data, error } = await supabase
    .from('caretaker_patient')
    .upsert(
      {
        caretaker_id: authUser.user.id,
        patient_id: patientIdToLink,
        relationship,
      },
      { onConflict: 'caretaker_id,patient_id' }
    )
    .select(`
      id,
      relationship,
      patient_id,
      patient:patient_id (
        id,
        profile_id,
        connection_code,
        profiles:profile_id (
          id,
          full_name,
          phone
        )
      )
    `)
    .single();

  if (error) {
    if (error.code === '23503') {
      return { data: null, error: new Error('Patient connection code not found. Please verify the code.') };
    }
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Unlink/remove a patient-caretaker connection.
 */
export async function unlinkPatientFromCaretaker({ caretakerId, patientId }) {
  if (!isSupabaseConfigured || !caretakerId || !patientId) return { error: null };

  const { error } = await supabase
    .from('caretaker_patient')
    .delete()
    .eq('caretaker_id', caretakerId)
    .eq('patient_id', patientId);

  return { error };
}

/**
 * Get patient settings / preferences.
 */
export async function getPatientSettings(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('patient_settings')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();

  return { data, error };
}

/**
 * Upsert patient settings / preferences.
 */
export async function updatePatientSettings(patientId, settings) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('patient_settings')
    .upsert(
      {
        patient_id: patientId,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id' }
    )
    .select()
    .single();

  return { data, error };
}
