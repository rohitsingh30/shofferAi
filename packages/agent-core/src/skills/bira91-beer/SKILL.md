---
name: bira91-beer
description: Order craft beer from Bira 91 or HipBar — wheat beer, IPA, lager, packs, delivery where legally permitted, checkout, pay.
triggers:
  - bira 91
  - order bira
  - bira beer delivery
  - craft beer delivery
  - bira 91 order
  - beer delivery
  - hipbar beer
  - order beer online
  - bira white
  - bira blonde
siteUrl: https://www.bira91.com
requiresAuth: true
params:
  - name: beer
    required: true
    hint: What to order (e.g. "Bira White", "Bira Blonde", "IPA", "variety pack") or just "beer"
  - name: address
    required: false
    hint: Delivery address or area name (must be in a state where alcohol delivery is legal)
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card)
---

# Bira 91 / Craft Beer Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Get Delivery Address & Verify Legality
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address for beer delivery? Please note: alcohol delivery is only available in select cities/states where legally permitted."
- **CRITICAL**: Alcohol delivery is legal only in certain Indian states/cities (e.g., parts of Maharashtra, Karnataka, West Bengal, Goa, Meghalaya). If user is in a restricted state (e.g., Gujarat, Bihar, Nagaland, Mizoram — total prohibition), STOP and inform user that alcohol delivery is not available in their location.
- Verify the user is of legal drinking age (21+ in most states, 25+ in Delhi/Haryana/Punjab).

### 2. Open Bira 91 / HipBar & Set Location
- Open a NEW tab and navigate to `https://www.bira91.com/shop` or `https://www.hipbar.com` depending on availability.
- Take snapshot. Verify logged in (account icon or name in header).
- If age verification popup appears, confirm legal age.
- If location popup appears, enter user's address/area and select best match from suggestions.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery is available at the user's pincode.
- If Bira 91 direct shop is unavailable, try HipBar (`https://www.hipbar.com`) or LivingLiquidz for the user's city.

### 3. Browse Menu & Select Beers
- If user named specific beers (Bira White, Bira Blonde, Boom IPA), navigate to find them.
- If generic request, present Bira 91 range: White (Wheat Beer), Blonde (Lager), Boom (Strong), IPA (India Pale Ale), Light, Mango Lassi (seasonal).
- Use `ask_user` (input_type "choice") to let user pick beers.
- For each beer, present options:
  - Size: Can (330ml) / Pint (500ml) / Bottle (650ml) — use `ask_user` (input_type "choice") with prices.
  - Quantity: 1 / 4-pack / 6-pack / 12-pack — present with prices and per-unit savings.
- For variety packs:
  - Mixed Pack (assorted flavors) — present with contents and price.
  - Party Pack (12+ units) — present with savings.
- Click "Add to Cart" after each selection.
- Ask if user wants to add merchandise (Bira glasses, bottle openers) if available on the shop.

### 4. Apply Offers
- Check for available coupons/offers on the page.
- Bira 91 shop sometimes has bundle deals and seasonal promotions — apply if beneficial.
- Take snapshot if discount applied.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each beer with variant, size, quantity, and price
  - Bundle/pack savings applied
  - Coupons/discounts applied
  - Subtotal, delivery fee, taxes, total
  - Estimated delivery time (usually same-day or next-day)
  - **Legal disclaimer**: "Alcohol delivery subject to local laws. Must be of legal drinking age."
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address and legal compliance.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with beers, sizes, quantities, prices, discount, delivery fee, total, estimated time
  - amount_inr: total amount (number)
  - description: "Bira 91 beer order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, beers ordered, total paid, estimated delivery time, any delivery instructions.

## Site Notes

- Bira 91 is India's most popular craft beer brand — direct delivery available in limited cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- **Legal compliance is mandatory**: Never deliver to states with alcohol prohibition (Gujarat, Bihar, Nagaland, Mizoram, Manipur, Lakshadweep). Always verify.
- Age verification is required — most platforms require 21+ (25+ in some states like Delhi).
- Bira White (wheat beer, 4.7% ABV) is the bestseller — recommend for first-timers who prefer light, citrusy beer.
- Bira Boom (7.9% ABV) is the strong option — warn user about higher alcohol content.
- HipBar is a licensed alcohol delivery platform — use as fallback if Bira 91 shop is unavailable.
- Delivery times vary: same-day in metros, next-day in smaller cities — set expectations.
- COD may not be available for alcohol — UPI and card payments are standard.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
