---
name: customfurnish-curtains
description: Shop on CustomFurnish — buy customized curtains, blinds, wallpapers, measure and order, checkout, pay.
triggers:
  - customfurnish
  - custom furnish
  - order from customfurnish
  - buy curtains online
  - buy curtains
  - custom curtains
  - buy blinds online
  - customfurnish curtains
  - order blinds
siteUrl: https://www.customfurnish.com
requiresAuth: true
params:
  - name: product
    required: true
    hint: What to buy (e.g. "blackout curtains", "roller blinds", "sheer curtains", "wallpaper", "roman blinds")
  - name: room
    required: false
    hint: Room type (e.g. "bedroom", "living room", "kitchen", "office", "balcony")
  - name: dimensions
    required: false
    hint: Window dimensions (e.g. "width 5ft height 7ft", "120cm x 180cm")
  - name: fabric
    required: false
    hint: Fabric preference (e.g. "cotton", "polyester", "silk", "linen", "blackout")
  - name: budget
    required: false
    hint: Max price (e.g. "under 3000", "budget 5000")
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# CustomFurnish Curtains & Blinds Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Clarify Requirements
- Confirm what the user wants: curtains, blinds, wallpaper, or other window treatments.
- Use `ask_user` to clarify: product type (eyelet curtains, rod pocket, tab top, roller blinds, venetian blinds, roman blinds), room, color/pattern preference, fabric type, light control needs (blackout, semi-sheer, sheer).
- **Critical**: Ask for window dimensions — width and height in feet or cm. CustomFurnish products are made to measure.
- Ask about mounting: ceiling mount vs wall mount, inside mount vs outside mount for blinds.
- Note quantity: how many windows to cover.

### 2. Open CustomFurnish & Verify Login
- Open a NEW tab and navigate to `https://www.customfurnish.com`.
- Take snapshot. Verify logged in (account icon or user name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Products
- Navigate to the relevant category (Curtains, Blinds, Wallpapers) or use search.
- Take snapshot of product listing page.
- Apply filters: type, fabric, color, pattern, price range, light filtering level.
- Extract top 3-5 options with: name, fabric, color/pattern, price per sq ft or per piece, light control, style.
- Use `ask_user` (input_type "choice") to present options. Format: "Product Name — Fabric — Color/Pattern — ₹XXX/sq ft — Light: Blackout/Sheer/Semi — Style: Eyelet/Rod Pocket"
- If user is unsure about fabric, explain differences (cotton = natural feel, polyester = durable, blackout = complete darkness).

### 4. View Product Details & Configure
- Click selected product.
- Take snapshot of product page.
- Extract: full name, fabric details, color options, available patterns, price calculation method (per sq ft or per piece), pleat styles, lining options, delivery date.
- Configure the custom order:
  - Enter window dimensions (width x height) as provided by user.
  - Select pleat style/heading type via `ask_user` (input_type "choice") if options exist.
  - Select lining (unlined, lined, blackout lining) via `ask_user` (input_type "choice").
  - Select color/pattern from swatches via `ask_user` (input_type "choice").
- Calculate total price based on dimensions and options.
- Confirm with user: "Custom [product] — [width] x [height] — [fabric] — [color] — ₹X,XXX. Add to cart?"

### 5. Add to Cart & Review
- Click "Add to Cart" with all custom specifications.
- If user has multiple windows, repeat configuration for each window.
- Go to cart, take snapshot.
- Check for applicable discount codes or bulk order discounts.
- Apply best coupon if available.
- Use `confirm_action` to present order summary:
  - Items: product, fabric, color, dimensions, lining, pleat style for each
  - Price: per item based on dimensions
  - Quantity: number of panels/blinds
  - Delivery timeline (custom-made products)
  - Total amount
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Click "Proceed to Checkout".
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, fabrics, dimensions, colors, linings, prices, delivery_timeline, total
  - amount_inr: total amount (number)
  - description: "CustomFurnish curtains and blinds order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Complete Order & Confirm
- Select payment method and complete payment flow.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, items with full specifications (fabric, color, dimensions, lining), price paid, estimated delivery date, installation instructions.

## Site Notes

- CustomFurnish products are made-to-measure — accurate window dimensions are essential. Guide user to measure width and drop (height) correctly.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Delivery takes 10-20 business days as products are custom-made — set expectations early.
- Free shipping on orders above ₹1,499 usually; below that, shipping charges may apply.
- Measurement guide: width should include 6-12 inches extra on each side for curtains; blinds should match exact window width for inside mount.
- Blackout curtains/blinds are essential for bedrooms — recommend if user mentions sleep or light issues.
- Fabric swatches can be ordered for free before committing to a large order — mention this option.
- No returns on custom-made products — double-check dimensions and specifications before confirming order.
- Installation: curtains are DIY (user needs curtain rod); blinds may need professional installation — inform user.
- Bulk discounts may be available when ordering for multiple windows — ask CustomFurnish via the site if applicable.
- Use `confirm_action` for cart review, `collect_payment` for checkout.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
