---
name: tanishq-jewelry
description: Buy jewelry on Tanishq online — browse gold, diamond, and platinum collections, select design, order and pay.
triggers:
  - tanishq
  - buy tanishq jewelry
  - tanishq online
  - tanishq gold
  - tanishq diamond
  - tanishq necklace
  - tanishq ring
  - buy gold from tanishq
siteUrl: https://www.tanishq.co.in
requiresAuth: true
params:
  - name: item_type
    required: true
    hint: Type of jewelry (e.g. "necklace", "ring", "earrings", "bangle", "chain", "mangalsutra")
  - name: material
    required: false
    hint: Material preference (e.g. "gold", "diamond", "platinum", "22K gold", "polki")
  - name: collection
    required: false
    hint: Specific collection (e.g. "Rivaah wedding", "Mia by Tanishq", "daily wear")
  - name: budget
    required: false
    hint: Budget range (e.g. "under 20000", "under 50000", "1 lakh to 2 lakh")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, gold exchange, Tanishq gift card)
---

# Tanishq Online Jewelry Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants. Use `ask_user` to clarify:
  - Type: Necklace, ring, earrings, bangle, bracelet, chain, pendant, mangalsutra, nose pin, anklet.
  - Material: 22K gold, 18K gold, platinum, diamond, polki, kundan.
  - Collection/brand: Tanishq (premium), Mia by Tanishq (modern/lightweight), Rivaah (wedding), Zoya (luxury).
  - Occasion: Wedding, festive, daily wear, office, engagement, gifting.
  - Gold purity: 22K (traditional), 18K (diamond-studded), platinum.
  - Budget range.
- If buying for wedding, recommend Rivaah collection.
- If looking for lightweight daily wear, recommend Mia by Tanishq.
- If unsure, recommend based on occasion and budget.

### 2. Open Tanishq & Verify Login
- Open a NEW tab and navigate to `https://www.tanishq.co.in`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any promotional popups or location selection modals.
- Set city/pincode if prompted (for store availability and delivery).

### 3. Browse Collections
- Navigate to the correct category or collection page.
- Take snapshot of collection page.
- Apply filters: material, purity, price range, occasion, collection, product type.
- Sort by popularity, new arrivals, or price as user prefers.
- Extract top 4-6 options with: name, material, purity, weight, price, diamond details (if any), collection name.
- Use `ask_user` (input_type "choice") to present options:
  - "Floral Gold Necklace — 22K Yellow Gold — 12.5g — ₹XX,XXX — Tanishq"
  - "Diamond Stud Earrings — 18K White Gold — 0.20 ct — ₹XX,XXX — Mia"
  - "Polki Wedding Set — 22K Gold — ₹X,XX,XXX — Rivaah Collection"
- Take snapshots of shortlisted pieces for user to see.

### 4. View Product Details
- Click on selected jewelry piece.
- Take snapshot of product page.
- Extract detailed information:
  - Full name, design description, collection
  - Metal: type, purity (22K/18K/Pt950), gross weight, net weight
  - Diamond/gemstone: total carat, number of stones, clarity, color (if applicable)
  - Price breakdown: metal value, stone value, making charges, GST
  - Available sizes (for rings/bangles)
  - Store availability: check if available at nearest Tanishq store for try-on
  - Certification: BIS hallmark, Karatmeter tested
  - Delivery, return policy, exchange policy
- If product has size options, present via `ask_user` (input_type "choice").
- Mention store try-on: "This piece is available at [nearest store] for in-person try-on. Want to visit instead?"
- Confirm with user: "Buy [Jewelry Name] at ₹XX,XXX?"

### 5. Add to Cart & Review
- Click "Add to Bag" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable offers (exchange bonus, Encircle loyalty points, bank offers).
- Apply best available offer.
- Use `confirm_action` to present order summary:
  - Jewelry: name, collection, design
  - Metal: type, purity, weight (gross and net)
  - Diamond/stone: carat, clarity (if applicable)
  - Size: ring/bangle size (if applicable)
  - Price breakdown: metal + stone + making charges + GST
  - Offers: bank discount, Encircle points redeemed
  - Delivery: estimated date
  - Exchange policy: lifetime exchange at full metal value
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with jewelry name, collection, metal, weight, diamond, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Tanishq jewelry order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method (UPI/card/EMI/Tanishq gift card).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, jewelry name, collection, metal purity, weight, diamond details, price paid, estimated delivery date, BIS hallmark number.
- Remind user: "Tanishq offers lifetime exchange at full metal value. All jewelry is BIS hallmarked and Karatmeter tested."

## Site Notes

- Tanishq delivery: 5-10 business days. Free insured delivery across India on most items.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Tanishq is by Titan Company (Tata Group) — most trusted jewelry brand in India.
- All gold jewelry is BIS hallmarked and Karatmeter tested for purity guarantee.
- Tanishq Encircle loyalty program: earn and redeem points — check if enrolled and apply points.
- Lifetime exchange: any Tanishq gold jewelry exchanged at full prevailing gold rate (making charges non-refundable).
- Old gold exchange from any brand: Tanishq accepts old gold at current market rate minus testing charges.
- Rivaah collection: bridal jewelry, typically higher value. May require store visit for heavy pieces.
- Mia by Tanishq: lightweight, modern, affordable daily wear. Separate section on website.
- Making charges vary: 8-25% depending on design complexity. Machine-made is cheaper than handcrafted.
- Prices update daily based on gold/platinum rates. Price locked at time of order placement.
- EMI available on cards for orders above ₹5,000.
- Use `confirm_action` for order review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
