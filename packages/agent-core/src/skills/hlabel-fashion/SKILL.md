---
name: hlabel-fashion
description: Buy H&M fashion on hm.com/in — browse clothing, select size and color, add to bag, checkout, pay.
triggers:
  - h&m
  - hm fashion
  - buy from h&m
  - order h&m
  - hm india
  - h and m clothing
  - buy h&m clothes
  - hm online shopping
siteUrl: https://www2.hm.com/en_in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "linen shirt", "basic t-shirt", "jeans", "summer dress", "kids clothing")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, XXL, or EU size)
  - name: gender
    required: false
    hint: Category (men, women, kids, baby)
  - name: budget
    required: false
    hint: Max price (e.g. "under 1500", "budget 2000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking)
---

# H&M Fashion Shopping (India)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: clothing category (tops, bottoms, dresses, outerwear, basics, activewear), gender (men, women, kids, baby).
- Use `ask_user` to clarify: occasion (casual, formal, party, gym), color preference, fabric preference (cotton, linen, denim), style (minimalist, trendy, classic).
- Note size preference. H&M uses EU/UK sizing — help convert if user mentions Indian sizes.
- Note budget — H&M is affordable fashion (Rs 500-4000 range).

### 2. Open H&M India & Verify Login
- Open a NEW tab and navigate to `https://www2.hm.com/en_in`.
- Take snapshot. Verify logged in (account icon or "My Account" showing logged-in state in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product (e.g. "men linen shirt").
- Take snapshot of search results page.
- Apply filters if relevant: size, color, price, category, pattern, material, sustainability (Conscious collection).
- Sort by recommended or newest unless user specifies price sorting.
- Extract top 3-5 options with: product name, color, price, material, available sizes, Conscious badge if any.
- Use `ask_user` (input_type "choice") to present options. Format: "H&M [Product] — [Color] — Rs X,XXX — [Material] — [Conscious badge if applicable]"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Size/Color
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, available colors (with color swatches), available sizes, material composition, care instructions, product description, Conscious collection badge.
- If color not chosen, present available colors via `ask_user` (input_type "choice").
- If size not provided by user, present available sizes via `ask_user` (input_type "choice").
- Check size availability. If preferred size is sold out, suggest alternatives.
- H&M product pages show "Few pieces left" warnings — inform user of low stock.
- Mention if item is part of the Conscious/sustainability collection.

### 5. Add to Bag & Review
- Click "Add to Bag".
- Go to shopping bag, take snapshot.
- Check for applicable offers (H&M Member discounts, seasonal sales, student discounts).
- Apply H&M Member pricing if available.
- Use `confirm_action` to present order summary:
  - Product: name, color, size, material
  - Price: per item, any member discounts, final price
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, size, price, delivery, total
  - amount_inr: total amount (number)
  - description: "H&M fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, color, size), price paid, estimated delivery date, return policy.

## Site Notes

- H&M India delivery: 2-7 days. Free delivery above Rs 999 for members, Rs 1999 for non-members.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- H&M Member program is free — offers 10% welcome discount, points, exclusive offers. Check if account is a member.
- H&M uses EU sizing — XS=EU 32-34, S=EU 36, M=EU 38-40, L=EU 42-44, XL=EU 46-48. Mention size chart.
- Conscious Collection items use sustainable materials — highlight the green tag if user cares about sustainability.
- H&M runs major seasonal sales (up to 70% off) — check for active sale sections.
- No COD on H&M India — prepaid payment only (card, UPI, net banking).
- Returns within 15 days of delivery — items must be unworn with tags attached.
- H&M website can be slow to load — wait for full page load before taking snapshots.
- "Few pieces left" labels indicate low stock — flag urgency to user.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
