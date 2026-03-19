---
name: woodenstreet-furniture
description: Shop on WoodenStreet — browse solid wood furniture, customize finish/fabric, checkout, pay.
triggers:
  - woodenstreet
  - wooden street
  - order from woodenstreet
  - buy on woodenstreet
  - woodenstreet furniture
  - solid wood furniture
  - custom furniture online
  - woodenstreet sofa
  - buy wooden bed
siteUrl: https://www.woodenstreet.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "sheesham bed", "teak dining table", "solid wood sofa", "bookshelf", "wardrobe")
  - name: wood_type
    required: false
    hint: Wood type (e.g. "sheesham", "teak", "mango wood", "acacia", "walnut")
  - name: finish
    required: false
    hint: Finish preference (e.g. "honey", "walnut", "teak", "mahogany", "natural")
  - name: budget
    required: false
    hint: Max price (e.g. "under 40000", "budget 60k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI)
---

# WoodenStreet Solid Wood Furniture Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Clarify Requirements
- Confirm what the user wants: furniture type, room it is for, wood preference.
- Use `ask_user` to clarify: wood type (sheesham/rosewood, teak, mango, acacia), finish (honey, walnut, teak, mahogany, natural), upholstery fabric (for sofas/chairs), dimensions, budget.
- Ask about customization needs: WoodenStreet offers custom sizing, fabric, and finish on many products.
- Note room dimensions if user mentions them — critical for solid wood furniture which tends to be bulky.

### 2. Open WoodenStreet & Verify Login
- Open a NEW tab and navigate to `https://www.woodenstreet.com`.
- Take snapshot. Verify logged in (profile icon or account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product.
- Take snapshot of search results page.
- Apply filters: wood type, finish, price range, brand, style, rating, discount, bed size, sofa seating capacity.
- Check delivery availability by entering user's pincode.
- Extract top 3-5 options with: name, wood type, finish, price (MRP vs sale price), dimensions (L x W x H), rating, discount %, customizable (yes/no).
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Wood: Sheesham — Finish: Honey — ₹XX,XXX (XX% off) — ⭐ Rating — L x W x H cm"
- Highlight customization options where available.

### 4. View Product Details & Customize
- Click selected product.
- Take snapshot of product page.
- Extract: full name, wood type, finish options, fabric options (if upholstered), price, MRP, discount, dimensions (L x W x H), weight, warranty, assembly required, delivery timeline.
- If customization is available, present options:
  - Finish variants via `ask_user` (input_type "choice")
  - Fabric/upholstery variants via `ask_user` (input_type "choice")
  - Custom size options if available
- Note that customized items take longer to deliver (made to order).
- Confirm with user: "Add [product] in [finish] at ₹XX,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" with selected customization.
- Go to cart, take snapshot.
- Check for applicable coupons or ongoing sale offers.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Product: name, wood type, finish, fabric (if applicable), dimensions
  - Customization: any custom options selected
  - Price: MRP, discount, coupon savings, final price
  - Assembly: included or extra
  - Delivery timeline (standard vs custom: 15-45 days)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, wood_type, finish, fabric, dimensions, customization, price, delivery_timeline, total
  - amount_inr: total amount (number)
  - description: "WoodenStreet solid wood furniture order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product details with customization, wood/finish/fabric, price paid, estimated delivery date, assembly details, warranty info.

## Site Notes

- WoodenStreet specializes in 100% solid wood furniture — no particle board or MDF. Emphasize this quality to user.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Standard delivery: 15-25 days. Customized/made-to-order items: 25-45 days — set expectations clearly.
- Free delivery on most furniture across India; remote locations may have additional charges.
- WoodenStreet offers EMI starting from ₹1,500/month — mention for high-value items.
- Customization is a key differentiator: users can choose wood, finish, fabric, and sometimes size at no extra cost.
- WoodenStreet has physical stores ("Experience Stores") in 25+ cities — mention if user wants to see/touch before buying.
- Warranty: typically 1-3 years on manufacturing defects; solid wood lasts decades with care.
- Return policy: 7-day return on standard items; no return on customized/made-to-order furniture.
- Solid wood furniture is heavy — inform user about weight for upper floor deliveries (assembly team handles it).
- Wood grain and color may vary slightly from photos due to natural material — this is normal for solid wood.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
