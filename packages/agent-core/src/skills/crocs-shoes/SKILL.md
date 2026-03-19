---
name: crocs-shoes
description: Shop on Crocs India — browse, select size, buy clogs, sandals, slides, and footwear, checkout, pay.
triggers:
  - crocs
  - buy crocs
  - order from crocs
  - crocs clogs
  - crocs sandals
  - buy clogs on crocs
  - crocs india
  - crocs slides
siteUrl: https://www.crocs.in
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "Classic Clog", "LiteRide", "sandals", "Jibbitz charms", "slides")
  - name: size
    required: false
    hint: Shoe size (M7/W9, UK 6, US 8 — Crocs uses unisex sizing)
  - name: gender
    required: false
    hint: Men, Women, Kids, or Unisex
  - name: budget
    required: false
    hint: Max price (e.g. "under 4000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Crocs Footwear Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: clogs, sandals, slides, flip-flops, or Jibbitz charms.
- Use `ask_user` to clarify: product type (Classic Clog, LiteRide, Bayaband, platform), gender, size, color preference, budget range.
- Note any specific model requests (Classic Clog, LiteRide Clog, Bayaband, Classic Crush, Echo Clog).
- Ask about intended use: casual/home, outdoor, beach, office-casual.

### 2. Open Crocs India & Verify Login
- Open a NEW tab and navigate to `https://www.crocs.in`.
- Take snapshot. Verify logged in (profile icon or account name visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters if relevant: gender, price range, color, category (Clogs, Sandals, Slides, Flips, Platform), size.
- Extract top 3-5 options with: model name, price, color options count, available sizes.
- Use `ask_user` (input_type "choice") to present options. Format: "Model Name — ₹X,XXX — Color — Style"
- If user wants to see more, scroll or refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: model name, MRP, sale price, available sizes, available colors, Croslite foam details, delivery date.
- Crocs often have 10+ color options — present top colors via `ask_user` (input_type "choice").
- Present available sizes via `ask_user` (input_type "choice"). Note Crocs uses unisex sizing (e.g., M7/W9).
- Suggest Jibbitz charms if user is buying clogs.
- Confirm with user: "Add [Model] (Size X, Color) at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Bag".
- Go to cart, take snapshot.
- Check for any active promo codes or combo deals.
- Use `confirm_action` to present order summary:
  - Product: model name, color, size
  - Price: MRP, discount, subtotal
  - Delivery charges and estimated delivery date
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Crocs India order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details (model, size, color), price paid, estimated delivery date.

## Site Notes

- Crocs uses UNISEX sizing — M = Men's, W = Women's. E.g., M7/W9 means Men's 7 or Women's 9. Clarify with user.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Crocs frequently runs Buy 2 Get 25% Off or similar combo deals — check promotions banner.
- Free delivery on orders above ₹2,495 typically. Standard delivery 5-7 business days.
- Crocs has a 30-day return policy — items must be unworn with original tags.
- Popular models: Classic Clog, LiteRide 360 Clog, Bayaband, Classic Crush (platform), Echo Clog, Bistro (work).
- Jibbitz charms are popular add-ons for clogs — suggest if user buys clogs with charm holes.
- Crocs Croslite foam makes all models lightweight and comfortable — highlight this material.
- Platform Crocs are trending — Classic Crush and Mega Crush lines for elevated look.
- Size guide is available on product pages — Crocs tend to run roomy, so check size recommendations.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
