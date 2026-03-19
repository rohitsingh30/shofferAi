---
name: healthkart-supplements
description: Buy protein, vitamins, and supplements on HealthKart — search, compare brands, check authenticity, order.
triggers:
  - healthkart
  - buy protein
  - buy supplements
  - whey protein
  - healthkart order
  - buy vitamins healthkart
  - protein powder
  - supplement order
  - healthkart supplements
siteUrl: https://www.healthkart.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: Product name or type (e.g. "whey protein", "multivitamin", "creatine", "omega 3", "mass gainer")
  - name: brand
    required: false
    hint: Preferred brand (e.g. "MuscleBlaze", "Optimum Nutrition", "HealthKart HK Vitals")
  - name: quantity
    required: false
    hint: Quantity (default 1) or specific size (e.g. "2kg", "1kg")
---

# HealthKart Supplement Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: product type, brand preference, flavor preference, size/quantity.
- If user is vague (e.g. "need protein"), ask about:
  - Goal: muscle building, weight loss, general health, endurance.
  - Diet: vegetarian/vegan (for plant-based options) or whey is fine.
  - Budget: entry-level (₹500-1500) vs premium (₹2000-5000+).
- Use `ask_user` for missing info: "Any brand preference? What size do you need (1kg/2kg)?"

### 2. Open HealthKart & Verify Login
- Open a NEW tab and navigate to `https://www.healthkart.com`.
- Take snapshot. Verify logged in (check for account/profile section).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set delivery pincode if prompted.

### 3. Search & Browse Products
- Search for the product in the search bar. Take snapshot of results.
- Filter by: brand, price range, rating, flavor, size, discount.
- Extract top 5 products: name, brand, size, flavor options, MRP, selling price, discount %, rating, reviews count.
- Use `ask_user` (input_type "choice"):
  "Brand Product Name — Size — Flavor — ₹XXX (XX% off MRP ₹YYY) — ⭐ X.X (XXXX reviews)"
- Highlight HealthKart's own brands (MuscleBlaze, HK Vitals) — often best value.
- Mention authenticity guarantee for all products on HealthKart.

### 4. Select Variant
- Click selected product. Take snapshot of product page.
- Show available options: flavors, sizes (500g/1kg/2kg/5kg), pack combinations.
- Show price per serving calculation for easy comparison.
- Use `ask_user` (input_type "choice") to pick flavor and size.
- Check for combo deals or bundle offers (e.g. protein + shaker, stack discounts).

### 5. Review Cart
- Add to cart. Navigate to cart. Take snapshot.
- Use `confirm_action`:
  - Product name, brand, size, flavor
  - Quantity
  - MRP and selling price
  - Discount amount
  - Coupon applied (if any)
  - Delivery charges (free above ₹399 usually)
  - Total payable
  - Estimated delivery date
  - Authenticity guarantee: "100% genuine — HealthKart verified"
- Do NOT proceed unless user confirms.

### 6. Checkout & Payment
- Proceed to checkout. Verify delivery address.
- Apply best coupon code (check for first-order, bank, or seasonal discounts).
- Use `collect_payment`:
  - summary: JSON with products, sizes, flavors, quantities, prices, total
  - amount_inr: total payable
  - description: "HealthKart supplement order"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete payment (UPI/card/wallet/COD available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, products ordered, total paid, estimated delivery date.
- Remind: "Check for HealthKart authenticity seal on the product when delivered."
- Usage tip: suggest dosage/timing based on product (e.g. "Take 1 scoop with milk/water post-workout").
- Mention: "Track your order on HealthKart app or website."

## Site Notes

- HealthKart is India's largest sports nutrition and supplement platform — 100% authenticity guarantee.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- MuscleBlaze (HealthKart's own brand) offers best value-for-money in India.
- HK Vitals is HealthKart's daily health brand — multivitamins, omega-3, biotin at affordable prices.
- Imported brands (ON, Dymatize, MuscleTech) are 2-3x costlier but premium quality.
- HealthKart authenticity check: every product has a scratch code — verify on healthkart.com/authenticate.
- COD available but may have ₹50-100 extra charge on some orders.
- Delivery: 2-5 business days in metros, 5-7 days in smaller cities.
- Big discounts during sale events: HealthKart Birthday Sale, Republic Day, etc.
- For beginners: suggest whey protein concentrate (budget) over isolate (premium) unless lactose intolerant.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
