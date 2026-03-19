---
name: urbanladder-furniture
description: Shop on Urban Ladder — browse sofas, beds, tables, storage, check delivery, checkout, pay.
triggers:
  - urban ladder
  - order from urban ladder
  - buy on urban ladder
  - buy furniture urban ladder
  - urban ladder sofa
  - urban ladder bed
  - buy sofa online
  - buy table urban ladder
  - urban ladder storage
siteUrl: https://www.urbanladder.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "3-seater sofa", "king size bed", "dining table", "bookshelf", "TV unit")
  - name: room
    required: false
    hint: Room type (e.g. "living room", "bedroom", "dining room", "study")
  - name: material
    required: false
    hint: Material preference (e.g. "solid wood", "fabric", "leather", "engineered wood")
  - name: budget
    required: false
    hint: Max price (e.g. "under 30000", "budget 50k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# Urban Ladder Furniture Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: furniture type, room it is for, dimensions if relevant.
- Use `ask_user` to clarify: material (solid wood, engineered wood, metal, fabric, leather), color/finish, style (modern, contemporary, traditional, minimalist), budget range.
- Note space constraints if user mentions them (e.g. "compact apartment", specific dimensions).
- Ask about seating capacity for sofas, bed size for beds, seating count for dining sets.

### 2. Open Urban Ladder & Verify Login
- Open a NEW tab and navigate to `https://www.urbanladder.com`.
- Take snapshot. Verify logged in (profile icon or account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: material, price range, brand, color, style, rating, discount, seating capacity, bed size.
- Check delivery availability by entering user's pincode if known.
- Extract top 3-5 options with: name, material, price (MRP vs sale price), dimensions (L x W x H), rating, discount %, delivery estimate.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Material — ₹XX,XXX (XX% off) — ⭐ Rating — L x W x H cm"
- If user wants to see more, scroll or load next page and refine filters.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full name, price, MRP, discount, material, finish/color, dimensions (L x W x H), weight, warranty period, assembly required (yes/no), delivery date, return policy.
- Check pincode-based delivery availability and estimated date.
- If product has color/upholstery variants, present them via `ask_user` (input_type "choice").
- Confirm with user: "Add [product] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart".
- Go to cart, take snapshot.
- Check for applicable offers or discount codes.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, material, finish, dimensions
  - Price: MRP, discount, coupon savings, final price
  - Assembly: included or extra charge
  - Delivery date and charges (Urban Ladder offers free delivery on most items)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, material, dimensions, price, delivery, assembly, total
  - amount_inr: total amount (number)
  - description: "Urban Ladder furniture order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details, price paid, estimated delivery date, assembly details, warranty info.

## Site Notes

- Urban Ladder offers free delivery on most furniture items across major Indian cities.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Assembly is included free for most furniture — verify on product page and inform user.
- Delivery takes 7-30 days depending on product type and location; custom/made-to-order items take longer.
- Urban Ladder has an "Experience Centre" in select cities — mention if user wants to see in person.
- EMI options available on orders above ₹3,000 — present to user if budget is a concern.
- Return policy: 14-day return on most items, no return on customized products.
- Pincode check is critical — some items may not be deliverable to all locations.
- Dimensions are essential for furniture — always present L x W x H clearly in cm.
- Urban Ladder frequently runs seasonal sales (Republic Day, Diwali) — check for active promotions.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
