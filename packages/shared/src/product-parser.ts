import type { ProductCardData } from './types/agent';

// ─── Shopping Skills ────────────────────────────────────────────────

/** Skills where product detection should be active */
export const SHOPPING_SKILLS = new Set([
  'flipkart-shopping', 'myntra-shopping', 'amazon-shopping',
  'blinkit-grocery', 'zepto-grocery', 'swiggy-instamart',
  'boat-electronics',
]);

const SKILL_STORE_MAP: Record<string, string> = {
  'flipkart-shopping': 'Flipkart',
  'myntra-shopping': 'Myntra',
  'amazon-shopping': 'Amazon',
  'blinkit-grocery': 'Blinkit',
  'zepto-grocery': 'Zepto',
  'swiggy-instamart': 'Swiggy Instamart',
  'boat-electronics': 'Flipkart',
};

export function inferStoreFromSkill(skillName: string): string {
  return SKILL_STORE_MAP[skillName] || 'Store';
}

// ─── Product Detection ──────────────────────────────────────────────

/**
 * Heuristic: does this text look like a single-product presentation?
 * Must have a price AND at least 2 of: MRP, rating, delivery, bullet specs, offers.
 */
export function looksLikeProductPresentation(text: string): boolean {
  if (!text || text.length < 40) return false;

  const hasPrice = /₹[\d,]+/.test(text);
  if (!hasPrice) return false;

  const lower = text.toLowerCase();
  const hasMRP = /mrp|m\.r\.p/i.test(text) || /\d+%\s*off/i.test(text);
  const hasRating = /⭐|rating|reviews?\b|stars?\b/i.test(text);
  const hasDelivery = /delivery|🚚|delivered|dispatch/i.test(text);
  const bulletLines = text.split('\n').filter((l) => /^\s*[-•]/.test(l));
  const hasSpecs = bulletLines.length >= 2;
  const hasOffers = /₹\d+\s*off|bank\s*(card|offer)|cashback|coupon/i.test(text);
  const hasAssured = /assured|prime|express/i.test(lower);

  const indicators = [hasMRP, hasRating, hasDelivery, hasSpecs, hasOffers, hasAssured]
    .filter(Boolean).length;
  return indicators >= 2;
}

// ─── Product Extraction ─────────────────────────────────────────────

/**
 * Regex-based extraction of product data from unstructured text.
 * Best-effort: fills what it can, leaves rest undefined.
 */
export function extractProductData(text: string, store: string): ProductCardData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // ── Name: first meaningful line (strip trailing price if present)
  const firstLine = lines[0] || '';
  const nameMatch = firstLine.match(/^(.+?)(?:\s*[—–-]+\s*₹|$)/);
  const name = (nameMatch?.[1] || firstLine).replace(/^#+\s*/, '').trim();

  // ── Price: first ₹X,XXX occurrence
  const priceMatch = text.match(/₹([\d,]+)/);
  const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;

  // ── MRP: "MRP ₹X,XXX" or second ₹ in parentheses
  const mrpMatch = text.match(/MRP\s*[₹:]?\s*([\d,]+)/i)
    || text.match(/\(MRP\s*₹?([\d,]+)\)/i);
  const mrp = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : undefined;

  // ── Discount
  const discountMatch = text.match(/(\d+%\s*off)/i);
  const discount = discountMatch?.[1] || undefined;

  // ── Rating
  const ratingMatch = text.match(/⭐\s*([\d.]+)/)
    || text.match(/([\d.]+)\s*⭐/)
    || text.match(/([\d.]+)\s*(?:out of 5|\/5|rating|stars?)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

  // ── Rating count
  const ratingCountMatch = text.match(/([\d.]+[LKM]\+?)\s*(?:ratings?|reviews?)/i);
  const ratingCount = ratingCountMatch?.[1]
    ? `${ratingCountMatch[1]} reviews`
    : undefined;

  // ── Delivery
  const deliveryMatch = text.match(/(?:(?:🚚\s*)?Deliver(?:y|ed)\s*(?:by)?\s*|🚚\s*)(\d{1,2}\s+\w+(?:[,\s]+\w+)?)/i);
  const delivery = deliveryMatch?.[1]?.trim() || undefined;

  // ── Free delivery
  const deliveryFree = /free\s*delivery/i.test(text);

  // ── Specs: bullet lines that aren't price/rating/delivery/offers
  const specLines = lines
    .filter((l) => /^\s*[-•]/.test(l))
    .map((l) => l.replace(/^\s*[-•✅🚚💳⭐]\s*/, '').trim())
    .filter((l) => {
      // Exclude non-spec lines
      if (/^₹\d|delivery|off with|added to cart|assured|express/i.test(l)) return false;
      return l.length > 3;
    });

  // Split spec lines on · separator for compact specs
  const specs = specLines
    .flatMap((l) => l.split(/\s*·\s*/))
    .filter(Boolean)
    .slice(0, 6);

  // ── Offers
  const offers = lines
    .filter((l) => /₹\d+\s*off|bank|card\s*offer|cashback|coupon/i.test(l))
    .map((l) => l.replace(/^\s*[-•💳]\s*/, '').trim());

  // ── Color
  const colorMatch = text.match(/(?:Color|Colour)[:\s]+([^\n,]+)/i);
  const color = colorMatch?.[1]?.trim() || undefined;

  return {
    id: `product-${Date.now()}`,
    name,
    price,
    mrp,
    discount,
    rating,
    ratingCount,
    delivery,
    deliveryFree,
    specs: specs.length > 0 ? specs : undefined,
    offers: offers.length > 0 ? offers : undefined,
    color,
    store,
  };
}
