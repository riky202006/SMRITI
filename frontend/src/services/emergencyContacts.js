import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetch all emergency contacts for a patient.
 */
export async function getEmergencyContacts(patientId) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('patient_id', patientId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Add a new emergency contact for a patient.
 */
export async function addEmergencyContact(patientId, { name, relationship, phone, isPrimary = false }) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert([
      {
        patient_id: patientId,
        name: name.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        is_primary: Boolean(isPrimary),
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing emergency contact.
 */
export async function updateEmergencyContact(contactId, updates) {
  if (!isSupabaseConfigured || !contactId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete an emergency contact.
 */
export async function deleteEmergencyContact(contactId) {
  if (!isSupabaseConfigured || !contactId) return { error: null };

  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  return { error };
}
