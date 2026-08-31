import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Fetch recent memory/cognitive game sessions for a patient.
 */
export async function getMemorySessions(patientId, limit = 20) {
  if (!isSupabaseConfigured || !patientId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('memory_sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Record a completed memory game session.
 */
export async function saveMemorySession({
  patientId,
  totalRounds = 5,
  correctCount = 0,
  accuracy = 0,
  score = 0,
  summary = '',
}) {
  if (!isSupabaseConfigured || !patientId) return { data: null, error: null };

  const { data, error } = await supabase
    .from('memory_sessions')
    .insert([
      {
        patient_id: patientId,
        total_rounds: totalRounds,
        correct_count: correctCount,
        accuracy,
        score,
        summary,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Compute aggregate statistics for patient performance.
 */
export async function getPatientStats(patientId) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: { totalSessions: 0, avgAccuracy: 0, totalScore: 0 }, error: null };
  }

  const { data, error } = await supabase
    .from('memory_sessions')
    .select('accuracy, score, correct_count, total_rounds')
    .eq('patient_id', patientId);

  if (error || !data || data.length === 0) {
    return { data: { totalSessions: 0, avgAccuracy: 0, totalScore: 0 }, error };
  }

  const totalSessions = data.length;
  const totalScore = data.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgAccuracy = Math.round(
    data.reduce((sum, s) => sum + Number(s.accuracy || 0), 0) / totalSessions
  );

  return {
    data: {
      totalSessions,
      avgAccuracy,
      totalScore,
    },
    error: null,
  };
}
