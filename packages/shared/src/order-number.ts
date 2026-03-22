import { randomBytes } from 'crypto';

/**
 * Generate an order number in the format SHOF-YYYYMMDD-XXXX.
 * The 4-char hex suffix gives 65,536 combinations per day.
 */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = randomBytes(2).toString('hex').toUpperCase().slice(0, 4);
  return `SHOF-${date}-${suffix}`;
}
