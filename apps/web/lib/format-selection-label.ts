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
  stores?: Array<{
    store: string;
    cards?: Array<{ id: string; label: string }>;
  }>;
}

export function formatSelectionLabel(
  pendingInput: PendingInputLike,
  value: string,
): string {
  // Multi-store carousel: value is '[{"store":"BigBasket","id":"...","qty":1},...]'
  if (pendingInput.inputType === 'multi_store_carousel' && value.startsWith('[')) {
    try {
      const arr = JSON.parse(value) as Array<{ store?: string; id: string; qty?: number }>;
      if (Array.isArray(arr) && arr.length > 0) {
        const stores = pendingInput.stores || [];
        const labels = arr.map((sel) => {
          const section = stores.find((s) => s.store === sel.store);
          const card = section?.cards?.find((c) => c.id === sel.id);
          const name = card?.label ?? sel.id;
          const qty = sel.qty && sel.qty > 1 ? ` ×${sel.qty}` : '';
          const storeLabel = sel.store ? ` from ${sel.store}` : '';
          return `${name}${qty}${storeLabel}`;
        });
        return `🛒 Added: ${labels.join(', ')}`;
      }
    } catch {
      // fall through
    }
  }

  // Card-based inputs (card_grid, carousel, product_card)
  if (pendingInput.cards?.length) {
    // Instant-add response shape: '[{"id":"...","qty":1},...]' — multi-pick array.
    if (value.startsWith('[')) {
      try {
        const arr = JSON.parse(value) as Array<{ id: string; qty?: number }>;
        if (Array.isArray(arr) && arr.length > 0) {
          const labels = arr.map((sel) => {
            const c = pendingInput.cards!.find((card) => card.id === sel.id);
            const name = c?.label ?? sel.id;
            const qty = sel.qty && sel.qty > 1 ? ` ×${sel.qty}` : '';
            return `${name}${qty}`;
          });
          return `🛒 Added: ${labels.join(', ')}`;
        }
      } catch {
        // fall through
      }
    }
    // Single id (legacy carousel-pick mode)
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

  // Layout — unwrap section values and format the first readable one
  if (pendingInput.inputType === 'layout') {
    try {
      const sections = JSON.parse(value) as Record<string, unknown>;
      const labels: string[] = [];
      for (const val of Object.values(sections)) {
        if (typeof val === 'string') {
          labels.push(val);
        } else if (typeof val === 'object' && val !== null) {
          const obj = val as Record<string, unknown>;
          if (obj.label && obj.address) labels.push(`📍 ${obj.label} — ${obj.address}`);
          else if (obj.address && typeof obj.address === 'string') labels.push(`📍 ${obj.address}`);
          else if (obj.label) labels.push(String(obj.label));
          else if (obj.name) labels.push(String(obj.name));
          else if (Array.isArray(val)) labels.push(val.map((x: unknown) => (x as Record<string, unknown>).label || String(x)).join(', '));
        }
      }
      if (labels.length) return labels.join(' · ');
    } catch {
      // not JSON — fall through
    }
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
      if (obj.address) return typeof obj.address === 'string' ? String(obj.address) : (obj.label ? String(obj.label) : JSON.stringify(obj.address));
    } catch {
      // not valid JSON — fall through
    }
  }

  // Plain text — return as-is
  return value;
}
