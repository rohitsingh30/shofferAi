/**
 * Formats the raw value from an InputPrompt response into a user-friendly
 * display string for the chat message bubble.
 *
 * Extracted from ChatInterface.tsx so it's independently testable.
 */

interface PendingInputLike {
  inputType: string;
  options?: string[];
  cards?: Array<{ id: string; label: string }>;
}

export function formatSelectionLabel(
  pendingInput: PendingInputLike,
  value: string,
): string {
  // Card-based inputs (card_grid, carousel, product_card)
  if (pendingInput.cards?.length) {
    const card = pendingInput.cards.find((c) => c.id === String(value));
    if (card) return card.label;
  }

  // Product card — user tapped Pay Now or similar action
  if (pendingInput.inputType === 'product_card') {
    if (value === 'proceed_to_pay') return '💳 Proceeding to payment';
    if (value === 'added_to_cart') return '🛒 Added to cart';
  }

  // Choice / chip_bar — value is 1-based index
  if (pendingInput.options?.length) {
    const idx = parseInt(value, 10);
    if (!isNaN(idx) && pendingInput.options[idx - 1]) {
      return pendingInput.options[idx - 1];
    }
  }

  // Address — value is JSON like {"label":"Home","address":"..."}
  if (pendingInput.inputType === 'address') {
    try {
      const addr = JSON.parse(value) as { label?: string; address?: string };
      if (addr.label && addr.address) return `📍 ${addr.label} — ${addr.address}`;
      if (addr.address) return `📍 ${addr.address}`;
    } catch {
      // not JSON — fall through
    }
  }

  // Calendar / date — value is ISO date or range like "2026-03-22"
  if (pendingInput.inputType === 'calendar') {
    try {
      const parsed = JSON.parse(value) as { start?: string; end?: string };
      if (parsed.start && parsed.end) return `📅 ${parsed.start} → ${parsed.end}`;
      if (parsed.start) return `📅 ${parsed.start}`;
    } catch {
      // might be a plain date string
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `📅 ${value}`;
    }
  }

  // Stepper / counter — value is JSON like {"Adults":2,"Children":1}
  if (pendingInput.inputType === 'stepper') {
    try {
      const counters = JSON.parse(value) as Record<string, number>;
      const parts = Object.entries(counters)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`);
      if (parts.length) return parts.join(', ');
    } catch {
      // not JSON — fall through
    }
  }

  // Confirmation — display "Yes" / "No" instead of "true" / "false"
  if (pendingInput.inputType === 'confirmation') {
    if (value === 'true' || value === 'yes') return '✅ Yes';
    if (value === 'false' || value === 'no') return '❌ No';
  }

  // Fallback: if value looks like JSON, try to extract something readable
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      const obj = JSON.parse(value);
      // Array → join labels or values
      if (Array.isArray(obj)) {
        const labels = obj.map((x) => x.label || x.name || String(x));
        return labels.join(', ');
      }
      // Object with label/name/address → pick the most readable field
      if (obj.label) return String(obj.label);
      if (obj.name) return String(obj.name);
      if (obj.address) return String(obj.address);
    } catch {
      // not valid JSON — fall through
    }
  }

  // Plain text — return as-is
  return value;
}
