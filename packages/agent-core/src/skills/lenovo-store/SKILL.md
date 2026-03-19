---
name: lenovo-store
description: Buy Lenovo/ThinkPad products on Lenovo India — laptops, desktops, tablets, monitors.
triggers:
  - lenovo
  - buy lenovo
  - lenovo store
  - order from lenovo
  - thinkpad
  - buy thinkpad
  - lenovo india
  - lenovo laptop
siteUrl: https://www.lenovo.com/in/en/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "ThinkPad X1 Carbon", "IdeaPad Slim 5", "Lenovo Tab P12", "Legion 5 Pro")
  - name: budget
    required: false
    hint: Max price (e.g. "under 90000", "budget 60k")
  - name: use_case
    required: false
    hint: Primary use (e.g. "business", "gaming", "student", "creative work")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Lenovo India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (laptop/desktop/tablet, use case, screen size, budget).
- Note any specific requirements (processor — Intel/AMD, RAM, SSD, screen size, GPU, weight, keyboard type).
- Recommend a Lenovo series based on use case: ThinkPad (business/enterprise), IdeaPad (consumer/student), Yoga (2-in-1/creative), Legion (gaming), ThinkBook (SMB).

### 2. Open Lenovo Store & Verify Login
- Open a NEW tab and navigate to `https://www.lenovo.com/in/en/`.
- Take snapshot. Dismiss any cookie consent, chat widget, or promotional popups.
- Verify logged in (Lenovo ID icon/name in top-right header or "My Account" link).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or navigate to the category (Laptops, Desktops, Tablets, Monitors, Accessories).
- Take snapshot of product listing page.
- Apply relevant filters: price range, brand series (ThinkPad/IdeaPad/Yoga/Legion), processor, screen size, RAM.
- Extract top 3-5 options with: name, price, processor, RAM, storage, screen size, GPU, weight, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XX,XXX — i7/Ryzen 7 — 16GB — 512GB — 14 inch — 1.3kg"
- If user wants to see more options, adjust filters or browse next page.

### 4. View & Configure Product
- Click selected product.
- Take snapshot of product/configuration page.
- Lenovo allows extensive customization (CTO — Configure to Order). Present options via `ask_user` (input_type "choice"):
  - Processor options (Intel/AMD, generation, tier)
  - RAM options (8GB/16GB/32GB/64GB, soldered vs upgradable)
  - Storage options (256GB/512GB/1TB/2TB SSD, dual drive)
  - Display options (FHD/2.8K/OLED, touch/non-touch, anti-glare)
  - GPU options (integrated/dedicated NVIDIA)
  - OS (Windows 11 Home/Pro, DOS)
  - Keyboard (backlit, with/without numpad)
- Extract: configured price, delivery estimate, warranty, bank offers.
- Mention any active offers: "₹X,XXX off with coupon", "HDFC cashback ₹X", "No-cost EMI".
- Confirm with user: "Add [configured product] at ₹X,XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes, bundle offers (bag, mouse, MS Office), or e-coupon codes.
- Use `confirm_action` to present order summary:
  - Product name, full configuration (processor/RAM/storage/display/GPU/OS)
  - Any bundled accessories or add-ons
  - Price, any discounts/coupons applied
  - Warranty included (1yr/3yr onsite)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, full config, price, delivery, warranty, total
  - amount_inr: total amount (number)
  - description: "Lenovo India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Lenovo.com (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product with full configuration, price paid, estimated delivery date, warranty details.

## Site Notes

- Lenovo.com/in delivery: 3-7 business days for in-stock. CTO (built-to-order) may take 3-5 weeks.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Lenovo website can be slow/heavy — wait for full page loads, take snapshots to verify state.
- E-coupon codes are frequently available (EXTRA5, FLAT10K, etc.) — check the "Deals" section and apply.
- Bank offers (cashback on HDFC, ICICI, SBI, Axis) are common — always check and mention.
- Lenovo Premium Care / Accidental Damage Protection can be added during configuration — present options with pricing.
- ThinkPad models have superior keyboards and build quality — highlight for business users.
- Legion gaming laptops have different thermal profiles (Performance/Quiet mode) — mention if relevant.
- Student discounts available through Lenovo Education Store — ask if user qualifies.
- RAM solderability varies: some IdeaPads have soldered RAM (not upgradable) — mention this for future-proofing.
- Lenovo sometimes shows MRP and "web exclusive price" — always quote the lower price.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
