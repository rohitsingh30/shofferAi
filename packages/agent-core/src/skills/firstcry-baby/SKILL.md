---
name: firstcry-baby
description: Buy baby products from FirstCry — diapers, baby food, clothes, toys, gear, checkout, pay.
triggers:
  - firstcry
  - first cry
  - order from firstcry
  - baby products
  - buy diapers
  - baby diapers
  - baby food
  - baby clothes
  - kids toys
  - firstcry order
siteUrl: https://www.firstcry.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "Pampers diapers size M", "Cerelac Stage 2", "baby clothes 6-12 months")
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# FirstCry Baby Products Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Get Delivery Address
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or pincode?"

### 2. Open FirstCry & Set Location
- Open a NEW tab and navigate to `https://www.firstcry.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If pincode popup appears, enter the user's pincode and confirm.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and products visible.

### 3. Search & Select Products
For each item the user requested:
- Use the search bar to search for the item.
- Take snapshot of results.
- Find the closest match. Check brand, size, age group, price, and availability.
- If multiple variants, present top 3-5 options with details:
  - Brand, product name, size/age range
  - Price (MRP vs sale price)
  - Ratings and reviews count
- Use `ask_user` (input_type "choice") to let user pick.
- For clothing: confirm size and age group with user.
- For diapers: confirm size (NB, S, M, L, XL, XXL) and pack count with user.
- For baby food: confirm stage/age and flavor with user.
- Click "Add to Cart" or "Buy Now". Adjust quantity if user specified.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items.

### 4. Apply Offers
- Check for available coupons/offers — FirstCry frequently runs sales.
- Club FirstCry membership discounts may apply.
- Apply best available coupon.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with brand, size, variant, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery charge, total, estimated delivery
  - amount_inr: total amount (number)
  - description: "FirstCry baby products order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.

## Site Notes

- FirstCry delivers across India — standard delivery takes 3-7 days, express 1-3 days.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- FirstCry frequently runs sales (50-80% off) — always check for active offers before checkout.
- Club FirstCry members get extra discounts — operator account may have membership.
- Free delivery usually above ₹299-499 depending on product category.
- For diapers and baby food, sizes/stages correspond to age and weight — confirm with user.
- FirstCry has an extensive return policy (15-30 days) — mention if buying clothes.
- COD available but charges ₹49-99 extra — prefer online payment.
- Product authenticity guaranteed — all major brands (Pampers, Huggies, Cerelac, Carter's).
- FirstCry uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
