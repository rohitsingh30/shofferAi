---
name: philips-store
description: Buy Philips products on Philips India — trimmers, shavers, air fryers, kitchen appliances, lights, personal care.
triggers:
  - philips
  - buy philips
  - philips store
  - order from philips
  - philips trimmer
  - philips air fryer
  - philips shaver
  - buy from philips india
  - philips lights
  - philips grooming
siteUrl: https://www.philips.co.in/
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "beard trimmer", "air fryer XXL", "electric shaver", "LED bulb pack", "garment steamer")
  - name: budget
    required: false
    hint: Max price (e.g. "under 5000", "budget 3k")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, EMI, net banking)
---

# Philips India Store

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants to buy. If vague, use `ask_user` to clarify (product category, use case, budget).
- For personal care: ask type (trimmer, shaver, epilator, grooming kit, hair dryer), features needed (waterproof, cordless, multi-blade).
- For kitchen appliances: ask type (air fryer, mixer grinder, juicer, blender, coffee maker), capacity, family size.
- For lights: ask type (LED bulb, tube light, smart light, decorative), wattage, color temp (warm/cool), quantity.
- For garment care: ask type (iron, garment steamer), features (cordless, auto-off).
- Note any specific series preference (OneBlade, Series 5000/7000/9000 for shavers, Viva/Avance for kitchen).

### 2. Open Philips Store & Verify Login
- Open a NEW tab and navigate to `https://www.philips.co.in/`.
- Take snapshot. Dismiss any cookie consent or promotional popups.
- Verify logged in (MyPhilips account icon/name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Use the search bar to search for the product category and specifications.
- Take snapshot of search results page.
- Apply relevant filters: price range, product type, features, rating, offers.
- Extract top 3-5 options with: model name, price (MRP vs offer price), key specs, customer rating, offers.
- Use `ask_user` (input_type "choice") to present options. Format: "Philips Model — ₹X,XXX — Key Feature — ⭐ Rating — Offer"
- If user wants to compare, present side-by-side key spec differences.

### 4. View Product Details
- Click selected product.
- Take snapshot of product page.
- Extract: full model name, price, MRP, discount %, what's in the box, key features, warranty, delivery date.
- If product has variants (color, size), present them via `ask_user` (input_type "choice").
- Mention any active offers: "Save ₹X with bank card", "Bundle deal", "Cashback offer".
- For trimmers/shavers: highlight blade type, battery life, charging time, waterproof rating, travel lock.
- For air fryers: highlight capacity (liters), wattage, pre-set programs, rapid air technology.
- For lights: highlight wattage, lumens, color temperature, lifespan, energy efficiency.
- Confirm with user: "Add [product] at ₹X,XXX to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" or "Buy Now".
- Go to cart, take snapshot.
- Check for applicable coupons, bundle deals, or promo codes — apply if visible.
- Suggest complementary accessories (replacement blades, extra attachments, cleaning kits) if relevant.
- Use `confirm_action` to present order summary:
  - Product name, model number, variant, quantity
  - Price, any discounts/offers applied, bundle savings
  - Additional accessories if added
  - Warranty: standard Philips warranty
  - Delivery date and charges
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with product, model, specs, price, warranty, delivery, total
  - amount_inr: total amount (number)
  - description: "Philips India store order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method on philips.co.in (UPI/card/COD/EMI/net banking as per user preference).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, product, model number, price paid, estimated delivery date, warranty details.

## Site Notes

- Philips India delivery: 3-7 business days. Free delivery on orders above ₹999 typically.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Philips.co.in is the official store — products come with full manufacturer warranty and genuine accessories.
- Philips OneBlade is their hero product for grooming — versatile for trim, edge, and shave. Recommend if user unsure.
- Replacement blades/heads can be ordered separately — remind user of ongoing costs for trimmers/shavers.
- Air fryers are extremely popular — Philips is the market leader. Recommend capacity based on family size (4.1L for 2-3 people, 6.2L XXL for 4+).
- Bank offers and seasonal sales (Diwali, Republic Day) offer best discounts — check active promotions.
- Philips smart lights (Hue range) require a bridge for full functionality — confirm if user needs the starter kit.
- Bundle deals (trimmer + shaver, or air fryer + accessories) often provide better value — check and suggest.
- Product registration on Philips website extends warranty support — remind user to register after delivery.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
