---
name: flipkart-track
description: Track Flipkart order status — find order, show delivery status, courier details, and estimated delivery.
triggers:
  - track flipkart order
  - flipkart tracking
  - where is my flipkart order
  - flipkart delivery status
  - flipkart order status
  - track my flipkart package
  - flipkart shipment tracking
  - when will my flipkart order arrive
siteUrl: https://www.flipkart.com/account/orders
requiresAuth: true
params:
  - name: product
    required: false
    hint: Product to track (e.g. "my phone", "the t-shirt", "recent order")
  - name: order_id
    required: false
    hint: Flipkart order ID if known
---

# Flipkart Order Tracking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which order the user wants to track. If they say "my order" or "latest order", proceed to find the most recent order.
- If user provides an order ID, note it for direct lookup.
- If user mentions a product name, note it to search in order history.
- If ambiguous, we will present options after viewing the orders page.

### 2. Open Flipkart Orders & Verify Login
- Open a NEW tab and navigate to `https://www.flipkart.com/account/orders`.
- Take snapshot. Verify logged in (username visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any login popups with X button.

### 3. Find the Order
- Take snapshot of orders page.
- Browse recent orders to find the product user wants to track.
- If order ID provided, look for matching order.
- If product name provided, scan orders list for matching item.
- If user wants latest order, identify the most recent non-delivered order.
- If multiple in-transit orders found, present via `ask_user` (input_type "choice"):
  - "Product Name — Ordered on [date] — ₹X,XXX — [Shipped/In Transit/Out for delivery]"
- Click on the correct order to view details.

### 4. View Tracking Details
- Take snapshot of order detail page.
- Click "Track Order" or view the tracking timeline on the order page.
- Take snapshot of tracking details.
- Extract tracking information:
  - Current status (Ordered / Packed / Shipped / In Transit / Out for Delivery / Delivered)
  - Estimated delivery date
  - Courier partner (Ekart, Delhivery, BlueDart, etc.)
  - Tracking ID / AWB number
  - Shipment timeline with all status updates and dates
  - Current location if visible
  - Delivery address summary

### 5. Present Tracking Summary
- Use `ask_user` to present a clear tracking summary:
  - "Here is your Flipkart order tracking:"
  - Product: [name, variant]
  - Order ID: [id]
  - Status: [current status]
  - Courier: [name] — Tracking ID: [id]
  - Estimated Delivery: [date]
  - Latest Update: "[status detail] on [date/time]"
  - Full timeline from order placed to current status
- If "Out for Delivery", inform: "Your package is out for delivery. Expected today."
- If delayed beyond estimated date, mention: "Delivery was expected by [date] but appears delayed."
- If delivered, report: "Delivered on [date]."

### 6. Additional Actions
- Ask user if they need anything else via `ask_user` (input_type "choice"):
  - "Track on courier website (get direct link)"
  - "Contact Flipkart support for delay"
  - "Initiate return for this order"
  - "Nothing else, thanks"
- If user wants courier tracking link, extract AWB number and provide Ekart/Delhivery tracking URL.
- If user wants to contact support about a delay, navigate to Flipkart help section.
- Take snapshot of any additional action taken.

### 7. Final Summary
- Take snapshot of final tracking state.
- Provide a concise summary:
  - "Your [product] is [status]. Expected delivery: [date]. Courier: [name]."
  - If delivered: "Your [product] was delivered on [date]."
  - If delayed: "Your order is delayed. Consider contacting Flipkart support."
- If user needs to track another order, repeat from Step 3.

## Site Notes

- Flipkart uses Ekart Logistics (own fleet) for most deliveries. Third-party couriers include Delhivery, BlueDart.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Flipkart tracking updates are less granular than Amazon — may only show major milestones.
- "Arriving by [date]" is an estimate; actual delivery may vary by 1-2 days for remote locations.
- OTP delivery: High-value items (phones, laptops) require OTP — remind user.
- Flipkart Plus members may get priority delivery.
- If order shows "Cancelled by seller" or "Returned by courier", alert user and suggest refund check.
- Multi-item orders may ship separately with different tracking IDs.
- This is a read-only skill — no `confirm_action` or `collect_payment` needed.
- When using ask_user, present information clearly and wait for user response.
