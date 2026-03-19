---
name: myntra-kids
description: Buy kids fashion on Myntra Kids section — browse, select size/color, add to cart, checkout, pay.
triggers:
  - myntra kids
  - buy kids clothes
  - kids fashion myntra
  - children clothing
  - buy kids shoes
  - kids wear online
  - myntra children
  - kids outfit
siteUrl: https://www.myntra.com/kids
requiresAuth: true
params:
  - name: items
    required: true
    hint: What kids items to buy (e.g. "boys t-shirt size 5-6 years", "girls party dress")
  - name: budget
    required: false
    hint: Maximum budget per item or total (e.g. "under 1000 per item")
  - name: brand_preference
    required: false
    hint: Preferred brands (e.g. "H&M, Max, United Colors of Benetton")
---

# Myntra Kids Fashion

Chrome profile: rsinghtomar3011@gmail.com. Operator account logged in.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Check if user specified items, sizes, age group, and gender.
- If missing critical info, use `ask_user` (input_type "freetext"): "What kids items are you looking for? Please mention age/size, gender, and any brand preference."
- Note any budget constraints mentioned.

### 2. Open Myntra Kids Section
- Open a NEW tab and navigate to `https://www.myntra.com/kids`.
- Take a snapshot to verify the page loaded.
- Check if logged in (profile icon shows account name, not "Login").
- **If NOT logged in or session expired, STOP and tell user: "Myntra session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Browse
- Take snapshot to confirm logged-in state.
- Use the search bar at top to search for the requested item (e.g. "boys t-shirt 5-6 years").
- Apply filters: size, brand, price range, discount, customer ratings 4+.
- Take snapshot of filtered results.

### 4. Select Items
- For each requested item:
  - Show top 3-5 options with name, brand, price, rating, discount.
  - Use `ask_user` (input_type "choice") to let user pick.
  - Click the selected product to open detail page.
  - Take snapshot of product page showing size chart and availability.
  - If multiple sizes/colors available, use `ask_user` (input_type "choice") for size and color.
  - Select the chosen size and color.
  - Click "ADD TO BAG".
  - Take snapshot to confirm item added.
- Repeat for all items.

### 5. Review Cart
- Click the bag icon to open cart.
- Take snapshot of cart contents.
- Use `confirm_action` to present order summary:
  - Each item: name, size, color, MRP, discount, final price
  - Subtotal, any coupon suggestions, delivery fee, total
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "PLACE ORDER" to proceed to checkout.
- Verify delivery address. If no address saved, use `ask_user` (input_type "freetext") for address.
- Select address and proceed.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, sizes, prices, delivery fee, total
  - amount_inr: total amount (number)
  - description: "Myntra Kids fashion order"
- STOP and WAIT for payment confirmation.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Myntra.
- Handle any payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items ordered with sizes, total paid, estimated delivery date.

## Site Notes

- Myntra Kids section is at `/kids` — always start there for children's items.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- Session uses cookies — if expired, operator must re-login in Chrome Debug manually.
- Size charts vary by brand — always check the size chart on product page before selecting.
- Myntra often has coupons (MYNTRA200, MYNTRA500) — check coupon section before checkout.
- Free delivery on orders above Rs 499 usually. Below that, Rs 49-99 delivery charge.
- Returns are free within 7-14 days for most kids items.
- Myntra uses React SPA — use Playwright fill/click, wait for navigation after actions.
- Search bar is at top center — click it, type query, press Enter.
- Filter sidebar loads dynamically — wait for filters to render before clicking.
- Use `confirm_action` for cart review, `collect_payment` for actual payment collection.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
