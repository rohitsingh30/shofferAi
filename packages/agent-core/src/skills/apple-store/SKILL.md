---
name: apple-store
description: Buy Apple products on Apple India — iPhone, Mac, iPad, Apple Watch, AirPods, accessories.
triggers:
  - apple store
  - buy apple
  - buy iphone
  - order from apple
  - apple india
  - buy macbook
  - buy ipad
  - apple store india
siteUrl: https://www.apple.com/in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "iPhone 16 Pro Max 256GB", "MacBook Air M4", "AirPods Pro 2")
  - name: budget
    required: false
    hint: Max price (e.g. "under 80000", "budget 1.5 lakh")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, Apple Trade In)
---

# Apple India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product line, model, storage, color, budget).
- Note any specific requirements (storage capacity, chip variant, color, engraving for AirPods/iPad).

### 2. Open Apple Store & Verify Login
- Open a NEW tab and navigate to `https://www.apple.com/in/shop`.
- Take snapshot. Dismiss any promotional banners.
- Verify logged in (Apple ID icon/bag icon shows account in top-right).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Browse & Select Product
- Navigate to the relevant product category (iPhone, Mac, iPad, Watch, AirPods, Accessories).
- Take snapshot of product listing page.
- Extract available models with: name, starting price, key differentiators (chip, screen size, camera).
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — From ₹X,XX,XXX — Key Spec"
- If user already knows the exact model, navigate directly to it.

### 4. Configure Product
- On the product page, take snapshot.
- Present configuration options via `ask_user` (input_type "choice"):
  - Color/Finish options
  - Storage/Memory options with price differences
  - Add-ons (AppleCare+, engraving, accessories)
- Extract: final configured price, delivery estimate, trade-in value if applicable.
- Mention any active offers: "No-cost EMI from ₹X/month", "Trade in old device for up to ₹X".
- Confirm with user: "Add [configured product] at ₹X,XX,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to bag, take snapshot.
- Use `confirm_action` to present order summary:
  - Product name, configuration (color/storage/memory)
  - AppleCare+ if added
  - Price breakdown, any trade-in credit
  - Delivery date and charges (free delivery for most items)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Check Out" in bag.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Choose delivery method (Standard free delivery or Express).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, configuration, price, delivery, AppleCare, total
  - amount_inr: total amount (number)
  - description: "Apple India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Apple.com (UPI/card/EMI/Apple Pay as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, product with full configuration, price paid, estimated delivery date, AppleCare+ status.

## Site Notes

- Apple.com/in delivery: 1-3 business days for in-stock items. Some built-to-order Macs take 3-5 weeks.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP/2FA goes to operator phone/device.
- Apple Store uses a "Bag" instead of "Cart" — use Apple terminology in communication.
- No-cost EMI available on HDFC, ICICI, SBI, Axis cards — always mention EMI options for high-value items.
- Apple Trade In allows trading old Apple/Android devices for credit — ask user if interested.
- AppleCare+ is offered during configuration — explain coverage and cost, let user decide.
- Apple products are priced identically across all sellers — no discounts, but EMI and trade-in provide savings.
- Engraving is free on AirPods, iPad, Apple Pencil — ask user if they want personalization.
- Education pricing available at apple.com/in/shop/go/education — mention if user is a student/educator.
- Apple ID 2FA may trigger a code on trusted devices — handle via `ask_user`.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
