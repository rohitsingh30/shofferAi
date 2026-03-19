---
name: milkbasket-daily
description: Set up daily milk and grocery subscription on Milkbasket — select items, schedule deliveries, manage subscription.
triggers:
  - milkbasket
  - milk basket
  - daily milk
  - milk subscription
  - milk delivery
  - milkbasket order
  - morning delivery
  - daily grocery
  - subscribe milk
  - milkbasket subscription
siteUrl: https://www.milkbasket.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to subscribe (e.g. "toned milk 500ml daily", "curd and bread", "milk and eggs every morning")
  - name: address
    required: false
    hint: Delivery address or area name
  - name: schedule
    required: false
    hint: Delivery schedule (e.g. "daily", "weekdays only", "alternate days", "Mon/Wed/Fri")
---

# Milkbasket — Daily Milk & Grocery Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Collect delivery address and shopping list
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **address** (type: "address", required): Ask for delivery address. Show saved addresses if available.
2. **items** (type: "card_grid", required): Ask what items to buy. Show common grocery items as cards with emoji (🥛 Milk, 🍞 Bread, 🥚 Eggs, 🍚 Rice, 🌾 Atta, 🫒 Oil, 🍬 Sugar, 🫘 Dal, 🧈 Butter, 🍌 Banana, 🧅 Onion, 🥔 Potato). Enable quantity steppers and custom item input.

**CRITICAL**: Do NOT open the browser until you have both the delivery address and at least one item. Without a delivery location, these sites show ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, check what info user provided (items, address, schedule).
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address? Milkbasket delivers by 7 AM to your doorstep."
- If schedule not clear, use `ask_user` (input_type "choice"): "How often do you want delivery?" with options: Daily, Weekdays only, Alternate days, Custom days.
- Clarify items: use `ask_user` (input_type "freetext"): "Which items do you want on subscription? (e.g. Amul toned milk 500ml, curd 400g, bread)"

### 2. Open Milkbasket & Set Location
- Open a NEW tab and navigate to `https://www.milkbasket.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's delivery area or pincode.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery area is serviceable and product catalog visible.
- If area not serviceable, inform user immediately.

### 3. Search & Select Products
- For each item user requested, search in the product catalog.
- Present available options for each item with:
  - Brand name (Amul, Mother Dairy, Nandini, etc.)
  - Variant (toned, full cream, double toned, organic)
  - Size/quantity
  - Price per unit
- Use `ask_user` (input_type "choice") to let user pick brand and variant for each item.
- Browse additional categories if user wants: Milk, Curd & Paneer, Bread & Eggs, Fruits & Vegetables, Snacks, Beverages.
- Ask if user wants to add more items to the daily basket.

### 4. Set Delivery Schedule
- For each item, set the delivery frequency:
  - Daily, Weekdays, Alternate days, or specific days of the week.
- Use `ask_user` (input_type "choice") if different items need different schedules.
- Set quantity per delivery for each item.
- Take snapshot showing the configured subscription basket.

### 5. Review Subscription
- Open the subscription/basket summary, take snapshot.
- Use `confirm_action` to present subscription summary:
  - Each item with brand, variant, quantity, price per unit
  - Delivery schedule for each item
  - Estimated daily/weekly/monthly cost breakdown
  - Delivery time (typically 7 AM)
  - First delivery date
  - Wallet balance or payment method
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment Setup
- Milkbasket uses a prepaid wallet model — user needs to recharge wallet.
- Check current wallet balance.
- If wallet needs recharge, use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, schedule, daily cost, monthly estimate, wallet recharge amount
  - amount_inr: recommended wallet recharge amount (number, suggest 1 week of orders)
  - description: "Milkbasket wallet recharge for daily subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Activate Subscription & Confirm
- Click "Save Basket" or "Start Subscription" or equivalent.
- Handle any verification via `ask_user` if needed.
- Take snapshot of confirmation page showing active subscription.
- Report: subscription items with schedule, estimated daily cost, monthly estimate, first delivery date, wallet balance, instructions to modify subscription later.

## Site Notes

- Milkbasket delivers by 7 AM to your doorstep — order by midnight for next morning delivery.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Milkbasket uses a prepaid wallet — user must have sufficient balance for daily deductions.
- Subscription can be paused/modified anytime before midnight for the next day's delivery.
- Available in select cities: Delhi NCR, Bangalore, Hyderabad, and few others.
- No minimum order value — even a single packet of milk can be delivered.
- Products are sourced fresh daily — perishables have short shelf life.
- Milkbasket may have been acquired by or integrated with other platforms — verify current status.
- Use `confirm_action` for subscription review, `collect_payment` for wallet recharge.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
