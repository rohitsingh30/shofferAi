---
name: orient-fan
description: Buy fans, coolers, or home appliances on Orient Electric — ceiling fans, BLDC fans, tower fans, air coolers, geysers.
triggers:
  - orient fan
  - orient electric
  - buy ceiling fan
  - orient ceiling fan
  - buy cooler orient
  - orient bldc fan
  - orient tower fan
  - orient air cooler
  - buy fan online
siteUrl: https://www.orientelectric.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "ceiling fan", "BLDC fan", "tower fan", "desert cooler", "room cooler", "geyser")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 5000")
  - name: room_size
    required: false
    hint: Room size or preference (e.g. "large room", "small bedroom", "hall")
---

# Orient Electric — Fans, Coolers & Appliances

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. Orient Electric product categories:
  - **Ceiling Fans**: decorative, BLDC (energy saving), high-speed, premium, anti-dust
  - **Table/Wall/Pedestal Fans**: portable fans for personal use
  - **Tower Fans**: bladeless tower design for rooms
  - **Exhaust Fans**: kitchen, bathroom, industrial exhaust
  - **Air Coolers**: desert coolers (large rooms), personal coolers (small rooms), tower coolers
  - **Geysers**: instant, storage (15L/25L), gas geysers
  - **LED Lighting**: bulbs, battens, panels, downlights
- Use `ask_user` to clarify: product type, room size, color preference, sweep size (for fans), budget.
- For ceiling fans: ask about sweep size (600mm/900mm/1200mm/1400mm), BLDC vs regular, decorative vs plain.
- For coolers: ask room size (personal <150sqft, desert >150sqft), tank capacity preference.

### 2. Open Orient Electric in a NEW Tab
- Open a NEW tab and navigate to `https://www.orientelectric.com`.
- Take snapshot. Dismiss any popups or banners.
- Verify logged in (account icon or user profile visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Filter Products
- Navigate to the appropriate product category (Fans / Coolers / Geysers / Lighting).
- Apply filters: price range, sweep size (fans), type (BLDC/decorative/high-speed), capacity (coolers/geysers).
- Take snapshot of product listing page.
- Extract top 3-5 options with: product name, price (MRP vs sale price), key specs (sweep, air delivery, power consumption, star rating), color options.
- Use `ask_user` (input_type "choice") to present options:
  - "Product Name -- Rs.XXX -- Sweep: XXmm / Capacity: XXL -- Air Delivery: XXX cmm -- Power: XX watts -- Color"
- If user wants to see more, scroll or navigate to next page.

### 4. View Product Details
- Click the selected product.
- Take snapshot of product detail page.
- Extract: full product name, price, MRP, discount %, specifications (sweep/capacity, air delivery, RPM, power consumption, BEE star rating, noise level, warranty).
- If product has color variants, present via `ask_user` (input_type "choice").
- Highlight key features: "BLDC motor saves 65% energy", "Anti-dust coating", "Remote control included".
- For coolers: mention auto-fill, ice chamber, castors, honeycomb pads.
- Confirm with user: "Add [product] in [color] at Rs.XXX to cart?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons or discount codes.
- Use `confirm_action` to present order summary:
  - Product: name, color, specifications
  - Price: MRP, sale price, discount
  - Quantity: number of units
  - Delivery: estimated date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/add delivery address. Use `ask_user` for new address if needed.
- Use `collect_payment`:
  - summary: JSON with product, specs, color, price, delivery, total
  - amount_inr: total amount
  - description: "Orient Electric online order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Orient Electric (UPI, card, net banking, COD if available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product name, color, specifications, price paid, estimated delivery date, warranty details.
- Mention: "Free installation available for ceiling fans in select cities. Track your order at orientelectric.com."

## Site Notes

- Orient Electric is a leading Indian brand for fans, coolers, and lighting (CK Birla Group).
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- BLDC fans are 2-3x costlier but save 65% electricity -- recommend for high-usage rooms.
- Ceiling fan sweep guide: 600mm (small rooms), 1200mm (standard rooms), 1400mm (large halls).
- Orient provides free installation for ceiling fans in select metros. Check during checkout.
- Warranty: 2 years on fans (some premium models 5 years), 2 years on coolers, 5 years on geysers.
- BEE star rating: 5-star fans consume less power. BLDC fans are inherently 5-star rated.
- Delivery: 3-7 business days depending on location. Free delivery on most products above Rs 500.
- Orient often has seasonal sales (summer: fans/coolers, winter: geysers) -- check for active offers.
- For bulk orders (builders/offices), Orient has a separate B2B channel -- inform user if applicable.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response at each step.
