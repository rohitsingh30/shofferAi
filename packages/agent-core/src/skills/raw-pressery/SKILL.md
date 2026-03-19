---
name: raw-pressery
description: Order cold-pressed juices, smoothies, and cleanses from RAW Pressery — one-time purchase or subscription delivery.
triggers:
  - raw pressery
  - raw pressery juice
  - cold pressed juice
  - juice subscription
  - raw pressery order
  - buy cold pressed juice
  - juice cleanse online
  - raw pressery smoothie
  - healthy juice delivery
siteUrl: https://www.rawpressery.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to order (e.g. "Valencia orange juice, almond milk, green cleanse pack, mango smoothie")
  - name: order_type
    required: false
    hint: One-time purchase or subscription (daily/weekly/monthly)
  - name: address
    required: false
    hint: Delivery address or pincode for serviceability check
---

# RAW Pressery Cold-Pressed Juice Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific juices, smoothies, cleanses, or milk alternatives.
- If the user is vague (e.g. "order some healthy juice"), use `ask_user` (input_type "freetext"):
  "What kind of RAW Pressery products are you looking for? Options: Cold-Pressed Juices (Orange, Sugarcane, ABC), Smoothies, Nut Milks (Almond, Oat), Juice Cleanses (1-day/3-day/5-day), or Daily Packs."
- Ask about purpose: daily nutrition, detox/cleanse, immunity boost, fitness diet.
- Check if one-time purchase or subscription (daily/weekly delivery).
- Confirm delivery address for serviceability (RAW Pressery delivers in select cities).

### 2. Open RAW Pressery & Verify Login
- Open a NEW tab and navigate to `https://www.rawpressery.com`.
- Take snapshot. Verify logged in (check for account/profile section).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or first-order discount banner.
- Check if delivery is available at user's pincode. If not, inform the user.

### 3. Browse & Select Products
- Use search or browse categories: Juices, Smoothies, Nut Milks, Cleanses, Packs.
- Take snapshot of product listings.
- For each item, extract: product name, size (ml), price, key ingredients, shelf life, nutritional highlights.
- If multiple variants, use `ask_user` (input_type "choice"):
  "Product Name — Size — ₹XXX — Key ingredients: X, Y, Z — Calories: X kcal"
- For cleanse packs, show the full plan: what juices are included per day, total cost.
- If item unavailable in user's area, suggest alternatives.
- Repeat for all requested items.

### 4. Subscription Setup (if applicable)
- If user wants subscription, check available plans: daily, alternate days, weekly, monthly.
- Show subscription pricing vs one-time: "Subscribe for ₹XXX/delivery (save XX%) vs one-time ₹YYY"
- Use `ask_user` (input_type "choice") for frequency selection.
- Set start date and delivery schedule.
- If one-time, skip this step.

### 5. Review Cart
- Add products to cart. Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with size, quantity, and price
  - Subscription details (if any): frequency, per-delivery cost, commitment
  - Subtotal
  - Discount / coupon savings
  - Delivery charges
  - Total payable (first delivery or one-time total)
  - Delivery date/time window
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify delivery address and time slot.
- Use `ask_user` if address or delivery time preference needed.
- Apply available coupon codes or first-order discounts.
- Use `collect_payment`:
  - summary: JSON with products, sizes, quantities, prices, subscription details, total
  - amount_inr: total payable amount
  - description: "RAW Pressery juice order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on RAW Pressery.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, delivery date/window.
- If subscription, mention: "Your subscription is set for [frequency]. Manage or pause anytime from your account."
- Storage tip: "Store juices refrigerated. Consume within 3-5 days of delivery for best freshness."

## Site Notes

- RAW Pressery is India's leading cold-pressed juice brand — 100% natural, no added sugar, no preservatives.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Delivery is available only in select cities (Mumbai, Delhi, Bangalore, Pune, Hyderabad, etc.) — check serviceability first.
- Products are cold-chain delivered — short shelf life (3-5 days). Order accordingly.
- Popular products: Valencia Orange, Sugarcane, ABC (Apple Beetroot Carrot), Almond Milk, Green Detox.
- Cleanse packs (1/3/5 day) include a structured juice plan — ideal for detox goals.
- Subscription plans save 10-20% and ensure regular delivery — can pause or cancel anytime.
- Morning delivery slots available in most cities for fresh juice with breakfast.
- Free delivery above a certain order value. Express delivery may cost extra.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
