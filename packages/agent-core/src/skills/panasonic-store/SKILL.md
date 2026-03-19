---
name: panasonic-store
description: Buy Panasonic electronics and appliances on Panasonic India — ACs, TVs, washing machines, trimmers, cameras, kitchen appliances.
triggers:
  - panasonic
  - buy panasonic
  - panasonic store
  - order from panasonic
  - panasonic ac
  - panasonic tv
  - panasonic trimmer
  - buy from panasonic india
  - panasonic washing machine
siteUrl: https://www.panasonic.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "1.5 ton inverter AC", "55 inch 4K TV", "beard trimmer", "7kg washing machine", "Lumix camera")
  - name: budget
    required: false
    hint: Max price (e.g. "under 45000", "budget 30k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Panasonic India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, specs, budget).
- For ACs: ask tonnage (1/1.2/1.5/2 ton), type (split/window), inverter preference, energy rating, nanoe-X purification.
- For TVs: ask screen size (32/43/50/55/65 inch), resolution (HD/FHD/4K), smart TV features, panel type.
- For washing machines: ask capacity (kg), type (front load, top load), automatic vs semi-automatic.
- For personal care: ask type (trimmer, shaver, hair dryer, epilator), features needed.
- For cameras: ask type (Lumix mirrorless, compact), use case (vlogging, photography, video), budget.
- Note specific requirements (color, WiFi, nanoe-X, MirAIe smart home).

### 2. Open Panasonic Store & Verify Login
- Open a NEW tab and navigate to `https://www.panasonic.com/in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (My Panasonic account icon/name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories.
- Take snapshot of product listing page.
- Apply relevant filters: price range, capacity/size, type, energy rating, features.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, energy rating, notable features.
- Use `ask_user` (input_type "choice") to present options. Format: "Panasonic Model — ₹XX,XXX — Key Spec — BEE ⭐ — Feature"
- If user wants to see more options, scroll or navigate to next page.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, bank offers, EMI options, warranty, delivery date, installation info.
- If product has variants (color, capacity, storage), present via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "No-cost EMI from ₹X/month", "Free installation".
- Highlight Panasonic-specific technologies: nanoe-X (air purification in ACs), MirAIe (smart home), Econavi, Inverter.
- For cameras: highlight sensor size, video resolution, stabilization, lens compatibility.
- Note energy rating (BEE stars) for appliances.
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons or promo codes — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant (color/capacity), quantity
  - Price, any discounts/offers applied, bank offers
  - Installation: included or extra cost (free for ACs and washing machines)
  - Warranty: standard Panasonic warranty + compressor/motor warranty
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Confirm pincode serviceability — Panasonic checks delivery availability by pincode.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, installation, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Panasonic India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on panasonic.com/in (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, installation schedule, warranty details.

## Site Notes

- Panasonic India delivery: 3-7 business days. Free delivery on most appliances.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Panasonic nanoe-X technology purifies air inside ACs — unique differentiator, always mention for AC purchases.
- MirAIe smart home app controls Panasonic IoT appliances (ACs, washing machines) — mention for WiFi-enabled models.
- Bank offers and no-cost EMI are commonly available — check offer banners on product pages.
- Free standard installation for ACs and washing machines — always mention.
- Panasonic Lumix cameras are popular for vlogging (GH series, S series) — guide user based on use case.
- Extended warranty available on most products — present options with pricing during checkout.
- Energy rating (BEE stars) is critical for ACs and refrigerators — highlight annual electricity savings.
- Panasonic trimmers (ER-GY series) are very competitive in mid-range — suggest if user is comparing with Philips.
- Panasonic may redirect to partner e-commerce (Amazon/Flipkart) for some products — if so, navigate accordingly.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
