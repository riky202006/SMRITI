/**
 * Utility functions for generating and validating human-friendly SMRITI connection codes.
 *
 * Format: SMRITI-XXXXXX (e.g. SMRITI-X7K9P2)
 * Charset: 32 alphanumeric characters excluding ambiguous 0, O, 1, I.
 */

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;
const PREFIX = 'SMRITI-';

/**
 * Generate a random 6-character uppercase alphanumeric SMRITI connection code.
 * Excludes ambiguous characters (0, O, 1, I).
 * Immediate local generation with 0ms latency.
 *
 * @returns {string} e.g. "SMRITI-X7K9P2"
 */
export function generateSmritiCode() {
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(CODE_LENGTH);
    crypto.getRandomValues(randomBytes);
    for (let i = 0; i < CODE_LENGTH; i++) {
      result += CHARSET[randomBytes[i] % CHARSET.length];
    }
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * CHARSET.length);
      result += CHARSET[randomIndex];
    }
  }
  return `${PREFIX}${result}`;
}

/**
 * Check if a code matches the SMRITI-XXXXXX format.
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isValidSmritiCode(code) {
  if (!code || typeof code !== 'string') return false;
  const regex = /^SMRITI-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/i;
  return regex.test(code.trim());
}

/**
 * Check if a string is a standard UUID format.
 *
 * @param {string} str
 * @returns {boolean}
 */
export function isValidUuid(str) {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
}

/**
 * Normalizes user input for connection codes.
 * - Trims whitespace
 * - If user entered 6 characters without "SMRITI-", automatically prepends "SMRITI-"
 * - Uppercases SMRITI code
 * - Preserves UUID if a legacy UUID is entered
 *
 * @param {string} input
 * @returns {string}
 */
export function normalizeConnectionCode(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  // If already UUID, return as-is
  if (isValidUuid(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Remove leading/trailing spaces and uppercase
  const upper = trimmed.toUpperCase();

  // If already starts with SMRITI-, return normalized
  if (upper.startsWith(PREFIX)) {
    return upper;
  }

  // If user typed only the 6-character code (e.g. "X7K9P2")
  if (upper.length === CODE_LENGTH && /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ0-9A-Z]{6}$/.test(upper)) {
    return `${PREFIX}${upper}`;
  }

  return upper;
}

/**
 * Check if a normalized code is valid (either SMRITI format or legacy UUID).
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isValidConnectionCode(code) {
  if (!code) return false;
  const normalized = normalizeConnectionCode(code);
  return isValidSmritiCode(normalized) || isValidUuid(normalized);
}
