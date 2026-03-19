---
name: myntra-return
description: Return or exchange fashion items on Myntra — find order, initiate return/exchange, select reason, schedule pickup.
triggers:
  - myntra return
  - return on myntra
  - myntra exchange
  - exchange on myntra
  - myntra refund
  - return myntra order
  - myntra replacement
  - myntra wrong size
  - myntra return pickup
siteUrl: https://www.myntra.com/my/orders
requiresAuth: true
params:
  - name: product
    required: true
    hint: Product to return (e.g. "the blue kurta", "Nike shoes", "the dress I ordered last week")
  - name: reason
    required: false
    hint: Return reason (e.g. "wrong size", "defective", "color different", "quality issue", "changed mind")
  - name: action
    required: false
    hint: Return (refund) or exchange for different size/color (default return with refund)
---

# Myntra Return / Exchange

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which product the user wants to return. If vague, use `ask_user` to clarify (order date, brand, product type).
- Ask for return reason if not provided via `ask_user` (input_type "choice"):
  - "Wrong size / doesn't fit"
  - "Quality not as expected"
  - "Product looks different from images"
  - "Defective / damaged product"
  - "Wrong product delivered"
  - "Changed my mind / no longer needed"
- Ask if user wants return (refund) or exchange (different size/color) via `ask_user` (input_type "choice"):
  - "Return with refund"
  - "Exchange for different size"
  - "Exchange for different color"

### 2. Open Myntra Orders & Verify Login
- Open a NEW tab and navigate to `https://www.myntra.com/my/orders`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or promotional popups.

### 3. Find the Order
- Take snapshot of orders page.
- Browse recent orders to find the product user wants to return.
- If not visible, scroll down to older orders or use search/filter if available.
- If multiple matching orders found, present them via `ask_user` (input_type "choice"):
  - "Brand Name Product — Size M — Ordered on [date] — Rs X,XXX — [Delivered/In transit]"
- Click on the correct order to view details.
- Take snapshot of order details page.

### 4. Initiate Return / Exchange
- Click "Return" or "Exchange" button on the order detail page.
- If return window has expired, inform user: "Return window expired on [date]. This order is no longer eligible for return."
- If item is in non-returnable category, inform user immediately.
- Take snapshot of return initiation page.
- Select return reason from the options provided.
- If exchange: select new size or color from available options. Present via `ask_user` (input_type "choice").
- Add comments if user has specific details about the issue.
- Upload photos if required for damage/quality claims — inform user via `ask_user`.

### 5. Schedule Pickup
- Take snapshot of pickup scheduling page.
- View available pickup dates and time slots.
- Use `ask_user` (input_type "choice") to present pickup options:
  - "Tomorrow [date] — 10 AM to 1 PM"
  - "Tomorrow [date] — 2 PM to 6 PM"
  - "[Day after] — 10 AM to 1 PM"
  - "[Day after] — 2 PM to 6 PM"
- Select the user's preferred pickup slot.
- Verify pickup address is correct. Update if needed via `ask_user`.

### 6. Review & Confirm Return
- Take snapshot of return summary page.
- Use `confirm_action` to present return summary:
  - Product: brand, name, size, color, order ID
  - Return reason: selected reason
  - Action: Return (refund) / Exchange (new size/color)
  - Refund amount: Rs X,XXX (if return)
  - Refund method: Original payment / Myntra Credit
  - Exchange item: new size/color (if exchange)
  - Pickup: date, time slot, address
  - Estimated refund/exchange timeline
- Do NOT submit unless user confirms. If cancelled, ask what to change.

### 7. Submit Return & Confirm
- Click "Confirm Return" or "Confirm Exchange".
- Take snapshot of return confirmation page.
- Report: return request ID, product details, refund amount, refund method, estimated refund date, pickup date and time.
- For returns: "Refund will be processed within 7-10 business days after pickup."
- For exchanges: "Your new item (Size [X]) will be shipped once the return is picked up. Estimated delivery: [date]."
- Remind user: "Please keep the product with original tags attached and packed for pickup on [date] between [time]."

## Site Notes

- Myntra return window: 7-30 days depending on seller and category. Premium/luxury brands may have shorter windows.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Non-returnable categories: innerwear, swimwear, jewellery, fragrances, socks — inform user immediately if applicable.
- Exchange is only available for size/color changes on the same product. Not all products support exchange.
- Refund to original payment: 7-10 business days. Myntra Credit: 1-2 business days (usable immediately).
- Myntra Credit refund is faster and can be used for next purchase — suggest this option.
- Tags must be attached: Myntra rejects returns if product tags are removed. Always remind user.
- If pickup fails (delivery person came but item not ready), Myntra allows rescheduling once.
- Some items are "Try & Buy" eligible — extended return window with no questions asked.
- Myntra Insider loyalty points are not refunded on returns — inform user if they ask.
- Use `confirm_action` for return review. No `collect_payment` needed for returns.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
