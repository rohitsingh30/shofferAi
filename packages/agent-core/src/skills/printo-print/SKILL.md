---
name: printo-print
description: Order document and photo prints online from Printo — upload files, customize print options, select delivery, pay.
triggers:
  - printo
  - print documents
  - print photos
  - order prints
  - photo printing
  - document printing
  - print online
  - get prints delivered
siteUrl: https://www.printo.in
requiresAuth: true
params:
  - name: print_type
    required: true
    hint: Type of print (e.g. "document", "photo", "visiting cards", "banner", "sticker")
  - name: file_url
    required: false
    hint: URL or description of file to upload for printing
  - name: quantity
    required: false
    hint: Number of copies (default 1)
  - name: delivery_address
    required: false
    hint: Delivery address or pickup preference
---

# Printo Print Ordering

Chrome profile: rsinghtomar3011@gmail.com. Operator account on Printo.

## Steps

### 1. Gather Requirements
- Confirm you have: print type (document, photo, visiting card, banner, etc.).
- If print type is missing, use `ask_user` (input_type "choice") with common options: "Document Print", "Photo Print", "Visiting Cards", "Banners & Posters", "Stickers & Labels", "Custom".
- Ask about quantity if not specified. Default to 1 copy.
- Ask about paper size/quality preferences if relevant (A4, A3, glossy, matte).

### 2. Open Printo in New Tab
- Open a NEW tab and navigate to `https://www.printo.in`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, cookie consent banners, or newsletter signup modals.
- Verify the main navigation and product categories are visible.

### 3. Verify Login
- Look for a profile icon or account name in the top-right header area.
- If signed in: proceed to product selection.
- If NOT signed in: Click "Login" or "Sign In", attempt Google sign-in with rsinghtomar3011@gmail.com.
- If CAPTCHA or OTP appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Product & Upload File
- Navigate to the appropriate product category based on print type.
- Take snapshot of product options (sizes, finishes, paper types).
- Use `ask_user` (input_type "choice") to present available options with prices.
- Click selected product to open the customization page.
- If user has a file to upload: click "Upload File" or "Design Online", upload the file.
- If user needs a template: browse templates, present top 3-5 options via `ask_user`.
- Take snapshot after upload/template selection to confirm preview looks correct.

### 5. Customize Print Options
- Set quantity as specified by user.
- Configure print options: paper type, finish (glossy/matte), color/B&W, single/double-sided.
- Use `ask_user` (input_type "choice") for any options user hasn't specified.
- Take snapshot showing the customization summary and preview.

### 6. Select Delivery Method
- Check available delivery options: home delivery, store pickup, express delivery.
- If delivery address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address? Or would you prefer store pickup?"
- Enter delivery address if home delivery selected.
- Use `ask_user` (input_type "choice") to present delivery options with timelines and costs.

### 7. Review Order & Confirm
- Navigate to cart/order summary.
- Take snapshot of the complete order.
- Use `confirm_action` to present order summary:
  - Print type, quantity, paper/finish options
  - Delivery method and estimated delivery date
  - Subtotal, delivery charges, taxes, total
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with print type, quantity, options, delivery, price breakdown, total
  - amount_inr: total amount (number)
  - description: "Printo print order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Printo using available payment method.
- Handle payment OTP via `ask_user` if needed.

### 9. Order Confirmation
- Take snapshot of confirmation page.
- Extract: order number, items ordered, total paid, estimated delivery date, tracking info.
- Report full details to user including order tracking link if available.
- If order failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Printo supports file uploads (PDF, JPG, PNG, AI, PSD) — max file size varies by product.
- Delivery typically takes 2-5 business days for standard, 1-2 days for express.
- Printo operates primarily in Bangalore but delivers across India for most products.
- Store pickup is available only at Printo stores in Bangalore.
- Minimum order value may apply for home delivery.
- Some products (visiting cards, letterheads) have minimum quantity requirements.
- Use `confirm_action` for order review (before money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator Google account. Do NOT ask user for credentials.
