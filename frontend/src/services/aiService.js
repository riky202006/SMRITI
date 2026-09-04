import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Sends a prompt to the secure server-side Supabase Edge Function (`smriti-assistant`).
 * The Edge Function verifies that the active session belongs to an authenticated PATIENT
 * and invokes Gemini AI using the server-side GEMINI_API_KEY secret.
 *
 * @param {Object} params
 * @param {string} params.prompt - The patient message or query.
 * @param {Object} [params.context] - Optional structured metadata (e.g. current page, recent game stats).
 * @returns {Promise<{ success: boolean, reply?: string, model?: string, timestamp?: string, error?: string }>}
 */
export async function sendPromptToAssistant({ prompt, context = {} }) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return { success: false, error: 'Please enter a message for the assistant.' };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'SMRITI Assistant is currently offline (Supabase backend is not configured).',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('smriti-assistant', {
      body: { prompt: prompt.trim(), context },
    });

    if (error) {
      console.error('[aiService] Edge Function invoke error:', error);
      let errorDetails = error.message || 'Unable to connect to SMRITI Assistant.';

      // Attempt to parse JSON error details sent from Edge Function
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errBody = await error.context.json();
          if (errBody?.detail) {
            errorDetails = `${errBody.error || 'AI Assistant Error'}: ${errBody.detail}`;
          } else if (errBody?.error) {
            errorDetails = errBody.error;
          }
        } catch {}
      }

      const status = error.context?.status || error.status;
      if (status === 401) {
        return { success: false, error: 'Your session has expired. Please sign in again.' };
      }
      if (status === 403) {
        return {
          success: false,
          error: 'SMRITI Assistant is available exclusively to Patient accounts.',
        };
      }
      if (status === 503) {
        return {
          success: false,
          error: errorDetails || 'AI Assistant service is currently unconfigured. Please configure GEMINI_API_KEY in Edge Function secrets.',
        };
      }

      return {
        success: false,
        error: errorDetails,
      };
    }

    if (data?.error) {
      return { success: false, error: data.detail ? `${data.error} (${data.detail})` : data.error };
    }

    return {
      success: true,
      reply: data?.reply || 'I am here with you. How can I help today?',
      model: data?.model || 'gemini-2.5-flash',
      timestamp: data?.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || 'Network error connecting to SMRITI Assistant.',
    };
  }
}
