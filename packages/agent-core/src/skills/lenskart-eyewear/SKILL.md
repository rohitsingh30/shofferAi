---
name: lenskart-eyewear
description: Shop on Lenskart — browse eyeglasses, sunglasses, contact lenses, enter prescription, try-on, checkout, pay.
triggers:
  - lenskart
  - order from lenskart
  - buy on lenskart
  - buy glasses
  - order eyeglasses
  - buy sunglasses
  - buy contact lenses
  - order spectacles
siteUrl: https://www.lenskart.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "eyeglasses for men", "polarized sunglasses", "monthly contact lenses")
  - name: prescription
    required: false
    hint: Eye prescription details (e.g. "left -2.5, right -3.0" or "zero power")
  - name: frame_type
    required: false
    hint: Frame preference (e.g. "round", "rectangular", "aviator", "rimless")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Lenskart Eyewear Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: eyeglasses, sunglasses, or contact lenses.
- If eyeglasses, ask if they have a prescription or need zero-power/blue-light-filter frames.
- Use `ask_user` to clarify: frame shape, color, material (metal/acetate), gender, budget.
- For contact lenses: ask brand preference, power, duration (daily/monthly).

### 2. Open Lenskart & Verify Login
- Open a NEW tab and navigate to `https://www.lenskart.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or category navigation to find products.
- Take snapshot of results page.
- Apply filters if relevant: frame type (round, rectangle, aviator), frame material, color, price range, rating, brand.
- Extract top 3-5 options with: brand, name, price (MRP vs discounted), frame shape, material, rating.
- Use `ask_user` (input_type "choice") to present options. Format: "Brand — Frame Type — ₹X,XXX (XX% off) — ⭐ Rating"
- If user wants virtual try-on, note that 3D Try On is available on product pages.

### 4. View Product & Select Options
- Click selected product.
- Take snapshot of product page.
- Extract: brand, model name, frame dimensions, material, weight, price, lens options, warranty.
- If virtual try-on is available, take a snapshot showing the try-on view and describe the look.
- For eyeglasses, present lens type options via `ask_user` (input_type "choice"):
  - Classic single vision, Progressive, Zero power, Blue-light filter, Photochromic.
- For prescription lenses: use `ask_user` to collect prescription (SPH, CYL, AXIS for each eye, PD).
- Select frame size if multiple sizes available.

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable offers (Buy 1 Get 1, first-frame-free, coupon codes).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Frame: brand, model, color, size
  - Lens: type, coating, prescription details
  - Price: frame + lens cost, discounts, total
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with frame, lens type, prescription, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Lenskart eyewear order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, frame details, lens type, prescription, price paid, estimated delivery date.

## Site Notes

- Lenskart delivery: 5-10 days for prescription glasses (custom lenses), 2-4 days for sunglasses/contacts.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Lenskart "Buy 1 Get 1" (BOGO) offer is frequently active — always check and inform user.
- First Frame Free for new users — check if the account qualifies.
- 3D Try On works via webcam — describe the virtual try-on if user is interested.
- Prescription entry is critical — double-check SPH, CYL, AXIS, PD values with user before confirming.
- Lenskart Blu (blue-light filter) lenses are popular for screen users — suggest if relevant.
- Home eye test available in select cities — mention as an option if user does not have prescription.
- 14-day no-questions-asked return policy on most frames.
- Contact lens subscriptions available for monthly lenses — inform if buying contacts.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
