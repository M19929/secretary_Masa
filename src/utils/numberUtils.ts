/**
 * Utility functions for Arabic/Eastern and Western numeral conversion and parsing.
 * Converts Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩), Persian digits (۰۱۲۳۴۵۶۷۸۹),
 * Arabic decimal separators (٫ ،), and removes commas or extraneous text,
 * ensuring users can type normal numbers on ANY keyboard (Arabic, English, mobile keypad).
 */

export function normalizeNumberInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  
  const arabicEasternDigits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٫': '.', '،': '.', ',': ''
  };

  // Convert Arabic & Persian digits and decimal separators
  let normalized = str.replace(/[٠-٩۰-۹٫،,]/g, (char) => arabicEasternDigits[char] ?? char);
  
  // Keep only digits and at most one decimal point
  normalized = normalized.replace(/[^\d.]/g, '');
  
  const parts = normalized.split('.');
  if (parts.length > 2) {
    normalized = parts[0] + '.' + parts.slice(1).join('');
  }

  return normalized;
}

export function parseNumberSafe(val: string | number | undefined | null, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const normalized = normalizeNumberInput(val);
  const num = parseFloat(normalized);
  return isNaN(num) ? fallback : num;
}
