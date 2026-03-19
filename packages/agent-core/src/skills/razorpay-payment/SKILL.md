---
name: razorpay-payment
description: Create a Razorpay payment link — set amount, description, customer details, and share the payment link.
triggers:
  - razorpay
  - payment link
  - create payment link
  - razorpay payment
  - collect payment
  - send payment link
  - payment request
  - razorpay link
  - upi payment link
siteUrl: https://dashboard.razorpay.com
requiresAuth: true
params:
  - name: amount
    required: true
    hint: Payment amount in INR (e.g. "500", "1299.50")
  - name: description
    required: true
    hint: What the payment is for (e.g. "Freelance project", "Invoice #123")
  - name: customer_name
    required: false
    hint: Customer name for the payment link
  - name: customer_email
    required: false
    hint: Customer email to send the payment link
  - name: customer_phone
    required: false
    hint: Customer phone number
  - name: expiry
    required: false
    hint: Link expiry (e.g. "24 hours", "7 days", "never")
---

# Razorpay Payment Link Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator Razorpay dashboard account.

## Steps

### 1. Gather Requirements
- Confirm you have: amount and description.
- If amount is missing, use `ask_user` (input_type "freetext"): "What amount should the payment link be for? (in INR, e.g. 500)"
- If description is missing, use `ask_user` (input_type "freetext"): "What is this payment for? (e.g. 'Consulting fee', 'Product purchase')"
- Ask about customer details if not provided — name, email, phone are optional but improve tracking.
- Ask about link expiry if not specified. Default to no expiry.
- Ask if partial payments should be allowed.

### 2. Open Razorpay Dashboard in New Tab
- Open a NEW tab and navigate to `https://dashboard.razorpay.com`.
- Take a snapshot to see the login page or dashboard.
- Dismiss any onboarding modals, tips, or notification banners.
- Verify the Razorpay dashboard is visible with the main navigation.

### 3. Verify Login
- Look for the business name, account details, or dashboard navigation in the header/sidebar.
- If signed in: proceed to payment link creation.
- If NOT signed in: Click "Sign In" or "Log In", enter operator credentials.
- If 2FA or OTP is required, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state and correct business account.
- Verify the account is in live mode (not test mode) — check the toggle in the header.

### 4. Navigate to Payment Links
- Click "Payment Links" in the left sidebar navigation.
- Alternatively navigate to `https://dashboard.razorpay.com/app/payment-links`.
- Take snapshot of the payment links page.
- Click "Create Payment Link" or the "+" button.
- Take snapshot of the payment link creation form.

### 5. Fill Payment Link Details
- Enter the payment amount in INR.
- Enter the description/purpose of payment.
- Fill customer details if provided:
  - Customer name
  - Customer email (link will be sent via email if provided)
  - Customer phone (link will be sent via SMS if provided)
- Configure additional settings:
  - **Partial payments**: Enable/disable based on user preference.
  - **Expiry**: Set expiry date/time if specified (default: no expiry).
  - **Payment methods**: UPI, cards, net banking, wallets — all enabled by default.
  - **Reference ID**: Add if user wants to track with a custom ID.
- Take snapshot of the filled form.

### 6. Add Notes & Customization (Optional)
- If user wants custom notes or receipt details:
  - Add key-value notes in the Notes section (e.g. invoice number, order ID).
  - Set reminder preferences (auto-remind customer if unpaid).
- If user wants a custom callback URL for payment confirmation, add it.
- Take snapshot of the fully configured payment link form.

### 7. Review & Confirm
- Use `confirm_action` to present payment link summary:
  - Amount: formatted in INR (e.g. "Rs 1,299.50")
  - Description/Purpose
  - Customer: name, email, phone (if provided)
  - Partial payments: allowed/not allowed
  - Expiry: date or no expiry
  - Payment methods: UPI, cards, net banking, wallets
  - Notes: any custom notes added
- Do NOT proceed unless user confirms. If changes needed, modify the form.

### 8. Create Payment Link
- Click "Create Link" or "Create Payment Link" button.
- Wait for the link to be generated.
- Take snapshot of the created payment link page.
- Copy the payment link URL.
- Extract link details:
  - Payment link URL (short URL)
  - Payment link ID
  - Amount
  - Status (active)
  - Created date

### 9. Share Payment Link
- Use `ask_user` (input_type "choice") for sharing method:
  - "Copy link only" — just provide the URL
  - "Send via email" — Razorpay sends email to customer
  - "Send via SMS" — Razorpay sends SMS to customer
  - "Share via WhatsApp" — generate WhatsApp share link
  - "All of the above"
- If email/SMS selected, Razorpay will send automatically if customer details were provided.
- If WhatsApp selected, generate a `https://wa.me/?text=` share link with the payment URL.
- Take snapshot of the share confirmation.

### 10. Final Confirmation
- Take snapshot of the active payment link.
- Report full details to user:
  - Payment link URL
  - Amount and description
  - Customer details (if set)
  - Expiry date (if set)
  - Link status (Active)
  - Dashboard link to track payment status
- Mention that user will receive a notification when payment is completed.
- Remind user they can track payment status in Razorpay dashboard under Payment Links.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Razorpay. Do NOT ask user for credentials.
- Razorpay charges 2% per transaction (standard plan) — inform user of fees.
- Payment links support: UPI, credit/debit cards, net banking, wallets, EMI.
- Live mode vs Test mode: ensure the dashboard is in LIVE mode (not test) for real payments.
- Razorpay auto-sends email/SMS to customer if contact details are provided during link creation.
- Payment links can be one-time or reusable — default is one-time.
- Minimum payment amount is Rs 1. Maximum depends on payment method.
- Razorpay dashboard may show amounts in paise internally (1 INR = 100 paise).
- Payment link expiry can be set to prevent stale links.
- Use `confirm_action` for payment link review before creating. No `collect_payment` needed — user is creating a link, not paying.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator account. Do NOT ask user for credentials.
