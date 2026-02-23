/**
 * Validates a Senegalese phone number.
 * Accepts: 7x xxx xx xx, +221 7x xxx xx xx, 00221 7x xxx xx xx
 * Valid prefixes: 70, 75, 76, 77, 78 (mobile) and 33 (fixed)
 */
export function isValidSenegalPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-\.\(\)]/g, '');
  return /^(\+221|00221)?(7[0-8]|33)\d{7}$/.test(cleaned);
}

export function formatSenegalPhone(value: string): string {
  const cleaned = value.replace(/[\s\-\.\(\)]/g, '').replace(/^(\+221|00221)/, '');
  if (cleaned.length === 9) {
    return `+221 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  return value;
}
