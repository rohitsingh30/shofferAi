---
name: dyson-store
description: Buy Dyson products on Dyson India — vacuum cleaners, air purifiers, hair dryers, straighteners, fans, lights.
triggers:
  - dyson
  - buy dyson
  - dyson store
  - order from dyson
  - dyson vacuum
  - dyson air purifier
  - dyson hair dryer
  - buy from dyson india
  - dyson supersonic
  - dyson airwrap
siteUrl: https://www.dyson.in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "V15 Detect vacuum", "Supersonic hair dryer", "Purifier Cool air purifier", "Airwrap styler")
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 40k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, EMI, net banking)
---

# Dyson India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, model, use case, budget).
- For vacuum cleaners: ask type (cordless stick, robot, handheld), floor type (hard floors, carpet, pet hair), runtime needed.
- For air purifiers: ask room size, concerns (pollution, allergens, formaldehyde), heating/cooling combo preference.
- For hair care: ask product (Supersonic dryer, Airwrap styler, Corrale straightener, Airstrait), hair type.
- For fans/heaters: ask room size, cooling-only vs hot+cool, air purification combo.
- Note any color/finish preference — Dyson offers multiple colorways per product.

### 2. Open Dyson Store & Verify Login
- Open a NEW tab and navigate to `https://www.dyson.in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (Dyson account icon shows profile in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate via product categories to find the product.
- Take snapshot of product listing page.
- Dyson has fewer SKUs but many variants — present all available models in the category.
- Extract top 3-5 options with: model name, price, key specs, color options, included attachments.
- Use `ask_user` (input_type "choice") to present options. Format: "Dyson Model — ₹XX,XXX — Key Spec — Color — Included Accessories"
- Mention Dyson-exclusive online colors if available.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full product name, price, included attachments/accessories, technology highlights, warranty, delivery date.
- Dyson products rarely have MRP discounts — but check for seasonal offers or bundle deals.
- If product has color variants, present them via `ask_user` (input_type "choice").
- Mention any active offers: "Complimentary attachment worth ₹X", "EMI from ₹X/month", "Exclusive online color".
- Highlight Dyson-specific technologies: Laser Detect (vacuums), HEPA H13 (purifiers), Intelligent Heat Control (hair care).
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for any bundle offers, complimentary accessories, or promo codes — apply if visible.
- Use `confirm_action` to present order summary:
  - Product name, color/finish, included accessories
  - Price (Dyson rarely discounts — note if any offer applied)
  - Additional accessories or docks (if user wants)
  - Warranty: Dyson standard (2 years for most products)
  - Delivery date and charges (Dyson offers free delivery)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, color, accessories, price, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Dyson India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on dyson.in (UPI/card/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, color, price paid, estimated delivery date, warranty details, registration info.

## Site Notes

- Dyson India delivery: 2-5 business days. Free delivery on all products from dyson.in.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Dyson products are premium-priced with minimal discounts — set user expectations upfront.
- Dyson.in exclusive colors are often not available on Amazon/Flipkart — highlight as a buying incentive.
- No-cost EMI is available on most products — present monthly installment amounts to make premium pricing palatable.
- Dyson 2-year warranty is standard; register product on MyDyson app for warranty activation — remind user.
- Dyson Supersonic and Airwrap are frequently out of stock — check availability before presenting.
- Refurbished/outlet products may be available at lower prices on dyson.in/outlet — mention if user is budget-conscious.
- COD is typically NOT available on dyson.in — inform user that prepaid payment is required.
- Dyson demo stores exist in metros (Delhi, Mumbai, Bangalore) — mention if user prefers try-before-buy.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
