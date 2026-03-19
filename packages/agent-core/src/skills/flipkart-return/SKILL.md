---
name: flipkart-return
description: Return or exchange a product on Flipkart — find order, initiate return/exchange, select reason, schedule pickup.
triggers:
  - flipkart return
  - return on flipkart
  - flipkart exchange
  - exchange on flipkart
  - flipkart refund
  - return flipkart order
  - flipkart replacement
  - cancel flipkart order
siteUrl: https://www.flipkart.com/account/orders
requiresAuth: true
params:
  - name: product
    required: true
    hint: Product to return (e.g. "the shoes I ordered", "Samsung earbuds", "blue shirt")
  - name: reason
    required: false
    hint: Return reason (e.g. "wrong size", "defective", "not as described", "changed mind")
  - name: action
    required: false
    hint: Return, exchange, or replacement (default return with refund)
---

# Flipkart Return / Exchange

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which product the user wants to return. If vague, use `ask_user` to clarify (order date, product name, etc.).
- Ask for return reason if not provided via `ask_user` (input_type "choice"):
  - "Wrong size / doesn't fit"
  - "Defective / damaged product"
  - "Not as described / different from listing"
  - "Changed my mind / no longer needed"
  - "Wrong item delivered"
  - "Quality not as expected"
- Ask if user wants return (refund) or exchange/replacement via `ask_user` (input_type "choice").

### 2. Open Flipkart Orders & Verify Login
- Open a NEW tab and navigate to `https://www.flipkart.com/account/orders`.
- Take snapshot. Verify logged in (username visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any login popups with X button.

### 3. Find the Order
- Take snapshot of orders page.
- Browse recent orders to find the product user wants to return.
- If not visible, use search/filter if available, or scroll down to older orders.
- If multiple matching orders found, present them via `ask_user` (input_type "choice") with:
  - "Product Name — Ordered on [date] — ₹X,XXX — [Delivered/In transit]"
- Click on the correct order to view details.
- Take snapshot of order details page.

### 4. Initiate Return
- Click "Return" or "Exchange" button on the order detail page.
- If return window has expired, inform user: "Return window expired on [date]. This order is no longer eligible for return."
- Take snapshot of return initiation page.
- Select return reason from the dropdown/options.
- Add additional comments if user provided specific details.
- Upload photos if required (inform user via `ask_user` if photos needed — "Flipkart requires photos of the defect. Please describe what to photograph.").
- Select return type: refund to original payment method, Flipkart Credits, or exchange.

### 5. Schedule Pickup
- Take snapshot of pickup scheduling page.
- View available pickup dates and time slots.
- Use `ask_user` (input_type "choice") to present pickup options:
  - "Tomorrow [date] — 10 AM to 1 PM"
  - "Tomorrow [date] — 2 PM to 5 PM"
  - "[Day after] — 10 AM to 1 PM"
  - "[Day after] — 2 PM to 5 PM"
- Select the user's preferred pickup slot.
- Enter pickup address if different from delivery address.

### 6. Review & Confirm Return
- Take snapshot of return summary page.
- Use `confirm_action` to present return summary:
  - Product: name, variant, order ID
  - Return reason: selected reason
  - Action: Return (refund) / Exchange / Replacement
  - Refund amount: ₹X,XXX
  - Refund method: Original payment / Flipkart Credits
  - Pickup: date, time slot, address
  - Estimated refund timeline
- Do NOT submit unless user confirms. If cancelled, ask what to change.

### 7. Submit Return & Confirm
- Click "Submit" / "Confirm Return".
- Take snapshot of return confirmation page.
- Report: return request ID, product, refund amount, refund method, estimated refund date, pickup date/time.
- Remind user: "Please keep the product packed and ready for pickup on [date] between [time]. Keep original packaging if possible."

## Site Notes

- Flipkart return window: typically 7-10 days for most products, 30 days for Flipkart Assured items. Some categories (innerwear, jewellery) are non-returnable.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Refund to original payment: 5-7 business days. Flipkart Credits: instant.
- Exchange is only available for size/color changes on eligible items (mostly apparel/footwear).
- Replacement delivers the same product again — available for defective/damaged items.
- Flipkart may require photos for damage/defect claims — guide user through this.
- If self-ship return (no pickup available), Flipkart provides a shipping label — inform user.
- Some products have "No questions asked" return — mention if applicable.
- Use `confirm_action` for return review. No `collect_payment` needed for returns.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
