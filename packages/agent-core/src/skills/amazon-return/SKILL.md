---
name: amazon-return
description: Return a product on Amazon.in — find order, select return reason, choose refund method, schedule pickup or drop-off.
triggers:
  - amazon return
  - return on amazon
  - amazon refund
  - return amazon order
  - amazon replacement
  - exchange on amazon
  - amazon return pickup
  - amazon drop off return
siteUrl: https://www.amazon.in/gp/your-account/order-history
requiresAuth: true
params:
  - name: product
    required: true
    hint: Product to return (e.g. "the headphones", "blue jacket", "phone case")
  - name: reason
    required: false
    hint: Return reason (e.g. "defective", "wrong size", "not as expected", "changed mind")
  - name: refund_method
    required: false
    hint: Refund preference (original payment, Amazon Pay balance, exchange)
---

# Amazon.in Return / Replacement

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which product the user wants to return. If vague, use `ask_user` to clarify (approximate order date, product name).
- Ask for return reason if not provided via `ask_user` (input_type "choice"):
  - "Item defective or doesn't work"
  - "Wrong item was sent"
  - "Item arrived damaged"
  - "No longer needed"
  - "Product not as described"
  - "Wrong size / wrong color"
  - "Better price available"
  - "Missing parts or accessories"
- Ask if user prefers refund or replacement via `ask_user` (input_type "choice").

### 2. Open Amazon Orders & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in/gp/your-account/order-history`.
- Take snapshot. Verify logged in (greeting "Hello, [name]" in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.

### 3. Find the Order
- Take snapshot of order history page.
- Browse recent orders to locate the product.
- Use time period filter (Last 30 days, Last 3 months) if order is older.
- Use search box within orders if available to narrow down.
- If multiple matching orders, present them via `ask_user` (input_type "choice"):
  - "Product Name — Ordered [date] — ₹X,XXX — Delivered [date]"
- Click on the correct order.
- Take snapshot of order details.

### 4. Initiate Return
- Click "Return or Replace Items" on the order detail page.
- If button is not available, check if return window has expired — inform user: "Return window expired. This order is no longer eligible for return/replacement."
- Take snapshot of return initiation page.
- Select the item(s) to return (checkbox if multi-item order).
- Select return reason from dropdown.
- Add optional comments describing the issue.
- If Amazon asks for photos/videos of defect, inform user via `ask_user`.

### 5. Choose Refund Method & Pickup
- Take snapshot of refund options page.
- Present refund options via `ask_user` (input_type "choice"):
  - "Refund to original payment method (5-7 business days)"
  - "Amazon Pay balance (instant)"
  - "Replacement (same item, free)"
- Select user's preferred refund method.
- Choose return method — pickup vs drop-off:
  - **Pickup**: Select date and time slot via `ask_user` (input_type "choice").
  - **Drop-off**: Show nearest Amazon drop-off locations and let user choose.
- If only one return method available, inform user.

### 6. Review & Confirm Return
- Take snapshot of return summary page.
- Use `confirm_action` to present return summary:
  - Product: name, variant, order ID, order date
  - Return reason: selected reason
  - Action: Return (refund) / Replacement
  - Refund amount: ₹X,XXX
  - Refund to: Original payment / Amazon Pay balance
  - Return method: Pickup on [date] [time] / Drop-off at [location]
  - Estimated refund timeline
- Do NOT submit unless user confirms. If cancelled, ask what to change.

### 7. Submit Return & Confirm
- Click "Submit Return Request".
- Take snapshot of return confirmation page.
- Report: return ID, product name, refund amount, refund method, estimated refund date, pickup/drop-off details.
- Remind user: "Please keep the item in original packaging. The delivery person will collect it on [date] between [time]."
- If drop-off selected: "Please drop the packed item at [location] within [X days]. Print the return label from your email."

## Site Notes

- Amazon return window: 7-day replacement for electronics, 10-day return for most items, 30-day for Amazon-fulfilled fashion. Some items (grocery, innerwear) non-returnable.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Amazon Pay balance refund is instant; original payment refund takes 5-7 business days.
- Fulfilled by Amazon (FBA) items have smoother return experience vs third-party sellers.
- Amazon may offer "Returnless Refund" for low-value items — accept if offered (user keeps item + gets refund).
- Pickup is free for most returns. Drop-off locations include Amazon lockers and partner stores.
- If replacement is selected, Amazon ships the new item immediately and picks up the old one.
- Some returns require printing a shipping label — check user's printer access via `ask_user` if needed.
- Use `confirm_action` for return review. No `collect_payment` needed for returns.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
