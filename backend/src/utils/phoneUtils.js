/**
 * Utility functions for normalizing and formatting phone numbers to E.164 standard.
 */

/**
 * Normalizes phone number into E.164 standard format.
 * Examples:
 * - '8607405507' -> '+918607405507'
 * - '+91 86074 05507' -> '+918607405507'
 * - '918607405507' -> '+918607405507'
 * - '08607405507' -> '+918607405507'
 * - '+1 (737) 250-8034' -> '+17372508034'
 * - 'whatsapp:+91 86074 05507' -> 'whatsapp:+918607405507'
 *
 * @param {string} raw - The raw input phone number
 * @param {string} defaultCountryCode - Default country code (defaults to '+91' for India)
 * @returns {string|null} - The normalized E.164 phone number, or null if invalid
 */
function normalizePhoneNumber(raw, defaultCountryCode = '+91') {
  if (!raw) return null;
  let str = String(raw).trim();
  if (!str) return null;

  const isWhatsApp = str.toLowerCase().startsWith('whatsapp:');
  if (isWhatsApp) {
    str = str.slice(9).trim();
  }

  // Remove spaces, parentheses, hyphens, and dots
  str = str.replace(/[\s\-\(\)\.]/g, '');

  // Handle leading 00 (international format in some regions)
  if (str.startsWith('00')) {
    str = '+' + str.slice(2);
  } else if (str.startsWith('0') && str.length === 11) {
    // 11-digit starting with 0 (e.g., 08607405507 -> 8607405507)
    str = str.slice(1);
  }

  // If no leading '+'
  if (!str.startsWith('+')) {
    if (str.length === 10) {
      str = defaultCountryCode + str;
    } else if (str.length === 12 && str.startsWith('91')) {
      str = '+' + str;
    } else {
      str = '+' + str;
    }
  }

  // Basic validation: must have at least '+' and 8-15 digits
  const digitCount = str.replace(/[^0-9]/g, '').length;
  if (digitCount < 8 || digitCount > 15) {
    return null;
  }

  return isWhatsApp ? `whatsapp:${str}` : str;
}

/**
 * Mask phone number for logging and public API display (e.g. +918607405507 -> ******5507)
 */
function maskPhoneNumber(phone) {
  if (!phone) return '';
  const phoneStr = String(phone).trim();
  const clean = phoneStr.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '******';
  const last4 = clean.slice(-4);
  return `******${last4}`;
}

module.exports = {
  normalizePhoneNumber,
  maskPhoneNumber
};
