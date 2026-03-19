---
name: muscleblaze-protein
description: Buy protein supplements on MuscleBlaze — browse whey protein, mass gainers, BCAAs, compare, add to cart, checkout, pay.
triggers:
  - muscleblaze
  - buy protein
  - order protein powder
  - muscleblaze whey
  - buy supplements online
  - whey protein
  - mass gainer
  - buy bcaa
siteUrl: https://www.muscleblaze.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "whey protein 2kg", "mass gainer chocolate", "BCAA", "creatine")
  - name: flavor
    required: false
    hint: Flavor preference (e.g. "chocolate", "vanilla", "cookies and cream", "unflavored")
  - name: weight
    required: false
    hint: Pack size (e.g. "1kg", "2kg", "4.4lb")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 2k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# MuscleBlaze Protein & Supplements Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Gather Requirements
- Confirm what the user wants: whey protein, isolate, mass gainer, BCAA, creatine, pre-workout, or vitamins.
- Use `ask_user` to clarify: flavor preference, pack size (1kg, 2kg, 5kg), brand sub-line (Biozyme, Raw, etc.).
- Note budget constraints and any dietary needs (vegetarian, sugar-free, lactose-free).
- Ask about fitness goal if relevant (muscle gain, lean protein, weight gain).

### 2. Open MuscleBlaze & Verify Login
- Open a NEW tab and navigate to `https://www.muscleblaze.com`.
- Take snapshot. Verify logged in (profile icon or username visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product (e.g. "whey protein chocolate 2kg").
- Take snapshot of search results page.
- Apply filters if relevant: price range, flavor, weight/size, rating (4+ stars), discount.
- Sort by popularity or relevance unless user specifies price sorting.
- Extract top 3-5 options with: product name, protein per serving, flavor, weight, price (MRP vs discounted), rating, discount %.
- Use `ask_user` (input_type "choice") to present options. Format: "MuscleBlaze [Product] [Weight] [Flavor] — Rs X,XXX (XX% off) — [Protein]g/serving — Rating X.X"
- If user wants to see more, scroll or refine filters.

### 4. View Product & Select Variant
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, available flavors, available sizes, protein per serving, nutritional info, authenticity check, rating, reviews count.
- If flavor not yet chosen, present available flavors via `ask_user` (input_type "choice").
- If pack size not chosen, present available sizes with prices via `ask_user` (input_type "choice").
- Check for combo offers (buy 2 save extra, free shaker, etc.) and inform user.
- Confirm selection with user.

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons (MuscleBlaze frequently has coupon codes and bank offers).
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, flavor, weight, protein per serving
  - Price: MRP, discount, coupon savings, final price
  - Free gifts (shaker, sample sachets) if any
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, flavor, weight, price, delivery, total
  - amount_inr: total amount (number)
  - description: "MuscleBlaze supplement order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product (name, flavor, weight), price paid, estimated delivery date, authenticity verification details.

## Site Notes

- MuscleBlaze delivery: 2-5 days in metros, up to 7 days elsewhere. Free delivery above Rs 500 usually.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- MuscleBlaze Biozyme is their premium line — higher protein absorption, higher price.
- Authenticity is a big concern for supplements — MuscleBlaze has a scratch-and-check authenticity system. Mention this.
- MuscleBlaze frequently runs flash sales and combo deals — check active offers.
- EMI options available on higher-value orders — inform user if relevant.
- Flavors can vary in stock — if preferred flavor is unavailable, suggest alternatives.
- Nutritional info (protein per serving, calories, sugar) is critical — always extract and present.
- MuscleBlaze also sells accessories (shakers, gym belts) — combo deals may include these.
- COD available on most products — mention if user prefers.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
