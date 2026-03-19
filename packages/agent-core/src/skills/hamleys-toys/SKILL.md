---
name: hamleys-toys
description: Buy premium toys on Hamleys India — browse by age, category, brand, add to cart, checkout, pay.
triggers:
  - hamleys
  - hamleys toys
  - order from hamleys
  - buy premium toys
  - hamleys india
  - hamleys order
  - gift toys for kids
  - luxury toys
siteUrl: https://www.hamleys.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "teddy bear", "LEGO Technic", "remote control car", "board game")
  - name: age_group
    required: false
    hint: Child's age (e.g. "2-4 years", "6-8 years", "10+")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 10000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Hamleys India Premium Toys

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (toy type, age, brand, occasion, budget).
- Ask if this is a gift — Hamleys offers premium gift wrapping.
- If age not provided, ask via `ask_user` (input_type "freetext"): "What is the child's age? Hamleys categorizes toys by age group."
- Note any brand preferences (LEGO, Nerf, Barbie, Fisher-Price, Hamleys exclusive, etc.).

### 2. Open Hamleys in a NEW Tab & Verify Login
- Open a NEW tab and navigate to `https://www.hamleys.in`.
- Take snapshot. Close any popup/banner if it appears.
- Verify logged in (account/user icon in header, or "My Account" link).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Toys
- Use the search bar to search for the requested toy.
- Take snapshot of results page.
- Apply filters: age group, price range, brand, category (soft toys, action figures, dolls, building & construction, games, outdoor, etc.).
- Extract top 3-5 options with: toy name, brand, price, age recommendation, rating, Hamleys exclusive badge if applicable.
- Use `ask_user` (input_type "choice") to present options. Format: "Toy Name — ₹X,XXX — Brand — Age: X+ years"
- Highlight Hamleys exclusive items if they match the request.
- If user wants more options, scroll or go to next page.

### 4. View Product Details
- Click selected toy.
- Take snapshot of product detail page.
- Extract: full name, brand, price, MRP vs sale price, age recommendation, description, material, dimensions, delivery estimate.
- If product has variants (color, size, edition), present via `ask_user` (input_type "choice").
- Mention gift wrapping option if user indicated this is a gift.
- Confirm: "Add [toy name] at ₹X,XXX to cart?"

### 5. Add to Cart & Check Offers
- Click "Add to Cart" or "Add to Bag".
- Check for active promotions (seasonal sales, combo offers, bank discounts).
- Apply best available coupon or offer code.
- If user wants multiple items, repeat steps 3-5 for each.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with name, brand, variant, and price
  - Gift wrapping charges if selected
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, gift wrap, discount, delivery charge, total
  - amount_inr: total amount (number)
  - description: "Hamleys India toys order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date, gift wrap status.

## Site Notes

- Hamleys is a premium toy brand — prices are generally higher than Amazon/Flipkart but quality is guaranteed.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Hamleys exclusive toys are only available on hamleys.in — highlight these to users.
- Delivery typically 3-7 business days. Metro cities: 2-4 days. Free shipping above ₹499.
- Gift wrapping available for ₹99-199 — always mention for gift purchases.
- Hamleys runs seasonal sales (End of Season, Diwali, Christmas) with up to 50% off.
- EMI options available on premium items (₹3000+) — inform user if relevant.
- Hamleys stocks international brands not easily found elsewhere — good for premium gifting.
- Returns accepted within 7-15 days. Some items (opened board games, etc.) are non-returnable.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
