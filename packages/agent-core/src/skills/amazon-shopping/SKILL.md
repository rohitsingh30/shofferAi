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


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
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
- Use `ask_user` with `input_type: "carousel"` to present options. Extract the REAL image URL from each product's `<img>` tag on the page. Format:
  ```json
  {
    "input_type": "carousel",
    "cards": [
      {"id": "1", "label": "Product Name", "subtitle": "₹X,XXX · Delivery by [date]", "image": "https://m.media-amazon.com/images/I/real-image...", "badge": "⭐ 4.4 (Y reviews)"}
    ]
  }
  ```
- If user wants to see more, scroll or go to next page.

### 4. View Product Details
- Click selected product. **Amazon opens product pages in new tabs** — switch to it.
- Take snapshot of product page.
- Extract: full title, price, MRP, discount %, bank offers, coupon offers, delivery date, seller, warranty, return policy.
- If product has variants (color, size, storage, config), present them via `ask_user` with `input_type: "chip_bar"`:
  ```json
  {"input_type": "chip_bar", "options": ["Black", "Silver", "Blue"]}
  ```
  Use separate chip_bar calls for each variant type (e.g., one for color, one for storage).
- Mention any active deals: "Save ₹X with coupon", "10% off with HDFC card", "No-cost EMI available".
- Present the final product using `ask_user` with `input_type: "product_card"`:
  ```json
  {
    "input_type": "product_card",
    "question": "Here's what I found:",
    "product": {
      "id": "amazon-asin",
      "name": "Full Product Title",
      "image": "https://m.media-amazon.com/images/I/...",
      "price": 1599,
      "mrp": 2999,
      "discount": "47% off",
      "rating": 4.4,
      "ratingCount": "12K+",
      "delivery": "25 Mar, Tue",
      "deliveryFree": true,
      "specs": ["Key spec 1", "Key spec 2"],
      "offers": ["₹100 off with HDFC Bank", "No-cost EMI from ₹534/mo"],
      "color": "Selected Color",
      "store": "Amazon"
    }
  }
  ```
  Extract REAL values from the product page. User clicks "Add to Cart" in the widget.

### 5. Cart on Website
- After user adds to cart via widget, click "Add to Cart" on Amazon.
- If "Add-on" or "Subscribe & Save" popup appears, dismiss or inform user.
- Navigate to cart and take snapshot.
- Check for applicable coupons — click "Apply" if visible.
- Use `report_cart` to update the cart display with actual items and total.
- User reviews cart in the cart panel and clicks "Proceed to Buy" when ready.

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
- Use `product_card` to present final product with "Add to Cart". Cart review happens in the cart panel.
- Use `collect_payment` for checkout. WAIT for user response. Do NOT auto-proceed.
