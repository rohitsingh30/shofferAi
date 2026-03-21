---
name: country-delight
description: Order fresh milk and dairy from Country Delight — subscription or one-time, farm-fresh products, doorstep delivery.
triggers:
  - country delight
  - countrydelight
  - fresh milk
  - farm milk
  - country delight milk
  - organic milk
  - country delight order
  - dairy subscription
  - fresh dairy
  - cow milk delivery
siteUrl: https://www.countrydelight.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "cow milk 500ml daily", "paneer", "ghee", "curd") or subscription preference
  - name: address
    required: false
    hint: Delivery address or area name
  - name: order_type
    required: false
    hint: One-time order or subscription (e.g. "daily subscription", "one-time", "weekly")
---

# Country Delight — Fresh Milk & Dairy Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### Step 0: Confirm delivery address & phone
**ALWAYS show the address picker** — even if the user mentioned a location like "Tellapur" or "Koramangala". An area name is NOT a complete delivery address (missing flat/building, street, pincode, phone). The user must pick a saved address or enter a full one. The address widget collects flat/building, street, city, pincode, AND contact phone — all critical for delivery.

- If address is missing → call `ask_user` with `input_type: "address"`, question: "What's your delivery address or area name?". Show saved addresses if available.
- **Only skip** if the user provided a FULL address with building/flat, street, city, pincode, AND phone number.
- **Do NOT ask for items** — extract them from the user's message. If truly missing, handoff anyway and let the browser agent figure it out.
- **Do NOT show product cards, prices, or images** — the cloud LLM has no access to the site's catalog. Only the browser agent can fetch real product data.

**CRITICAL**: Do NOT open the browser until you have a complete delivery address with phone. Without a delivery location, Country Delight shows ZERO products.

### 1. Gather Requirements
- BEFORE opening the browser, check what info user provided (items, address, order type).
- If address not provided, use `ask_user` (input_type "freetext"): "What's your delivery address? Country Delight delivers fresh to your doorstep by early morning."
- If order type not clear, use `ask_user` (input_type "choice"): "Do you want a daily subscription or a one-time order?" with options: Daily Subscription, One-Time Order, Weekly Subscription.
- Clarify items if vague: use `ask_user` (input_type "freetext"): "Which products do you want? (e.g. cow milk 500ml, buffalo milk 1L, paneer 200g, dahi 400g, ghee)"

### 2. Open Country Delight & Set Location
- Open a NEW tab and navigate to `https://www.countrydelight.in`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If location/pincode popup appears, enter the user's delivery address or pincode.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm delivery area is serviceable and product catalog visible.
- If area not serviceable, inform user immediately.

### 3. Browse & Select Products
- Navigate to the relevant category based on user's request.
- Present available products with:
  - Product name (e.g. "Farm Fresh Cow Milk", "A2 Cow Milk", "Buffalo Milk")
  - Source/farm info if available
  - Size/quantity options (200ml, 500ml, 1L)
  - Price per unit
  - Quality certifications (chemical-free, farm-fresh, etc.)
- Use `ask_user` (input_type "choice") to let user pick products.
- Browse additional categories: Milk, Curd & Buttermilk, Paneer & Cheese, Ghee & Butter, Eggs, Fruits & Vegetables, Bread & Bakery.
- For each product, select quantity/variant — use `ask_user` (input_type "choice") with prices.
- Add each item to cart.

### 4. Configure Subscription (if applicable)
- If user wants a subscription:
  - Set delivery frequency for each item: Daily, Alternate Days, Custom Days.
  - Set quantity per delivery.
  - Use `ask_user` (input_type "choice") for schedule preferences.
  - Set start date — use `ask_user` if not specified.
- If one-time order, skip subscription setup and proceed to cart.
- Take snapshot showing configured order/subscription.

### 5. Review Order / Subscription
- Open cart or subscription summary, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with variant, quantity, price per unit
  - For subscriptions: delivery schedule, estimated daily/weekly/monthly cost
  - For one-time: item total
  - Delivery fee (if any — often free for subscriptions)
  - Total amount or wallet recharge needed
  - Delivery time (typically early morning, 5-7 AM)
  - First delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment
- Country Delight uses a prepaid wallet model for subscriptions.
- Check current wallet balance.
- Use `collect_payment` to collect via Razorpay:
  - For subscription: summary: JSON with items, schedule, daily cost, monthly estimate, wallet recharge amount
  - For one-time: summary: JSON with items, prices, delivery fee, total
  - amount_inr: total or wallet recharge amount (number)
  - description: "Country Delight order" or "Country Delight wallet recharge"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Click "Place Order" or "Start Subscription" or "Recharge & Subscribe" or equivalent.
- Handle any verification via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order/subscription ID, items with quantities and schedule, total paid or wallet balance, first delivery date, delivery time, instructions to pause/modify subscription.

## Site Notes

- Country Delight sources directly from farms — milk is chemical-free, not pasteurized at ultra-high temps.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Country Delight uses a prepaid wallet — user loads money and daily orders are deducted automatically.
- Delivery happens early morning (5-7 AM) — order by midnight for next day.
- Subscriptions can be paused/modified anytime before midnight for next day.
- Available in select cities: Delhi NCR, Bangalore, Mumbai, Pune, Hyderabad, Jaipur, Chandigarh, Lucknow.
- A2 cow milk is premium priced vs regular cow milk — explain the difference to user if asked.
- Country Delight app may be preferred over website — but web ordering works for our use case.
- Quality scores (out of 10) are shown for milk products — highlight these to user.
- Use `confirm_action` for order/subscription review, `collect_payment` for payment/wallet recharge.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
