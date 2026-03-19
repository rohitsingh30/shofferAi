---
name: amazon-shopping
description: Shop on Amazon.in — search products, compare options, add to cart, checkout, pay.
triggers:
  - amazon
  - order from amazon
  - buy on amazon
  - amazon order
  - shop on amazon
  - buy from amazon
  - amazon india
  - order on amazon
siteUrl: https://www.amazon.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "iPhone 16", "wireless earbuds under 2000", "office chair")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, Pay Later)
---

# Amazon.in Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (brand, specs, size, color, budget).
- Note any specific requirements (storage, RAM, wattage, dimensions, etc.).

### 2. Open Amazon & Verify Login
- Open a NEW tab and navigate to `https://www.amazon.in`.
- Take snapshot (wait 3-5 seconds for page to fully load — Amazon is heavy).
- **Login check**: Look for `link "Hello, sign in Account & Lists"` in the header. If it says "Hello, sign in", NOT logged in.
  - If logged in, it shows "Hello, [Name]" instead.
- If NOT logged in, click the "Hello, sign in" link and login with operator credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any app-install banners or notification prompts.
- **Delivery location**: Check `button "Delivering to [City] [Pincode]"` in header. Update if needed.

### 3. Search & Browse Products
- Click `searchbox "Search Amazon.in"` in the header.
- Optionally select department from `combobox "Select the department you want to search in"` dropdown.
- Type the product query and press Enter.
- Take snapshot of search results (wait for load).
- Apply filters if budget specified: price range in left sidebar.
- Apply "Prime" filter if user has Prime (faster delivery).
- Extract top 3-5 options with: name, price (MRP vs deal price), rating (stars + count), Prime badge, delivery date.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — ₹X,XXX — ⭐ X.X (Y reviews) — Delivery by [date]"
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product. **Amazon opens product pages in new tabs** — switch to it.
- Take snapshot of product page.
- Extract: full title, price, MRP, discount %, bank offers, coupon offers, delivery date, seller, warranty, return policy.
- If product has variants (color, size, storage, config), present them via `ask_user` (input_type "choice").
- Mention any active deals: "Save ₹X with coupon", "10% off with HDFC card", "No-cost EMI available".
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" button.
- If "Add-on" or "Subscribe & Save" popup appears, dismiss or inform user.
- Navigate to cart: click `link "0 items in cart"` in header or go to `/gp/cart/view.html`.
- Take snapshot of cart page.
- Check for applicable coupons — click "Apply" if visible.
- Use `confirm_action` to present order summary:
  - Product name, variant, quantity
  - Price, any coupons/offers applied, savings
  - Delivery date and charges (free if Prime/above threshold)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Buy" / "Proceed to checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Select delivery speed if options shown (Standard vs Prime).
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, price, delivery, offers, total
  - amount_inr: total amount (number)
  - description: "Amazon.in order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on Amazon (UPI/card/COD/EMI as per user preference).
- Handle OTP via `ask_user` (input_type "otp") if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, price paid, estimated delivery date, seller name.

## Verified Selectors (from live browsing 2026-03-16)

| Element | Selector |
|---------|----------|
| Search bar | `searchbox "Search Amazon.in"` |
| Department dropdown | `combobox "Select the department you want to search in"` |
| Login link | `link "Hello, sign in Account & Lists"` (header) |
| Account menu | `button "Expand Account and Lists"` |
| Cart | `link "0 items in cart"` → `/gp/cart/view.html` |
| Delivery location | `button "Delivering to [City] [Pincode] Update location"` |
| Search icon shortcut | `link "Search, option, forward slash"` |
| Cart shortcut | `link "Cart, shift, option, c"` |

## Site Notes

- Amazon.in delivery: 1-7 days. Prime members get 1-2 day delivery on eligible items.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- **Amazon page is very heavy** — always wait 3-5 seconds after navigation before taking snapshot.
- **Amazon opens product pages in new tabs** — always handle tab switching after clicking a product.
- "Amazon's Choice" and "Best Seller" badges indicate popular/reliable products — mention these.
- Bank offers (5-10% cashback on HDFC, SBI, etc.) are very common — always check and mention.
- Coupon clipping: some products have "Apply ₹X coupon" checkbox — always apply.
- Lightning Deals have countdown timers — inform user if time-limited.
- EMI options: No-cost EMI available on many products above ₹3000 — mention if relevant.
- Amazon Pay balance can be used — check if balance available.
- Fulfilled by Amazon (FBA) sellers are preferred for faster delivery and easier returns.
- Return policy varies: 7-day replacement, 10-day return, or 30-day return — mention on confirmation.
- Gift wrapping available on some items — ask if it's a gift.
- **Keyboard shortcuts**: Amazon has keyboard shortcuts (/ for search, Shift+Option+C for cart) — visible in accessibility tree but not needed.
- **Department filter**: The search bar has a department dropdown — use it to narrow results for ambiguous queries.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
