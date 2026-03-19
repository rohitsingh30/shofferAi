---
name: amazon-subscribe
description: Set up Amazon Subscribe & Save — recurring delivery of groceries, essentials, baby care, pet supplies at discounted prices.
triggers:
  - amazon subscribe
  - subscribe and save
  - amazon recurring
  - amazon auto delivery
  - amazon subscription
  - recurring grocery
  - amazon essentials delivery
  - subscribe save amazon
  - auto order amazon
  - amazon monthly delivery
siteUrl: https://www.amazon.in/gp/subscribe-and-save/manager
requiresAuth: true
params:
  - name: items
    required: true
    hint: Items to subscribe (e.g. "Tata Tea Gold", "diapers", "dog food", "dish soap, laundry detergent")
  - name: frequency
    required: false
    hint: Delivery frequency (e.g. "every month", "every 2 months", "every 3 months")
  - name: budget
    required: false
    hint: Monthly budget (e.g. "under 2000", "around 1000")
---

# Amazon Subscribe & Save

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm which items the user wants on recurring delivery. Use `ask_user` to clarify:
  - Specific products and brands (e.g. "Tata Tea Gold 1kg", "Huggies diapers size M").
  - If user gives a general category (e.g. "groceries"), ask for the specific list.
  - Delivery frequency: monthly, every 2 months, every 3 months, every 6 months.
  - Budget constraints if any.
- Ask if they want to review existing subscriptions or add new ones.
- Note any brand preferences or alternatives acceptable.

### 2. Open Amazon Subscribe & Save & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in/gp/subscribe-and-save/manager`.
- Take snapshot. Verify logged in (greeting "Hello, [name]" in top bar).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.
- Take snapshot of existing subscriptions if any.

### 3. Search & Select Products
- For each item the user wants:
  - Search for the product on Amazon using the search bar.
  - Filter results to show items with "Subscribe & Save" option.
  - Take snapshot of search results.
  - Extract top 3-4 options with: brand, name, size/quantity, Subscribe & Save price, regular price, discount %, rating, delivery frequency options.
  - Use `ask_user` (input_type "choice") to present options:
    - "Tata Tea Gold 1kg — Rs XXX (Subscribe) vs Rs XXX (Regular) — Save XX% — 4.5 stars"
    - "Red Label 1kg — Rs XXX (Subscribe) vs Rs XXX (Regular) — Save XX% — 4.3 stars"
- Repeat for each item in the user's list.

### 4. Configure Subscription
- For each selected product:
  - Click on the product and navigate to product page.
  - Select "Subscribe & Save" option (not one-time purchase).
  - Choose delivery frequency via `ask_user` (input_type "choice"):
    - "Every 1 month"
    - "Every 2 months"
    - "Every 3 months"
    - "Every 6 months"
  - Select quantity if applicable.
  - Click "Subscribe Now" or "Add to Subscribe & Save".
  - Take snapshot confirming subscription added.
- After all items added, navigate to subscription dashboard.

### 5. Review Subscriptions
- Take snapshot of Subscribe & Save dashboard showing all subscriptions.
- Use `confirm_action` to present complete subscription summary:
  - List of all items with: product name, quantity, price, frequency
  - Total monthly/recurring cost estimate
  - Next delivery date for each item
  - Total savings vs one-time purchase
  - Delivery address
- Do NOT finalize unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- If first subscription setup requires payment method confirmation:
- Verify delivery address is correct. Update via `ask_user` if needed.
- Use `collect_payment`:
  - summary: JSON with all subscribed items, frequencies, prices, total recurring cost
  - amount_inr: first delivery total (number)
  - description: "Amazon Subscribe & Save setup"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Confirm Subscriptions
- Complete subscription setup.
- Handle OTP via `ask_user` if needed for payment verification.
- Take snapshot of confirmed subscriptions page.
- Report: list of all active subscriptions, frequency, next delivery date, monthly cost estimate, total savings.
- Mention: "You can manage, skip, or cancel individual subscriptions anytime from your Amazon account. You will receive a reminder email before each delivery."

## Site Notes

- Amazon Subscribe & Save offers 5-15% discount on regular prices. More subscriptions = higher discount tier.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Discount tiers: 5+ items in a single delivery = up to 15% off. Inform user about stacking benefits.
- Common categories: groceries, household supplies, baby care, pet food, personal care, health supplements.
- Delivery frequency: 1, 2, 3, 4, 5, or 6 months. Monthly is most common for consumables.
- Users can skip a delivery or cancel anytime — no lock-in. Mention this for reassurance.
- Subscribe & Save items ship with regular Amazon orders — no separate shipping fee.
- Some products have "Subscribe & Save coupon" for additional savings — always check and apply.
- Payment is charged before each delivery, not upfront for all future deliveries.
- First delivery can be scheduled immediately or for a future date.
- Not all Amazon products have Subscribe & Save — if unavailable, suggest alternatives or one-time purchase.
- Use `confirm_action` for subscription review, `collect_payment` for first delivery. WAIT for user response.
