---
name: aza-fashion
description: Shop luxury Indian designer fashion on Aza Fashions — browse couture, bridal, festive, and contemporary designer wear, checkout, pay.
triggers:
  - aza fashion
  - aza fashions
  - buy on aza
  - order from aza fashions
  - luxury indian designer
  - aza designer wear
  - aza couture
  - aza bridal wear
siteUrl: https://www.azafashions.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "bridal lehenga", "designer saree", "couture gown", "embroidered sherwani")
  - name: designer
    required: false
    hint: Preferred designer (e.g. "Sabyasachi", "Tarun Tahiliani", "Rohit Bal", "Anamika Khanna")
  - name: size
    required: false
    hint: Size preference (XS, S, M, L, XL, or custom measurements)
  - name: occasion
    required: false
    hint: Occasion (bridal, reception, festive, cocktail, casual, puja)
  - name: budget
    required: false
    hint: Max price (e.g. "under 1 lakh", "budget 50k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, net banking, EMI)
---

# Aza Fashions — Luxury Indian Designer Fashion

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: lehenga, saree, gown, kurta set, sherwani, sharara, or accessories.
- Use `ask_user` to clarify: gender, occasion (bridal, reception, sangeet, festive, cocktail, casual), designer preference, color, embroidery style, fabric, size, budget.
- Aza carries India's top couture designers (Sabyasachi, Tarun Tahiliani, Rohit Bal, Anamika Khanna, Gaurav Gupta, Manish Malhotra, Falguni Shane Peacock) — suggest options if user is undecided.
- Aza is known for bridal and festive couture — position accordingly.

### 2. Open Aza Fashions & Verify Login
- Open a NEW tab and navigate to `https://www.azafashions.com`.
- Take snapshot. Verify logged in (account icon or name in header/top-right).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar or navigate by category (Women, Men, Bridal, Kids, Accessories).
- Take snapshot of search results / category page.
- Apply filters: designer, price range, category, color, occasion, fabric.
- Browse "Trending Now", "New In", or "Aza Edits" for curated recommendations.
- Extract top 3-5 options with: designer, product name, price, fabric, occasion, description.
- Use `ask_user` (input_type "choice") to present options. Format: "Designer — Product Name — ₹XX,XXX — Fabric/Occasion"
- If user wants to see more, scroll or change category/filters.

### 4. View Product & Select Size
- Click selected product.
- Take snapshot of product page.
- Extract: designer, full product name, price, fabric, color, embellishment, available sizes, styling details, delivery timeline, care instructions, return policy.
- If size not provided, present available sizes via `ask_user` (input_type "choice").
- Many Aza pieces are made-to-order — mention delivery time (typically 3-6 weeks for couture).
- Check if customization options are available (measurements, alterations).
- Confirm with user: "Add [designer] [product] at ₹XX,XXX to bag?"

### 5. Add to Bag & Review
- Click "Add to Bag" or "Buy Now".
- Go to bag/cart, take snapshot.
- Check for any active promotions, first-order offers, or bank offers.
- Use `confirm_action` to present order summary:
  - Product: designer, name, size, color, fabric, embellishment
  - Price: final price
  - Delivery timeline (ready-to-ship vs made-to-order)
  - Shipping charges (usually free for luxury items)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, designer, size, color, price, delivery, total
  - amount_inr: total amount (number)
  - description: "Aza Fashions luxury designer order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (designer, name, size, color), price paid, estimated delivery date, return/exchange policy, care instructions.

## Site Notes

- Aza Fashions is India's premier luxury multi-designer boutique, both online and physical stores (Mumbai, Delhi).
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator.
- Couture prices range from ₹10,000 to ₹10,00,000+ — always confirm budget expectations early.
- Made-to-order pieces take 3-6 weeks. Ready-to-ship items deliver in 5-10 business days.
- International shipping available with customs duties calculated at checkout.
- Returns: 48-72 hour return window on ready-to-ship items only. Made-to-order and customized items are non-returnable.
- Aza offers personal styling consultations — mention if user wants expert help choosing.
- All products are authenticated directly from designers — guaranteed genuine.
- EMI options available for high-value purchases — proactively mention for items above ₹25,000.
- Free shipping on most orders within India.
- Use `confirm_action` for bag review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
