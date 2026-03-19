---
name: rentomojo-rent
description: Rent furniture and appliances on Rentomojo — browse items, select tenure, subscribe, pay deposit.
triggers:
  - rentomojo
  - rent from rentomojo
  - rent furniture
  - rent appliances
  - rentomojo furniture
  - rentomojo appliance
  - rent sofa
  - rent washing machine
  - rent on rentomojo
siteUrl: https://www.rentomojo.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to rent (e.g. "sofa set", "washing machine", "refrigerator", "bed with mattress", "AC")
  - name: city
    required: false
    hint: City (e.g. "Bangalore", "Delhi", "Mumbai", "Pune", "Hyderabad")
  - name: tenure
    required: false
    hint: Rental tenure (e.g. "3 months", "6 months", "12 months")
  - name: budget
    required: false
    hint: Monthly rent budget (e.g. "under 1000/month", "budget 2000/month")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, auto-debit)
---

# Rentomojo Furniture & Appliance Rental

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to rent: furniture type or appliance, category, quantity.
- Use `ask_user` to clarify: city (Rentomojo is city-specific), rental tenure (3/6/12 months), move-in date, budget per month.
- Ask about specific needs: bedroom set vs individual pieces, appliance capacity (e.g. washing machine kg, fridge liters, AC tonnage).
- Note if user wants a furniture package (e.g. "1BHK package", "2BHK package") vs individual items.

### 2. Open Rentomojo & Verify Login
- Open a NEW tab and navigate to `https://www.rentomojo.com`.
- Take snapshot. Verify logged in (profile icon or account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Set city/location if prompted (Rentomojo requires city selection for availability).

### 3. Browse & Select Products
- Navigate to the relevant category (furniture, appliances, packages).
- Take snapshot of product listing page.
- Apply filters: category, price range, brand, tenure, availability.
- Extract top 3-5 options with: name, monthly rent, refundable deposit, tenure options, brand/quality, dimensions (for furniture).
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹XXX/month — Deposit ₹X,XXX — Available tenures: 3/6/12 months"
- If user wants packages, show package options with total monthly rent.

### 4. View Product Details & Select Tenure
- Click selected product.
- Take snapshot of product page.
- Extract: full name, monthly rent for each tenure (3/6/12 months), refundable deposit, product quality (new/refurbished), dimensions, delivery date, included items.
- Present tenure options via `ask_user` (input_type "choice"): "3 months — ₹XXX/mo | 6 months — ₹XXX/mo | 12 months — ₹XXX/mo"
- Longer tenure = lower monthly rent. Highlight savings.
- Confirm with user: "Add [product] at ₹XXX/month for [tenure] to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" with selected tenure.
- Go to cart, take snapshot.
- Check for applicable promo codes or first-time user discounts.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product(s): name, quality, dimensions
  - Monthly rent: per item and total
  - Tenure: selected duration
  - Refundable deposit: amount (returned at end of tenure)
  - Delivery date and charges
  - Total upfront: deposit + first month rent + delivery
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with products, monthly_rent, tenure, deposit, delivery_charge, total_upfront
  - amount_inr: total upfront amount (deposit + first month + delivery)
  - description: "Rentomojo rental subscription"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, products rented, monthly rent, tenure, deposit paid, delivery date, auto-debit setup instructions.

## Site Notes

- Rentomojo operates in select cities only (Bangalore, Delhi NCR, Mumbai, Pune, Hyderabad, Chennai) — verify city availability first.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Refundable deposit is returned at the end of tenure minus any damage deductions — clarify this to user.
- Monthly rent is auto-debited — user must set up auto-pay (UPI mandate or card standing instruction).
- Delivery typically takes 3-7 business days after order confirmation.
- Free relocation within the same city once during the tenure — mention this benefit.
- Early closure: user can close subscription early but may forfeit part of deposit — inform user of terms.
- Maintenance and repairs are free during rental period — Rentomojo handles all servicing.
- Packages (1BHK, 2BHK) offer significant savings over renting individual items — recommend if applicable.
- Product quality: "Like New" means refurbished but in excellent condition; "New" means brand new.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
