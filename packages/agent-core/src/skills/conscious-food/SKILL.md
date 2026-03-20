---
name: conscious-food
description: Buy organic and clean-label food from Conscious Food — specialty grains, flours, sweeteners, oils, and health foods.
triggers:
  - conscious food
  - conscious food order
  - buy organic food online
  - clean label food
  - conscious food products
  - specialty organic food
  - buy healthy staples online
  - conscious food grains
  - organic specialty items
siteUrl: https://www.consciousfood.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "organic jaggery, ragi flour, wild honey, rock salt, foxtail millet")
  - name: quantity
    required: false
    hint: Quantity or size (e.g. "500g", "1kg", "2 packs")
  - name: dietary_need
    required: false
    hint: Dietary need (gluten-free, diabetic-friendly, vegan, raw food)
---

# Conscious Food Organic & Clean Food Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect missing information
**EXTRACT FIRST**: If the user already mentioned items in their message, use those directly — do NOT ask again.
Only call `ask_user` for information NOT already in the user's message.

- If items ARE in the message but address is NOT → call `ask_user` with `input_type: "layout"` with ONE section: **address** (type: "address", required). Show saved addresses if available.
- If BOTH items and address are missing → call `ask_user` with `input_type: "layout"` and two sections:
  1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
  2. **items** (type: "card_grid", required): Show common items as cards with emoji. Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, these sites show ZERO products.

### 1. Gather Requirements
- Identify what the user wants: specific specialty items or health-focused grocery shopping.
- If the user is vague (e.g. "want some clean organic food"), use `ask_user` (input_type "freetext"):
  "What Conscious Food products interest you? Categories: Ancient Grains & Millets (ragi, jowar, amaranth), Specialty Flours, Natural Sweeteners (jaggery, palm sugar, raw honey), Cold-Pressed Oils, Salts & Spices, Breakfast Items, or Health Foods (spirulina, moringa)."
- Ask about specific dietary needs: gluten-free, diabetic-friendly, vegan, raw food.
- Check if buying for a specific recipe or general pantry stocking.

### 2. Open Conscious Food & Verify Login
- Open a NEW tab and navigate to `https://www.consciousfood.com`.
- Take snapshot. Verify logged in (check for account/profile icon).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or subscription banner.

### 3. Browse & Search Products
- Use search bar or browse categories: Grains, Flours, Sweeteners, Oils, Spices, Health Foods.
- Take snapshot of product listings.
- For each item, extract: product name, description, weight/size, price, organic certification, key benefits.
- If multiple variants or sizes, use `ask_user` (input_type "choice"):
  "Product Name — Weight — ₹XXX — Organic: Yes/No — Notes: stone-ground/unrefined/wild-sourced"
- Highlight specialty attributes: single-origin, stone-ground, unrefined, hand-processed, wild-harvested.
- If item is out of stock, suggest alternatives from the conscious range.
- Repeat for all items.

### 4. Add to Cart & Apply Discounts
- Add each product to cart with correct quantity.
- Check for bundles or theme packs: Immunity Kit, Millet Collection, Baking Essentials.
- If a bundle saves money vs individual items, suggest it.
- Apply any active coupon codes or first-order discounts from the site.
- Check if minimum order qualifies for free delivery.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with description, weight, quantity, and price
  - Special product notes (organic, stone-ground, unrefined, etc.)
  - Subtotal
  - Discount / coupon savings
  - Delivery charges
  - Total payable
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if address is needed.
- Use `collect_payment`:
  - summary: JSON with products, weights, quantities, specialty notes, prices, total
  - amount_inr: total payable amount
  - description: "Conscious Food order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Conscious Food.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.
- Mention: "Conscious Food has been pioneering organic food in India since 1990 — all products are minimally processed and chemical-free."
- Storage tips if applicable: "Store flours and grains in airtight containers. Refrigerate cold-pressed oils after opening."

## Site Notes

- Conscious Food is one of India's oldest organic food brands (since 1990) — focused on clean-label, minimally processed products.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Specialty products include: Himalayan Rock Salt, Wild Forest Honey, Stone-Ground Flours, Sprouted Ragi, Palm Jaggery.
- Products are often single-origin and artisan-produced — expect premium pricing compared to mainstream brands.
- Many items are unique to Conscious Food and not available on BigBasket/Amazon (e.g. certain wild honey variants, heritage grains).
- Free delivery above ₹500-700 typically. Delivery takes 5-10 business days pan-India.
- Shelf life is shorter than conventional products (no preservatives) — typically 3-9 months depending on product.
- Packaging is often eco-friendly (glass jars, paper bags) — aligns with sustainability-conscious buyers.
- Good for gifting — curated hampers available for festivals and special occasions.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
