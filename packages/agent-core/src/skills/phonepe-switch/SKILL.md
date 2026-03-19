---
name: phonepe-switch
description: Access mini-apps on PhonePe Switch platform — order food, book travel, shop, and more within PhonePe.
triggers:
  - phonepe switch
  - phonepe mini apps
  - phonepe switch apps
  - phonepe food order
  - phonepe travel
  - phonepe shopping
  - phonepe switch platform
  - phonepe marketplace
siteUrl: https://www.phonepe.com/switch
requiresAuth: true
params:
  - name: app
    required: false
    hint: Which mini-app to use (e.g. "Ola", "Myntra", "Dominos", "IRCTC")
  - name: task
    required: true
    hint: What to do (e.g. "order pizza", "book cab", "buy clothes")
---

# PhonePe Switch Mini-Apps

Chrome profile: rsinghtomar3011@gmail.com. Operator PhonePe account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified which mini-app or task.
- If not, use `ask_user` (input_type "freetext"): "What would you like to do on PhonePe Switch? Available mini-apps include food delivery, cab booking, shopping, travel, and more."
- Map user's request to the appropriate PhonePe Switch mini-app.
- Note: PhonePe Switch hosts apps like Ola, Myntra, Dominos, IRCTC, Cleartrip, etc.

### 2. Open PhonePe Switch
- Open a NEW tab and navigate to `https://www.phonepe.com/switch` or the PhonePe web app.
- Take a snapshot to verify page loaded.
- Check if logged in (profile/account visible).
- **If NOT logged in or session expired, STOP and tell user: "PhonePe session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Browse Mini-Apps
- Take snapshot confirming PhonePe Switch page.
- Browse available mini-apps by category:
  - Food: Dominos, Pizza Hut, Oven Story, FreshMenu
  - Travel: IRCTC, Cleartrip, Ola, Uber
  - Shopping: Myntra, Flipkart, Ajio
  - Utilities: recharges, bill payments
- Take snapshot of available apps.

### 4. Select & Open Mini-App
- If user specified an app, find and open it.
- If not, present relevant apps using `ask_user` (input_type "choice"):
  - App name, category, description, any PhonePe-exclusive offers
- Click on the selected mini-app.
- Wait for mini-app to load within PhonePe Switch.
- Take snapshot of loaded mini-app.

### 5. Complete Task in Mini-App
- Follow the specific mini-app flow (browse, search, select, add to cart).
- Handle app-specific interactions (login within mini-app if needed, location, preferences).
- Use `ask_user` for choices within the mini-app (items, variants, quantities).
- Take snapshots at each major step.
- Build the cart/booking within the mini-app.

### 6. Review Order/Booking
- Take snapshot of cart or booking summary.
- Use `confirm_action` to present order summary:
  - Mini-app name, items/service details
  - Price breakdown, PhonePe cashback/offers
  - Total amount
- Do NOT proceed unless user confirms.

### 7. Checkout & Payment
- Proceed to checkout within the mini-app.
- Payment goes through PhonePe (UPI, wallet, or cards).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with mini-app, items/service, prices, PhonePe offers, total
  - amount_inr: total amount (number)
  - description: "PhonePe Switch order via [mini-app name]"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed.

### 8. Complete & Confirm
- Complete the order/booking.
- Handle payment OTP or UPI PIN via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: order/booking ID, mini-app used, items/service, total paid, any cashback earned.

## Site Notes

- PhonePe Switch is an in-app platform hosting 100+ mini-apps — web version may have limited apps.
- Payment through PhonePe often gives extra cashback vs paying directly on partner sites.
- Mini-apps run inside PhonePe's webview — some functionality may be limited on web.
- Popular Switch apps: Ola, Myntra, Dominos, Pizza Hut, IRCTC, Cleartrip, Flipkart.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- PhonePe uses React — wait for mini-app iframes to load completely.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- PhonePe cashback is credited to PhonePe wallet — mention this to user.
- If web version is limited, suggest using the dedicated app/site for that service instead.
- Use `confirm_action` for order review (no money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
