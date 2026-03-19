---
name: myfirstcanvas-art
description: Buy kids art and craft kits online — drawing supplies, DIY kits, painting sets, creative learning kits.
triggers:
  - art kit for kids
  - craft kit for kids
  - kids art supplies
  - drawing kit children
  - buy art craft kit
  - diy craft kit kids
  - painting set kids
  - creative kit children
  - kids activity kit
siteUrl: https://www.amazon.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to buy (e.g. "watercolor painting kit for 5 year old", "DIY craft kit", "drawing set for kids")
  - name: age_group
    required: false
    hint: Child's age (e.g. "3-5 years", "6-8 years", "10+")
  - name: budget
    required: false
    hint: Max price (e.g. "under 500", "budget 2000")
  - name: platform
    required: false
    hint: Preferred platform (Amazon, Flipkart, FirstCry) — default Amazon
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Kids Art & Craft Kits Shopping

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants: art kit, craft kit, drawing supplies, painting set, DIY project, or activity box.
- Use `ask_user` to clarify if vague: type of art/craft, child's age, skill level, specific interests (painting, clay, origami, etc.).
- If age not provided, ask via `ask_user` (input_type "freetext"): "What is the child's age? This helps pick age-appropriate kits."
- Note any preferences: brand (Faber-Castell, Doms, Camel, Pidilite), kit type (subscription box, one-time), occasion.

### 2. Choose Platform & Open in NEW Tab
- If user specified a platform, use that. Otherwise default to Amazon India.
- Open a NEW tab and navigate to the chosen platform (e.g. `https://www.amazon.in`).
- Take snapshot. Close any popup/banner.
- Verify logged in (account name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search & Browse Art/Craft Kits
- Search for the requested art/craft item with age-appropriate keywords (e.g. "art kit for 6 year old", "DIY craft kit kids").
- Take snapshot of results page.
- Apply filters: age range, price range if budget specified, customer rating 4+, Prime delivery if on Amazon.
- Extract top 3-5 options with: kit name, brand, price, age recommendation, rating, number of items included, delivery date.
- Use `ask_user` (input_type "choice") to present options. Format: "Kit Name — ₹X,XXX — Brand — Age: X+ — Rating: ⭐X.X"
- If user wants more options, scroll or navigate further.

### 4. View Product Details
- Click selected product.
- Take snapshot of product detail page.
- Extract: full name, brand, price, contents list (what is included), age recommendation, material safety info, delivery estimate.
- If product has variants (size, color theme, number of pieces), present via `ask_user` (input_type "choice").
- Mention if the kit is non-toxic and child-safe — important for younger children.
- Confirm: "Add [kit name] at ₹X,XXX to cart?"

### 5. Add to Cart & Check Offers
- Click "Add to Cart".
- Check for available coupons, combo offers, or subscribe-and-save discounts.
- Apply best available offer.
- If user wants multiple kits, repeat steps 3-5 for each item.

### 6. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with name, brand, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total savings, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Checkout & Payment
- Proceed to checkout.
- Verify/select delivery address. Add new address if needed via `ask_user`.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery charge, total
  - amount_inr: total amount (number)
  - description: "Kids art and craft kit order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 8. Place Order & Confirm
- Complete payment flow on site.
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.

## Site Notes

- Art/craft kits are available across Amazon, Flipkart, and FirstCry — Amazon usually has widest selection.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- For children under 3, always check for non-toxic, BIS-certified, and large-piece kits (choking hazard).
- Popular Indian brands: Faber-Castell, Doms, Camel, Pidilite Fevicreate, Toyshine, Imagimake.
- Subscription art boxes (Flintobox, Einstein Box) are available — mention if user wants recurring deliveries.
- Age-appropriate kits: 2-4y (chunky crayons, finger paint), 5-7y (watercolors, clay), 8-12y (sketching, acrylic).
- Prime delivery on Amazon gives 1-2 day delivery for most art supplies.
- Gift wrapping available on Amazon — mention for birthday/occasion purchases.
- Check customer reviews and photos for actual kit contents — description may overstate included items.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
