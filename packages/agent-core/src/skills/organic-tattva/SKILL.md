---
name: organic-tattva
description: Buy certified organic groceries from Organic Tattva — dal, rice, spices, flours, oils, and pantry essentials.
triggers:
  - organic tattva
  - buy organic dal
  - organic groceries online
  - organic tattva order
  - buy organic rice
  - organic spices online
  - organic tattva grocery
  - certified organic food
  - organic pantry staples
siteUrl: https://www.organictattva.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "organic toor dal 1kg, basmati rice, turmeric powder, cold pressed coconut oil")
  - name: quantity
    required: false
    hint: Quantity or pack size (e.g. "1kg", "500g", "5kg bulk")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Organic Tattva Grocery Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address and shopping list
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
2. **items** (type: "card_grid", required): Ask what items to buy. Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, these sites show ZERO products.

### 1. Gather Requirements
- Identify what the user wants: specific organic grocery items or pantry restocking.
- If the user is vague (e.g. "want organic groceries"), use `ask_user` (input_type "freetext"):
  "What organic groceries are you looking for? Categories include: Dals & Pulses, Rice & Grains, Spices & Masalas, Flours (atta, besan, ragi), Oils, Sweeteners (jaggery, honey), Dry Fruits, or Ready-to-Cook."
- Ask about quantity preferences: standard pack (500g/1kg) or bulk (5kg).
- Check if they want a curated combo (e.g. "Monthly Kitchen Essentials") or individual items.

### 2. Open Organic Tattva & Verify Login
- Open a NEW tab and navigate to `https://www.organictattva.com`.
- Take snapshot. Verify logged in (check for account icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or newsletter signup.

### 3. Search & Browse Products
- Use search bar or browse categories: Dals, Rice, Spices, Flours, Oils, Sweeteners, Ready-to-Cook.
- Take snapshot of product listings.
- For each item, extract: product name, variant, weight/size, price, MRP, discount, organic certification.
- If multiple sizes (500g/1kg/5kg) or variants, use `ask_user` (input_type "choice"):
  "Product Name — Weight — ₹XXX (MRP ₹YYY) — Certified: [USDA/India Organic] — Per kg: ₹ZZZ"
- Show per-kg price for easy comparison across sizes.
- If item is out of stock, suggest close alternatives within the organic range.
- Repeat for all requested items.

### 4. Add to Cart & Check Offers
- Add each product to cart with correct quantity.
- Check for combo/bundle offers: monthly kitchen packs, spice boxes, pantry bundles.
- If a combo saves money, suggest it: "Monthly Essentials Pack for ₹XXX includes X items (save ₹YYY vs individual)."
- Apply available coupon codes — check banner and checkout page for active offers.
- Check for first-order or bulk-order discounts.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with variant, weight, quantity, and price
  - All items marked with organic certification status
  - Subtotal
  - Discount / coupon savings
  - Delivery charges (free delivery threshold)
  - Total payable
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if address is needed.
- Use `collect_payment`:
  - summary: JSON with products, weights, quantities, certifications, prices, total
  - amount_inr: total payable amount
  - description: "Organic Tattva grocery order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Organic Tattva.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered with weights, total paid, estimated delivery date.
- Mention: "All products are certified organic (USDA/India Organic) — free from pesticides, chemicals, and GMOs."

## Site Notes

- Organic Tattva is one of India's oldest organic grocery brands — certified by USDA Organic, India Organic, and EU Organic.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Popular products: Organic Toor Dal, Chana Dal, Moong Dal, Basmati Rice, Turmeric Powder, Cumin, Red Chilli Powder.
- All products carry at least one organic certification — look for USDA/India Organic/EU Organic logos on product page.
- Larger packs (5kg) offer 15-25% savings per kg compared to 500g packs — recommend for staples used daily.
- Free delivery above ₹599 usually. Standard delivery: 5-10 business days pan-India.
- Organic groceries are priced 30-50% higher than conventional — highlight the pesticide-free, chemical-free benefit.
- Monthly kitchen packs and combo boxes simplify pantry restocking — good for regular organic buyers.
- Shelf life varies: dals/rice 6-12 months, spices 12 months, oils 6-9 months. Check details on product page.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
