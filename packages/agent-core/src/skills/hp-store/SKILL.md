---
name: hp-store
description: Buy HP laptops, printers, and accessories on HP India — configure specs, customize, buy.
triggers:
  - hp
  - buy hp
  - hp laptop
  - hp store
  - order from hp
  - hp india
  - hp printer
  - buy hp laptop
siteUrl: https://www.hp.com/in-en
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "HP Spectre x360", "HP Pavilion 15 laptop", "HP LaserJet printer")
  - name: budget
    required: false
    hint: Max price (e.g. "under 70000", "budget 50k")
  - name: use_case
    required: false
    hint: Primary use (e.g. "work from home", "gaming", "student", "printing")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# HP India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (laptop/printer/desktop, use case, screen size, budget).
- Note any specific requirements (processor, RAM, SSD, screen size, printer type — inkjet/laser/ink tank).
- Recommend an HP series based on use case: Spectre (premium), Envy (creative), Pavilion (mainstream), Victus/OMEN (gaming), ProBook (business).

### 2. Open HP Store & Verify Login
- Open a NEW tab and navigate to `https://www.hp.com/in-en/shop`.
- Take snapshot. Dismiss any chat widget, cookie banners, or promotional popups.
- Verify logged in (HP account icon/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or navigate to the category (Laptops, Desktops, Printers, Accessories).
- Take snapshot of product listing page.
- Apply relevant filters: price range, processor, screen size, RAM, use case, rating.
- Extract top 3-5 options with: name, price, processor, RAM, storage, screen size, key features.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XX,XXX — i7/Ryzen 7 — 16GB — 512GB SSD — 15.6 inch"
- If user wants to see more options, adjust filters or browse next page.

### 4. View & Configure Product
- Click selected product.
- Take snapshot of product/configuration page.
- Present configurable options via `ask_user` (input_type "choice") if customization is available:
  - Processor options
  - RAM options (8GB/16GB/32GB)
  - Storage options (256GB/512GB/1TB SSD)
  - Display options (FHD/2K/OLED, touch/non-touch)
  - OS (Windows 11 Home/Pro)
  - For printers: ink type, connectivity (WiFi/USB), duplex printing
- Extract: final price, delivery estimate, warranty included, bank offers, bundle deals.
- Mention any active offers: "₹X off with HDFC card", "Free HP mouse worth ₹X", "No-cost EMI".
- Confirm with user: "Add [configured product] at ₹X,XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupon codes or bundle offers (mouse, bag, MS Office).
- Use `confirm_action` to present order summary:
  - Product name, full configuration (processor/RAM/storage/display/OS)
  - Any bundled accessories
  - Price, any discounts/coupons applied
  - Warranty included
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, config, price, delivery, warranty, total
  - amount_inr: total amount (number)
  - description: "HP India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on HP.com (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product with full configuration, price paid, estimated delivery date, warranty details.

## Site Notes

- HP.com/in delivery: 3-7 business days for in-stock. Customized/built-to-order may take 2-3 weeks.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- HP website has a persistent chat widget (HP Virtual Agent) — dismiss it to avoid interference.
- Bank offers (cashback on HDFC, ICICI, Axis) are common — always check "Offers" section.
- HP Care Pack (extended warranty, accidental damage protection) is offered during checkout — present options and pricing.
- Printers: mention ongoing ink/toner costs. HP Ink Tank printers have lower running costs. HP+ subscription may be offered.
- HP Smart App required for some printers — mention this post-purchase.
- Student discounts available through HP Education Store — check if active offers exist.
- HP bundles often include free accessories (mouse, bag, MS Office trial) — always check and mention.
- No-cost EMI available on products above ₹10,000 — mention EMI options for higher-value items.
- HP Victus/OMEN gaming laptops have different configurations online vs retail — highlight online exclusives.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
