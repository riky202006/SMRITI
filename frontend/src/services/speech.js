/**
 * SMRITI Web Speech API Service
 * 1. Windows / Native SpeechSynthesis for Text-to-Speech Accessibility.
 * 2. Web SpeechRecognition for Patient Voice-Answer Recognition.
 */

let cachedVoices = [];

// Initialize voices and listen for voice load events in Windows/Chromium
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices() || [];
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    };
  }
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Get all loaded speech synthesis voices from Windows / browser.
 */
export function getAvailableVoices() {
  if (!isSpeechSupported()) return [];
  if (!cachedVoices || cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
  return cachedVoices;
}

/**
 * Find the optimal Windows speech engine voice (e.g. Microsoft Natural/Desktop voices).
 */
export function getBestWindowsVoice(lang = 'en-US') {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Check for Microsoft Windows Desktop voices
  const microsoftVoice = voices.find(
    (v) =>
      v.name.includes('Microsoft') &&
      (v.lang.startsWith(lang.substring(0, 2)) || v.lang.startsWith('en'))
  );
  if (microsoftVoice) return microsoftVoice;

  // 2. Check for English language match
  const langMatch = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  if (langMatch) return langMatch;

  // 3. Fallback to any English voice
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) return enVoice;

  return voices[0];
}

/**
 * Normalize spoken text by removing punctuation, lowercasing, and trimming excess whitespace.
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match a recognized transcript (and its alternatives) against available multiple-choice options.
 * Returns the exact matched option string from `options`, or null if no option matches.
 * Handles phrases like "my mother", "this is mother", "it's Anita".
 */
export function matchTranscriptToOptions(transcripts, options) {
  if (!transcripts || !options || options.length === 0) return null;

  const normOptions = options.map((opt) => ({
    original: opt,
    normalized: normalizeText(opt),
  }));

  for (const rawText of transcripts) {
    const normSpoken = normalizeText(rawText);
    if (!normSpoken) continue;

    // 1. Exact match
    const exact = normOptions.find((o) => o.normalized === normSpoken);
    if (exact) return exact.original;

    // 2. Word token match (e.g. "my mother" -> ["my", "mother"] contains "mother")
    const words = normSpoken.split(' ');
    const wordMatch = normOptions.find((o) => words.includes(o.normalized));
    if (wordMatch) return wordMatch.original;

    // 3. Substring match (e.g. "this is mother" contains "mother" where len >= 3)
    const subMatch = normOptions.find(
      (o) => o.normalized.length >= 3 && normSpoken.includes(o.normalized)
    );
    if (subMatch) return subMatch.original;
  }

  return null;
}

/**
 * Speak text aloud using Windows Speech / browser SpeechSynthesis engine.
 * Automatically cancels previous speech and safely handles Chromium audio queue state.
 */
export function speakText(text, { rate = 0.9, pitch = 1.0, lang = 'en-US' } = {}) {
  if (!isSpeechSupported() || !text) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = lang;

    const bestVoice = getBestWindowsVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onerror = (e) => {
      console.warn('[SpeechService] Utterance error:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[SpeechService] Error during speech synthesis:', err);
  }
}

/**
 * Cancel and stop any ongoing speech.
 */
export function stopSpeech() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('[SpeechService] Error stopping speech:', err);
  }
}
