---
name: dell-store
description: Buy Dell laptops, desktops, and monitors on Dell India — configure specs, customize, buy.
triggers:
  - dell
  - buy dell
  - dell laptop
  - dell store
  - order from dell
  - dell india
  - dell monitor
  - buy dell laptop
siteUrl: https://www.dell.com/in-en
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Dell XPS 15", "Inspiron 16 laptop", "Dell 27 inch 4K monitor")
  - name: budget
    required: false
    hint: Max price (e.g. "under 80000", "budget 1 lakh")
  - name: use_case
    required: false
    hint: Primary use (e.g. "coding", "gaming", "office work", "video editing")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Dell Financial Services)
---

# Dell India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (laptop/desktop/monitor, use case, screen size, budget).
- Note any specific requirements (processor — Intel/AMD, RAM, SSD size, GPU, screen resolution, weight).
- Recommend a Dell series based on use case: XPS (premium), Inspiron (mainstream), Latitude (business), Alienware (gaming), Vostro (small business).

### 2. Open Dell Store & Verify Login
- Open a NEW tab and navigate to `https://www.dell.com/in-en`.
- Take snapshot. Dismiss any chat widget or promotional popups.
- Verify logged in (Dell account icon/name in top-right header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product, or navigate to the category (Laptops, Desktops, Monitors, Workstations).
- Take snapshot of product listing page.
- Apply relevant filters: price range, processor, screen size, RAM, rating.
- Extract top 3-5 options with: name, price, processor, RAM, storage, screen size, GPU (if any), weight.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XX,XXX — i7/Ryzen 7 — 16GB — 512GB SSD — 15.6 inch"
- If user wants to see more options or different configs, adjust filters.

### 4. View & Configure Product
- Click selected product.
- Take snapshot of product/configuration page.
- Dell allows deep customization — present configurable options via `ask_user` (input_type "choice"):
  - Processor options (i5/i7/i9, Ryzen 5/7/9)
  - RAM options (8GB/16GB/32GB/64GB)
  - Storage options (256GB/512GB/1TB/2TB SSD)
  - Display options (FHD/QHD/4K, touch/non-touch)
  - GPU options (integrated/dedicated)
  - OS (Windows 11 Home/Pro, Ubuntu)
- Extract: configured price, delivery estimate, warranty included, bank offers.
- Mention any active offers: "Save ₹X with HDFC card", "Free upgrade to 16GB RAM", "No-cost EMI available".
- Confirm with user: "Add [configured product] at ₹X,XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable coupon codes or bundle offers (mouse, bag, antivirus).
- Use `confirm_action` to present order summary:
  - Product name, full configuration (processor/RAM/storage/display/GPU/OS)
  - Price, any discounts/coupons applied
  - Warranty included (1yr/3yr)
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, full config, price, delivery, warranty, total
  - amount_inr: total amount (number)
  - description: "Dell India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Dell.com (UPI/card/COD/EMI/Dell Financial Services as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product with full configuration, price paid, estimated delivery date, warranty details, Dell service tag (if shown).

## Site Notes

- Dell.com/in delivery: 5-10 business days for pre-configured. Built-to-order (customized) may take 2-4 weeks.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Dell website can be slow with configuration pages — wait for page loads, take snapshots to verify state.
- Bank offers (cashback on HDFC, ICICI, SBI) are common — always check the "Offers" section on product page.
- Dell Financial Services offers EMI and leasing options — mention for high-value purchases.
- Extended warranty (Dell Premium Support, ProSupport, Accidental Damage) can be added — present options and pricing.
- Dell sometimes bundles free accessories (mouse, bag) with laptops — check and mention.
- Pre-configured vs Build-Your-Own: pre-configured ships faster but less customizable. Mention trade-off.
- Student/education discounts may be available — check if Dell has active education offers.
- Dell chat widget may pop up — dismiss it to avoid interference with automation.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
