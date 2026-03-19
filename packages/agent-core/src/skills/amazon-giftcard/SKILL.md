---
name: amazon-giftcard
description: Buy Amazon gift cards — select amount, recipient email, add message, pay and deliver instantly.
triggers:
  - amazon gift card
  - buy amazon gift card
  - amazon voucher
  - gift card on amazon
  - amazon e-gift card
  - send amazon gift card
  - amazon gift voucher
  - buy gift card
siteUrl: https://www.amazon.in/gift-cards
requiresAuth: true
params:
  - name: amount
    required: true
    hint: Gift card amount in INR (e.g. "500", "1000", "2000", "5000")
  - name: recipient_email
    required: true
    hint: Recipient's email address for e-gift card delivery
  - name: recipient_name
    required: false
    hint: Recipient's name for the gift card message
  - name: message
    required: false
    hint: Personal message to include (e.g. "Happy Birthday!")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking, Amazon Pay)
---

# Amazon Gift Card Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm the gift card amount. If not specified, use `ask_user` to ask: "What amount gift card would you like? (₹100, ₹500, ₹1000, ₹2000, ₹5000, or custom)".
- Confirm recipient email. Use `ask_user` if not provided.
- Ask if user wants to add a personal message via `ask_user` (input_type "text").
- Ask for recipient name if not provided.
- Note: Amazon gift cards range from ₹100 to ₹50,000.

### 2. Open Amazon Gift Cards & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in/gift-cards`.
- Take snapshot. Verify logged in (greeting "Hello, [name]" in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.

### 3. Select Gift Card Type
- Take snapshot of gift card landing page.
- Browse available gift card designs (Birthday, Thank You, Congratulations, Festival, Generic).
- Use `ask_user` (input_type "choice") to present design categories:
  - "Birthday — festive birthday design"
  - "Thank You — appreciation theme"
  - "Congratulations — celebration design"
  - "Generic — Amazon branded"
  - "Festival — Diwali/Holi/Christmas themed"
- Click on selected design category.

### 4. Configure Gift Card Details
- Take snapshot of gift card configuration page.
- Select "Email" delivery type (e-gift card).
- Enter the gift card amount in the amount field.
- Enter recipient's email address.
- Enter recipient's name.
- Enter "From" name (operator name or user-specified).
- Enter personal message if provided.
- Select delivery date (immediate or scheduled) — use `ask_user` if user wants to schedule.
- Take snapshot showing all filled details.

### 5. Review & Confirm
- Click "Add to Cart" or "Buy Now".
- Take snapshot of order review page.
- Use `confirm_action` to present gift card summary:
  - Gift card design selected
  - Amount: ₹X,XXX
  - Recipient: name + email
  - Message: the personal message
  - Delivery: Instant (email) or scheduled date
  - Total: ₹X,XXX
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with gift card amount, recipient email, recipient name, message, design, total
  - amount_inr: total amount (number)
  - description: "Amazon.in gift card purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Purchase & Confirm
- Select payment method on Amazon (UPI/card/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, gift card amount, recipient email, delivery method (instant/scheduled), estimated delivery time.
- Confirm: "Gift card of ₹X,XXX has been sent to [email]. They will receive it via email."

## Site Notes

- Amazon e-gift cards are delivered instantly to recipient's email. Physical gift cards take 1-3 days.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Gift cards cannot be cancelled once purchased — make sure user confirms before payment.
- Amazon gift cards are valid for 1 year from date of purchase (as per RBI guidelines).
- Gift cards can only be redeemed on Amazon.in, not other Amazon country sites.
- No partial redemption — the full balance is added to recipient's Amazon Pay balance.
- Minimum gift card amount: ₹100. Maximum: ₹50,000 per card.
- Corporate/bulk gift cards have a different flow — this skill handles individual purchases only.
- Use `confirm_action` for order review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
