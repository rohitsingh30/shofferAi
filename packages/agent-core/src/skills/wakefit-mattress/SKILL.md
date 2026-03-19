---
name: wakefit-mattress
description: Buy a mattress on Wakefit — select size, type, firmness, check trial offer, order and pay.
triggers:
  - wakefit
  - buy mattress
  - wakefit mattress
  - order mattress online
  - buy mattress online
  - wakefit bed
  - mattress from wakefit
  - buy foam mattress
siteUrl: https://www.wakefit.co
requiresAuth: true
params:
  - name: size
    required: false
    hint: Mattress size (e.g. "single", "double", "queen", "king", "72x36", "78x60")
  - name: type
    required: false
    hint: Mattress type (e.g. "foam", "orthopaedic", "latex", "spring", "memory foam")
  - name: firmness
    required: false
    hint: Firmness preference (e.g. "soft", "medium", "firm", "medium-firm")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 10000", "under 15000", "under 20000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, COD)
---

# Wakefit Mattress Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm mattress needs. Use `ask_user` for any missing details:
  - Size: Single (72x36), Double (72x48), Queen (78x60), King (78x72), or custom.
  - Type preference: Foam, Orthopaedic, Latex, Spring/Hybrid, Memory Foam.
  - Firmness: Soft, Medium, Medium-Firm, Firm.
  - Thickness preference: 5", 6", 8", 10" — thicker is plusher.
  - Who is it for: back pain relief, general comfort, kids, guest room.
  - Budget range if not specified.
- If user is unsure about type/firmness, recommend based on use case:
  - Back pain → Orthopaedic (firm)
  - General comfort → Memory Foam (medium)
  - Budget → Foam (medium-firm)
  - Premium → Latex (medium)

### 2. Open Wakefit & Verify Login
- Open a NEW tab and navigate to `https://www.wakefit.co`.
- Take snapshot. Verify logged in (profile icon or name visible).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups or first-time visitor banners.

### 3. Browse Mattresses
- Navigate to the mattress category page.
- Take snapshot of mattress collection page.
- Apply filters: type, size, firmness, price range if available.
- Extract top 3-5 mattress options with: name, type, price, firmness, thickness, rating, key features, trial period.
- Use `ask_user` (input_type "choice") to present options:
  - "Orthopaedic Memory Foam — ₹X,XXX — Firm — 8 inch — ⭐ 4.X — 100-night trial"
  - "Latex Mattress — ₹XX,XXX — Medium — 7 inch — ⭐ 4.X — 100-night trial"
  - "Dual Comfort Foam — ₹X,XXX — Medium-Firm (flip for soft/firm) — 5 inch — ⭐ 4.X"
- Mention best sellers and top-rated options.

### 4. View Mattress Details
- Click on selected mattress.
- Take snapshot of product page.
- Extract detailed information:
  - Full name, type, construction layers
  - Price, MRP, discount percentage
  - Available sizes with prices for each
  - Firmness level, thickness options
  - Trial period (100 nights typically)
  - Warranty (usually 10 years)
  - Rating and review count
  - Key features: breathability, motion isolation, edge support, etc.
  - EMI options
- Present size options via `ask_user` (input_type "choice") if not already selected:
  - "Single 72x36 — ₹X,XXX"
  - "Double 72x48 — ₹X,XXX"
  - "Queen 78x60 — ₹X,XXX"
  - "King 78x72 — ₹X,XXX"
- Present thickness options if available.
- Confirm with user: "Buy [Mattress Name] — [Size] — [Thickness] at ₹X,XXX?"

### 5. Add to Cart & Review
- Click "Buy Now" or "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupons or bundle offers (pillow + mattress combos).
- Apply best coupon/discount if available.
- Use `confirm_action` to present order summary:
  - Mattress: name, type, firmness
  - Size: dimensions
  - Thickness: inches
  - Price: MRP, discount, coupon savings, final price
  - Trial period: 100 nights (free return if not satisfied)
  - Warranty: 10 years
  - EMI option: ₹X,XXX/month (if applicable)
  - Delivery: estimated date (usually 7-14 days for mattresses)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with mattress name, size, thickness, firmness, price, trial, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Wakefit mattress order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method (UPI/card/EMI/COD).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, mattress name, size, thickness, price paid, estimated delivery date, trial period, warranty.
- Remind user: "You have a 100-night free trial. If not satisfied, Wakefit will pick up and refund. Mattress will be delivered compressed in a box."

## Site Notes

- Wakefit delivery: 7-14 days for mattresses. Free delivery across India on all mattresses.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Wakefit 100-night trial: Full refund if returned within 100 nights. Free pickup. This is a major selling point.
- 10-year warranty is standard on most Wakefit mattresses — confirm warranty duration on product page.
- Mattresses are delivered compressed and vacuum-sealed in a box — takes 24-72 hours to fully expand.
- No-cost EMI available on most mattresses above ₹5,000.
- Wakefit often bundles offers: mattress + pillows, mattress + bed frame — mention if available.
- Dual Comfort mattresses have different firmness on each side — flip to switch.
- COD available but may have a small additional charge.
- Use `confirm_action` for order review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
