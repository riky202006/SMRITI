import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Record a completed cognitive/memory game session to Supabase.
 */
export async function saveMemorySession({
  patientId,
  totalRounds = 5,
  correctCount = 0,
  accuracy = null,
  score = null,
  summary = '',
}) {
  if (!isSupabaseConfigured || !patientId) {
    return { data: null, error: new Error('Supabase is not configured or patient ID is missing.') };
  }

  const safeTotalRounds = Math.max(0, parseInt(totalRounds, 10) || 0);
  const safeCorrectCount = Math.max(0, Math.min(safeTotalRounds, parseInt(correctCount, 10) || 0));

  // Compute accuracy consistently and strictly clamp between 0 and 100
  const rawAccuracy =
    accuracy !== null && !isNaN(accuracy)
      ? Number(Number(accuracy).toFixed(2))
      : safeTotalRounds > 0
      ? Number(((safeCorrectCount / safeTotalRounds) * 100).toFixed(2))
      : 0;
  const computedAccuracy = Math.min(100, Math.max(0, rawAccuracy));

  const computedScore =
    score !== null && !isNaN(score)
      ? parseInt(score, 10)
      : safeCorrectCount * 10;

  const sessionSummary =
    summary ||
    `Recognized ${safeCorrectCount} of ${safeTotalRounds} family members correctly (${computedAccuracy}% accuracy).`;

  const { data, error } = await supabase
    .from('memory_sessions')
    .insert([
      {
        patient_id: patientId,
        total_rounds: safeTotalRounds,
        correct_count: safeCorrectCount,
        accuracy: computedAccuracy,
        score: computedScore,
        summary: sessionSummary,
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch recent memory/cognitive game sessions for a patient from Supabase.
 */
export async function getMemorySessions(patientId, limit = 50) {
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
 * Compute aggregate statistics for patient cognitive performance.
 */
export async function getPatientStats(patientId) {
  if (!isSupabaseConfigured || !patientId) {
    return {
      data: { totalSessions: 0, avgAccuracy: 0, totalScore: 0, totalCorrect: 0 },
      error: null,
    };
  }

  const { data, error } = await supabase
    .from('memory_sessions')
    .select('accuracy, score, correct_count, total_rounds')
    .eq('patient_id', patientId);

  if (error || !data || data.length === 0) {
    return {
      data: { totalSessions: 0, avgAccuracy: 0, totalScore: 0, totalCorrect: 0 },
      error,
    };
  }

  const totalSessions = data.length;
  const totalScore = data.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
  const totalCorrect = data.reduce((sum, s) => sum + (Number(s.correct_count) || 0), 0);
  const avgAccuracy = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        data.reduce((sum, s) => sum + Math.min(100, Math.max(0, Number(s.accuracy) || 0)), 0) / totalSessions
      )
    )
  );

  return {
    data: {
      totalSessions,
      avgAccuracy,
      totalScore,
      totalCorrect,
    },
    error: null,
  };
}

/**
 * Update an existing memory session (e.g. to attach AI reflection).
 */
export async function updateMemorySession(sessionId, updates) {
  if (!isSupabaseConfigured || !sessionId) {
    return { data: null, error: new Error('Missing session ID or configuration.') };
  }

  const { data, error } = await supabase
    .from('memory_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  return { data, error };
}

/**
 * Attach or sync AI Reflection / Report to the memory session so connected caretakers see it.
 */
export async function attachAiReflectionToSession({ sessionId, patientId, aiReflection, baseSummary }) {
  if (!isSupabaseConfigured || !aiReflection) return { data: null, error: null };

  const cleanAi = aiReflection.trim();
  const cleanBase = (baseSummary || '').split('\n\n[AI Report]:')[0].trim();
  const formattedSummary = cleanBase
    ? `${cleanBase}\n\n[AI Report]: ${cleanAi}`
    : `[AI Report]: ${cleanAi}`;

  if (sessionId) {
    return await updateMemorySession(sessionId, { summary: formattedSummary });
  }

  if (patientId) {
    const { data: latestSessions } = await getMemorySessions(patientId, 1);
    if (latestSessions && latestSessions.length > 0) {
      return await updateMemorySession(latestSessions[0].id, { summary: formattedSummary });
    }
  }

  return { data: null, error: new Error('Unable to find session to attach AI report.') };
}

/**
 * Real-time subscription to cognitive game session logs for a patient.
 */
export function subscribeToMemorySessions(patientId, callback) {
  if (!isSupabaseConfigured || !patientId) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`memory_sessions:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memory_sessions',
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

