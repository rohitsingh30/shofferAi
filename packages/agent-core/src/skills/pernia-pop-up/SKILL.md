---
name: pernia-pop-up
description: Shop designer Indian wear on Pernia's Pop-Up Shop — browse lehengas, sarees, kurtas, bridal wear from top Indian designers, checkout, pay.
triggers:
  - pernia pop up
  - pernias pop up shop
  - buy on pernia
  - order from pernia
  - designer lehenga
  - designer indian wear
  - bridal wear online
  - indian designer fashion
siteUrl: https://www.perniaspopupshop.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "bridal lehenga", "designer saree", "embroidered kurta set", "anarkali")
  - name: designer
    required: false
    hint: Preferred designer (e.g. "Sabyasachi", "Manish Malhotra", "Anita Dongre", "Tarun Tahiliani")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, or custom)
  - name: occasion
    required: false
    hint: Occasion (wedding, sangeet, festive, cocktail, mehendi, casual)
  - name: budget
    required: false
    hint: Max price (e.g. "under 50000", "budget 1 lakh")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking, EMI)
---

# Pernia's Pop-Up Shop — Designer Indian Wear

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What item to search for
2. **size** (type: "chip_bar", collapsed): Size — XS, S, M, L, XL, XXL
3. **budget** (type: "slider", collapsed): Budget range, min 200, max 10000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: lehenga, saree, kurta set, anarkali, bridal wear, gown, or accessories.
- Use `ask_user` to clarify: gender, occasion (wedding, sangeet, mehendi, cocktail, festive, casual), designer preference, color palette, embroidery style, size, budget.
- Pernia's carries top Indian designers (Sabyasachi, Manish Malhotra, Anita Dongre, Tarun Tahiliani, Rahul Mishra, Abu Jani Sandeep Khosla) — mention options if user wants suggestions.
- Note that designer wear is premium priced — confirm budget expectations upfront.

### 2. Open Pernia's Pop-Up Shop & Verify Login
- Open a NEW tab and navigate to `https://www.perniaspopupshop.com`.
- Take snapshot. Verify logged in (account icon or name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate by category (Women, Men, Bridal, Accessories).
- Take snapshot of search results / category page.
- Apply filters: designer, price range, category, color, occasion, fabric, size.
- Browse "New Arrivals", "Bestsellers", or "Editor's Picks" for curated recommendations.
- Extract top 3-5 options with: designer, product name, price, fabric, occasion suitability.
- Use `ask_user` (input_type "choice") to present options. Format: "Designer — Product Name — ₹XX,XXX — Fabric"
- If user wants to see more, scroll or change filters.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: designer name, full product name, price, fabric, color, embellishment details, available sizes, styling notes, delivery timeline, care instructions.
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Note: many designer pieces are made-to-order — mention expected delivery time (2-4 weeks for custom).
- Check if customization is available (length adjustments, blouse measurements).
- Confirm with user: "Add [designer] [product] at ₹XX,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag" or "Buy Now".
- Go to bag/cart, take snapshot.
- Check for any active promotions or first-time buyer offers.
- Use `confirm_action` to present order summary:
  - Product: designer, name, size, color, fabric
  - Price: final price (designer wear rarely has discounts)
  - Delivery timeline (ready-to-ship vs made-to-order)
  - Shipping charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, designer, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Pernia's Pop-Up Shop designer fashion order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (designer, name, size, color), price paid, estimated delivery date, return/exchange policy.

## Site Notes

- Pernia's Pop-Up Shop is India's premier multi-designer luxury fashion platform.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Designer wear prices range from ₹5,000 to ₹5,00,000+ — always confirm budget before browsing.
- Made-to-order items take 2-4 weeks for delivery. Ready-to-ship items deliver in 5-10 days.
- International shipping available — mention if user is outside India.
- Returns: 48-hour return window on ready-to-ship items. Made-to-order items are non-returnable.
- Size exchange available within 48 hours of delivery for ready-to-ship items.
- Pernia's verifies authenticity of all designer pieces — guaranteed genuine.
- EMI options available for high-value purchases — mention proactively for items above ₹20,000.
- Bridal wear section has dedicated stylists — suggest if user needs bridal consultation.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
