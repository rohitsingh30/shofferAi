---
name: nykaa-return
description: Return beauty products on Nykaa — find order, request return, select reason, schedule pickup or arrange refund.
triggers:
  - nykaa return
  - return on nykaa
  - nykaa refund
  - return nykaa order
  - nykaa exchange
  - nykaa wrong product
  - nykaa damaged product
  - nykaa replacement
  - return beauty product
siteUrl: https://www.nykaa.com/orders
requiresAuth: true
params:
  - name: product
    required: true
    hint: Product to return (e.g. "the foundation", "MAC lipstick", "the serum I ordered")
  - name: reason
    required: false
    hint: Return reason (e.g. "wrong shade", "damaged", "expired product", "wrong item", "allergic reaction")
  - name: order_date
    required: false
    hint: Approximate order date to help locate the order (e.g. "last week", "March 10")
---

# Nykaa Return / Refund

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which product the user wants to return. If vague, use `ask_user` to clarify (brand, product name, order date).
- Ask for return reason if not provided via `ask_user` (input_type "choice"):
  - "Received wrong product"
  - "Product damaged/broken in transit"
  - "Product expired or near expiry"
  - "Wrong shade/variant received"
  - "Product missing from order"
  - "Allergic reaction / skin irritation"
  - "Quality not as expected"
- Clarify if user wants refund or replacement via `ask_user` (input_type "choice"):
  - "Refund to original payment method"
  - "Refund as Nykaa Credit / store credit"
  - "Replacement (same product)"

### 2. Open Nykaa Orders & Verify Login
- Open a NEW tab and navigate to `https://www.nykaa.com/orders`.
- Take snapshot. Verify logged in (profile icon or name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any popups or promotional banners.

### 3. Find the Order
- Take snapshot of orders page.
- Browse recent orders to find the product user wants to return.
- If not visible, scroll down or use order search/filter if available.
- If multiple matching orders, present them via `ask_user` (input_type "choice"):
  - "Brand Product Name — Shade/Variant — Ordered [date] — Rs X,XXX — [Delivered/In transit]"
- Click on the correct order to view details.
- Take snapshot of order details page.
- Verify return eligibility: check if return window is still open and product category is returnable.

### 4. Initiate Return Request
- Click "Return" or "Request Return" on the order detail page.
- If return option is not available:
  - Check if return window expired — inform user: "Return window has expired for this order."
  - Check if product is non-returnable — inform user: "This product category is non-returnable on Nykaa."
  - Suggest contacting Nykaa customer care as alternative.
- Take snapshot of return form.
- Select return reason from dropdown options.
- Add detailed comments describing the issue.
- Upload photos if required (damaged/wrong product) — guide user via `ask_user`:
  - "Nykaa requires photos of the issue. Please describe what to photograph."
- Select preferred resolution: refund or replacement.

### 5. Review Return Details
- Take snapshot of return summary.
- Use `confirm_action` to present return details:
  - Product: brand, name, shade/variant, size, order ID
  - Return reason: selected reason
  - Resolution: Refund / Replacement
  - Refund amount: Rs X,XXX
  - Refund method: Original payment / Nykaa Credit
  - Pickup arrangement: date/time if applicable
  - Estimated processing timeline
- Do NOT submit unless user confirms. If cancelled, ask what to change.

### 6. Submit Return & Track
- Click "Submit Return Request".
- Take snapshot of return confirmation page.
- If pickup scheduling is shown, select date and time slot via `ask_user` (input_type "choice"):
  - "Tomorrow [date] — 10 AM to 1 PM"
  - "[Day after] — 10 AM to 1 PM"
  - "[Day after] — 2 PM to 5 PM"
- If self-ship required, note the shipping address and return instructions.

### 7. Confirm Return
- Take snapshot of final return confirmation.
- Report: return request ID, product name, brand, return reason, refund amount, refund method, estimated refund timeline, pickup/ship details.
- For refund: "Refund of Rs X,XXX will be processed within 7-15 business days after the product is received and inspected."
- For replacement: "Replacement will be shipped once returned item is received. Estimated delivery: [date]."
- Remind user: "Keep the product unused and in original packaging for return pickup. Do not discard any packaging or accessories."

## Site Notes

- Nykaa return policy is strict: most beauty products are non-returnable once opened/used. Returns mainly for damaged, expired, or wrong items.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Return window: typically 7-15 days from delivery. Varies by seller and product type.
- Non-returnable on Nykaa: opened cosmetics, fragrances (if seal broken), personal care items, items marked non-returnable.
- Damaged/wrong item returns are always accepted regardless of category — photos required as proof.
- Nykaa Credit refund is faster (1-3 days) vs original payment (7-15 days). Can be used for next purchase.
- Nykaa Prive members may get priority return processing.
- If Nykaa denies return, user can escalate via Nykaa customer care or consumer forum.
- Multi-item orders: each item may have different return eligibility. Check per item.
- Some luxury brands on Nykaa have their own return policies — check brand-specific terms.
- Use `confirm_action` for return review. No `collect_payment` needed for returns.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
