/**
 * Template variable detection and resolution for recorded scripts.
 *
 * During recording: detect which tool args match user-provided params → replace with {{param}}
 * During replay: resolve {{param}} back to actual values from new user input
 */

const DATE_PARAM_NAMES = ['checkin', 'checkout', 'date', 'check_in', 'check_out', 'departure', 'arrival'];

export function isDateParam(paramName: string): boolean {
  return DATE_PARAM_NAMES.some((d) => paramName.toLowerCase().includes(d));
}

/**
 * Generate common date format variants for matching.
 * Input: "2026-03-15" → ["2026-03-15", "March 15", "15 Mar", "15/03/2026", "03/15/2026", "Mar 15, 2026"]
 */
export function generateDateVariants(dateStr: string): string[] {
  const variants: string[] = [dateStr];

  // Try parsing as ISO date
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return variants;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  variants.push(
    `${months[month]} ${day}`,             // "March 15"
    `${day} ${monthsShort[month]}`,        // "15 Mar"
    `${monthsShort[month]} ${day}, ${year}`, // "Mar 15, 2026"
    `${dd}/${mm}/${year}`,                 // "15/03/2026"
    `${mm}/${dd}/${year}`,                 // "03/15/2026"
    `${year}-${mm}-${dd}`,                 // "2026-03-15"
    `${months[month]} ${day}, ${year}`,    // "March 15, 2026"
    `${day} ${months[month]} ${year}`,     // "15 March 2026"
  );

  return [...new Set(variants)];
}

/**
 * Detect which tool args map to user-provided param values.
 * Returns a binding map: argKey → paramName (or null if static).
 */
export function detectTemplateBindings(
  args: Record<string, unknown>,
  extractedParams: Record<string, string>
): Record<string, string | null> {
  const bindings: Record<string, string | null> = {};

  for (const [argKey, argValue] of Object.entries(args)) {
    if (typeof argValue !== 'string') {
      bindings[argKey] = null;
      continue;
    }

    let matched = false;

    for (const [paramName, paramValue] of Object.entries(extractedParams)) {
      if (!paramValue || paramValue.length < 2) continue;

      // Exact match
      if (argValue === paramValue) {
        bindings[argKey] = paramName;
        matched = true;
        break;
      }

      // Substring match (for URLs, compound strings) — require min 3 chars
      if (paramValue.length >= 3 && argValue.includes(paramValue)) {
        bindings[argKey] = `${paramName}:substring`;
        matched = true;
        break;
      }

      // Date variant matching
      if (isDateParam(paramName)) {
        const variants = generateDateVariants(paramValue);
        for (const variant of variants) {
          if (variant.length >= 3 && argValue.includes(variant)) {
            bindings[argKey] = `${paramName}:date`;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (!matched) bindings[argKey] = null;
  }

  return bindings;
}

/**
 * Replace concrete param values with {{param}} placeholders in tool args.
 */
export function templatizeArgs(
  args: Record<string, unknown>,
  bindings: Record<string, string | null>,
  extractedParams: Record<string, string>
): Record<string, unknown> {
  const result = { ...args };

  for (const [key, paramRef] of Object.entries(bindings)) {
    if (paramRef === null) continue;
    const paramName = paramRef.split(':')[0];
    const original = args[key];
    if (typeof original !== 'string') continue;

    const paramValue = extractedParams[paramName];
    if (!paramValue) continue;

    // For date params, try all variants
    if (paramRef.includes(':date')) {
      const variants = generateDateVariants(paramValue);
      let replaced = original;
      for (const variant of variants) {
        if (replaced.includes(variant)) {
          replaced = replaced.replace(variant, `{{${paramName}}}`);
          break;
        }
      }
      result[key] = replaced;
    } else {
      // Simple string replacement
      result[key] = original.replace(paramValue, `{{${paramName}}}`);
    }
  }

  return result;
}

/**
 * Resolve {{param}} placeholders back to actual values during replay.
 */
export function resolveTemplateArgs(
  args: Record<string, unknown>,
  params: Record<string, string>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string' && value.includes('{{')) {
      let resolved_value = value;
      for (const [paramName, paramValue] of Object.entries(params)) {
        resolved_value = resolved_value.replace(`{{${paramName}}}`, paramValue);
      }
      resolved[key] = resolved_value;
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}
