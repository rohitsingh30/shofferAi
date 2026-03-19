---
name: furlenco-rent
description: Rent furniture on Furlenco — browse packages and individual items, select monthly subscription, pay.
triggers:
  - furlenco
  - rent from furlenco
  - furlenco furniture
  - rent furniture furlenco
  - furlenco subscription
  - furlenco package
  - rent bed furlenco
  - rent sofa furlenco
  - furlenco monthly rental
siteUrl: https://www.furlenco.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to rent (e.g. "sofa set", "queen bed", "dining table", "1BHK package", "study desk")
  - name: city
    required: false
    hint: City (e.g. "Bangalore", "Delhi", "Mumbai", "Pune", "Hyderabad", "Chennai")
  - name: tenure
    required: false
    hint: Rental tenure (e.g. "3 months", "6 months", "12 months", "24 months")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 1500/month", "budget 3000/month")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, auto-debit)
---

# Furlenco Furniture Rental

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to rent: individual furniture or a full package.
- Use `ask_user` to clarify: city (Furlenco is city-specific), rental tenure (3/6/12/24 months), move-in date, style preference (modern, minimal, classic), budget per month.
- Ask if user wants a curated package (Studio, 1BHK, 2BHK, 3BHK) or individual items.
- Note specific furniture needs: bed size, sofa seating capacity, dining table size.

### 2. Open Furlenco & Verify Login
- Open a NEW tab and navigate to `https://www.furlenco.com`.
- Take snapshot. Verify logged in (profile icon or account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city/location if prompted (Furlenco availability varies by city).

### 3. Browse & Select Products
- Navigate to relevant section: packages or individual categories (living room, bedroom, dining, study).
- Take snapshot of product listing or packages page.
- For packages: extract package name, items included, monthly rent, deposit.
- For individual items: apply filters for price, category, style.
- Extract top 3-5 options with: name, monthly rent by tenure, deposit, style, quality tier.
- Use `ask_user` (input_type "choice") to present options. Format: "Product/Package — ₹XXX/month (12mo) — Deposit ₹X,XXX — Style: Modern — Includes: [items]"
- Highlight Furlenco's design-forward furniture as a differentiator.

### 4. View Product Details & Select Tenure
- Click selected product or package.
- Take snapshot of product page.
- Extract: full name/package contents, monthly rent for each tenure (3/6/12/24 months), refundable deposit, quality (new/refurbished), dimensions, delivery timeline, what is included (assembly, maintenance).
- Present tenure options via `ask_user` (input_type "choice"): "3 months — ₹XXX/mo | 6 months — ₹XXX/mo | 12 months — ₹XXX/mo | 24 months — ₹XXX/mo"
- Longer tenure = significantly lower monthly rent. Show savings clearly.
- Confirm with user: "Subscribe to [product/package] at ₹XXX/month for [tenure]?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Subscribe" with selected tenure.
- Go to cart, take snapshot.
- Check for applicable promo codes, referral discounts, or first-month-free offers.
- Apply best coupon if available.
- Use `confirm_action` to present subscription summary:
  - Product(s)/Package: name, items included, style
  - Monthly rent: per item and total
  - Tenure: selected duration
  - Refundable deposit: amount
  - Delivery and assembly: date, charges (often free)
  - Total upfront: deposit + first month rent
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with products_or_package, monthly_rent, tenure, deposit, delivery, total_upfront
  - amount_inr: total upfront amount (deposit + first month)
  - description: "Furlenco furniture rental subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: subscription ID, products/package rented, monthly rent, tenure, deposit paid, delivery date, auto-debit setup instructions, maintenance coverage details.

## Site Notes

- Furlenco operates in Bangalore, Delhi NCR, Mumbai, Pune, Hyderabad, Chennai — verify city before browsing.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Furlenco is known for design-forward, Instagram-worthy furniture — emphasize aesthetic quality to user.
- Refundable deposit is returned at end of tenure minus damage charges — inform user clearly.
- Free delivery and assembly on most orders — verify at checkout.
- Monthly auto-debit via UPI mandate or card standing instruction is mandatory.
- Furlenco offers free relocation within the same city during tenure — a key benefit for renters.
- Swap feature: users can swap furniture mid-tenure for a small fee — mention if user values variety.
- Maintenance and deep cleaning included in subscription — Furlenco handles all repairs.
- Early closure: penalty may apply for closing before minimum tenure — check terms and inform user.
- Packages offer 20-40% savings vs renting individual items — strongly recommend for full apartment setups.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
