---
name: caratlane-jewelry
description: Buy jewelry on CaratLane — browse gold, diamond, and gemstone jewelry, try-on virtually, order and pay.
triggers:
  - caratlane
  - buy jewelry online
  - caratlane jewelry
  - buy gold jewelry
  - buy diamond ring
  - caratlane ring
  - buy earrings online
  - caratlane necklace
siteUrl: https://www.caratlane.com
requiresAuth: true
params:
  - name: item_type
    required: true
    hint: Type of jewelry (e.g. "ring", "earrings", "necklace", "bracelet", "pendant", "mangalsutra")
  - name: material
    required: false
    hint: Material preference (e.g. "gold", "diamond", "rose gold", "platinum", "solitaire")
  - name: occasion
    required: false
    hint: Occasion (e.g. "engagement", "daily wear", "gift", "wedding", "anniversary")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 10000", "under 30000", "50k to 1 lakh")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, exchange gold)
---

# CaratLane Jewelry Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what jewelry the user wants. Use `ask_user` to clarify:
  - Type: Ring, earrings, necklace, pendant, bracelet, bangle, mangalsutra, nose pin.
  - Material: Yellow gold, white gold, rose gold, platinum, diamond, gemstone.
  - Occasion: Daily wear, office, engagement, wedding, gifting, festive.
  - Gold purity preference: 14K, 18K, 22K.
  - Size: Ring size, bracelet size (offer to help measure if unknown).
  - Budget range.
- If it is a gift, ask for recipient details (gender, age, relationship) for better recommendations.
- If user is unsure, recommend based on occasion/budget:
  - Daily wear → 14K gold, lightweight, under ₹15,000
  - Engagement → Diamond ring, ₹30,000-₹1,00,000
  - Gifting → Pendant/earrings, versatile designs

### 2. Open CaratLane & Verify Login
- Open a NEW tab and navigate to `https://www.caratlane.com`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups.

### 3. Browse Jewelry
- Navigate to the correct category (Rings / Earrings / Necklaces / etc.).
- Take snapshot of collection page.
- Apply filters: material (gold, diamond), gold purity (14K, 18K, 22K), price range, occasion, style.
- Sort by popularity or price as per user preference.
- Extract top 4-6 options with: name, material, gold purity, price, diamond details (if any), rating, bestseller badge.
- Use `ask_user` (input_type "choice") to present options:
  - "Flora Diamond Ring — 18K Rose Gold — 0.15 ct Diamond — ₹XX,XXX — ⭐ 4.X"
  - "Classic Gold Studs — 14K Yellow Gold — ₹X,XXX — Bestseller"
  - "Solitaire Pendant — 18K White Gold — 0.30 ct — ₹XX,XXX"
- If user wants to see more, scroll or adjust filters.

### 4. View Product Details
- Click on selected jewelry piece.
- Take snapshot of product page.
- Extract detailed information:
  - Full name, design description
  - Metal: type, purity (14K/18K/22K), weight in grams
  - Diamond/gemstone: carat, clarity, color, cut (if applicable)
  - Price breakdown: gold value, diamond value, making charges
  - Available in other metals/purities (show price variations)
  - Ring sizes available (if ring)
  - Certification: BIS hallmark, diamond certificate
  - Try-on feature: mention if virtual try-on available
  - Delivery timeline, return policy, exchange policy, lifetime warranty
- If product has metal variants, present via `ask_user` (input_type "choice"):
  - "14K Yellow Gold — ₹XX,XXX"
  - "18K White Gold — ₹XX,XXX"
  - "18K Rose Gold — ₹XX,XXX"
- For rings, ask for ring size via `ask_user`. Suggest measuring guide if unsure.
- Confirm with user: "Buy [Jewelry Name] at ₹XX,XXX?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable offers (exchange bonus, bank offer, coupon).
- Apply best offer if available.
- Use `confirm_action` to present order summary:
  - Jewelry: name, design
  - Metal: type, purity, weight
  - Diamond: carat, clarity (if applicable)
  - Size: ring size (if applicable)
  - Price: gold value + diamond value + making charges
  - Offers applied: bank discount, coupon
  - Certification: BIS hallmark, diamond certificate number
  - Delivery: estimated date
  - Return policy: 15-day easy return, lifetime exchange
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with jewelry name, metal, diamond, size, price breakdown, total
  - amount_inr: total amount (number)
  - description: "CaratLane jewelry order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method (UPI/card/EMI).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, jewelry name, metal/purity, diamond details, size, price paid, estimated delivery date, certificate details.
- Remind user: "CaratLane offers 15-day free returns and lifetime exchange. Your jewelry comes with BIS hallmark certification."

## Site Notes

- CaratLane delivery: 3-7 business days. Free delivery across India. Insured shipping.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- CaratLane is a Titan (Tata) company — mention for trust factor.
- All gold jewelry is BIS hallmarked. All diamonds come with certification.
- Lifetime exchange policy: exchange any CaratLane jewelry for full value (minus making charges).
- 15-day no-questions-asked return policy with free pickup.
- Virtual try-on: CaratLane has AR try-on for rings and earrings — mention if user wants to try before buying.
- Gold exchange: users can exchange old gold (any brand) for CaratLane jewelry — ask if interested.
- EMI available: No-cost EMI on orders above ₹3,000.
- Making charges are non-refundable on exchange — clarify to user.
- Prices fluctuate with gold rates — inform user that price is locked at time of order.
- Use `confirm_action` for order review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
