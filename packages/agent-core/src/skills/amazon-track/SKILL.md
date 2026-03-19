---
name: amazon-track
description: Track Amazon.in order status — find order, show real-time tracking, delivery estimate, and carrier details.
triggers:
  - track amazon order
  - amazon tracking
  - where is my amazon order
  - amazon delivery status
  - amazon order status
  - track my amazon package
  - amazon shipment tracking
  - when will my amazon order arrive
siteUrl: https://www.amazon.in/gp/your-account/order-history
requiresAuth: true
params:
  - name: product
    required: false
    hint: Product to track (e.g. "my headphones", "the laptop", "recent order")
  - name: order_id
    required: false
    hint: Amazon order ID if known (e.g. "408-1234567-8901234")
---

# Amazon.in Order Tracking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which order the user wants to track. If they say "my order" or "latest order", proceed to find the most recent order.
- If user provides an order ID, note it for direct lookup.
- If user mentions a product name, note it to search in order history.
- If ambiguous (multiple recent orders), we will ask later after viewing orders.

### 2. Open Amazon Orders & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in/gp/your-account/order-history`.
- Take snapshot. Verify logged in (greeting "Hello, [name]" in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.

### 3. Find the Order
- Take snapshot of order history page.
- If order ID was provided, use the search box to find it directly.
- If product name provided, scan recent orders to find the matching item.
- If user said "latest" or "recent", identify the most recent in-transit order.
- If multiple in-transit orders found, present them via `ask_user` (input_type "choice"):
  - "Product Name — Ordered [date] — ₹X,XXX — [Status: Shipped/Out for delivery/etc.]"
- Click on the correct order.

### 4. View Tracking Details
- Click "Track package" on the order detail page.
- Take snapshot of tracking page.
- Extract tracking information:
  - Current status (Ordered / Shipped / In Transit / Out for Delivery / Delivered)
  - Estimated delivery date and time window
  - Carrier/courier name (Amazon Logistics, Delhivery, BlueDart, etc.)
  - Tracking ID / AWB number
  - Shipment timeline with all status updates and timestamps
  - Current location of package (if available)
  - Number of stops away (if Amazon Logistics, shows map)

### 5. Present Tracking Summary
- Use `ask_user` to present a clear tracking summary:
  - "Here is the tracking status for your order:"
  - Product: [name]
  - Order ID: [id]
  - Status: [current status]
  - Carrier: [name] — Tracking ID: [id]
  - Estimated Delivery: [date, time window]
  - Latest Update: "[status detail] at [location] on [date/time]"
  - Timeline of all updates from oldest to newest
- If package shows "Out for Delivery", mention approximate time window.
- If delayed, mention: "Your package appears delayed. Original estimate was [date]."

### 6. Additional Actions
- Ask user if they need anything else via `ask_user` (input_type "choice"):
  - "Get delivery notifications"
  - "Change delivery address"
  - "Request delivery to safe place / neighbor"
  - "Contact carrier"
  - "Nothing else, thanks"
- If user wants to change delivery preferences, navigate to the relevant option.
- If package is significantly delayed (3+ days), offer to help contact Amazon support.
- Take snapshot of any additional action taken.

### 7. Final Summary
- Take snapshot of final tracking state.
- Provide a concise final summary:
  - "Your [product] is [status]. Expected delivery: [date]. Carrier: [name]."
  - If delivered: "Your [product] was delivered on [date] at [time]. Signed by: [name if available]."
- If user needs to track another order, repeat from Step 3.

## Site Notes

- Amazon tracking refreshes in real-time. "Out for Delivery" typically means delivery within 4-8 hours.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Amazon Logistics shows a live map with delivery vehicle location — take snapshot if available.
- Multiple carriers: Amazon Logistics (most common), Delhivery, BlueDart, Ecom Express, India Post.
- OTP delivery: Some high-value items require OTP at delivery — remind user to keep phone accessible.
- "Arriving Today by 10 PM" means guaranteed same-day delivery for Prime orders.
- If tracking shows "Undeliverable" or "Returning to seller", alert user immediately and suggest contacting support.
- Multi-item orders may ship separately — each item has its own tracking.
- This is a read-only skill — no `confirm_action` or `collect_payment` needed.
- When using ask_user, present information clearly and wait for user response.
