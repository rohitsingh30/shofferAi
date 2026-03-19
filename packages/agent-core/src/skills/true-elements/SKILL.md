---
name: true-elements
description: Buy healthy snacks, granola, seeds, muesli, and superfoods from True Elements — browse, add to cart, order online.
triggers:
  - true elements
  - trueelements
  - buy granola online
  - buy healthy snacks
  - true elements order
  - seeds and nuts online
  - true elements muesli
  - buy superfoods online
  - healthy breakfast online
siteUrl: https://www.trueelements.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "quinoa granola, chia seeds, no added sugar muesli, protein cookies")
  - name: dietary_pref
    required: false
    hint: Dietary preference (gluten-free, vegan, sugar-free, high-protein)
  - name: quantity
    required: false
    hint: Quantity per item (default 1) or pack size preference
---

# True Elements Healthy Food Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific products or category-based browsing.
- If the user is vague (e.g. "want some healthy snacks"), use `ask_user` (input_type "freetext"):
  "What are you looking for? Options include: Granola & Muesli, Seeds & Nuts, Protein Snacks, Breakfast Cereals, Trail Mixes, or Superfoods."
- Ask about dietary preferences: gluten-free, vegan, no added sugar, high-protein.
- Check if they want individual products or combo/assortment packs.

### 2. Open True Elements & Verify Login
- Open a NEW tab and navigate to `https://www.trueelements.com`.
- Take snapshot. Verify logged in (check for account icon in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any popup (newsletter, first-order discount banner).

### 3. Search & Browse Products
- Use search bar or navigate categories: Granola, Muesli, Seeds, Snacks, Superfoods.
- Take snapshot of product listings.
- For each requested item, find the matching product. Extract: name, weight, price, MRP, discount, key features.
- If multiple variants (flavors, sizes like 350g/700g/1kg), use `ask_user` (input_type "choice"):
  "Product Name — Weight — ₹XXX (MRP ₹YYY, XX% off) — Features: gluten-free/vegan/no sugar"
- If item is out of stock, inform user and suggest close alternatives.
- Highlight "bestseller" or "new launch" tags if present.
- Repeat for all requested items.

### 4. Add to Cart & Check Offers
- Add each selected product to cart with correct quantity.
- Check for active offers: combo deals, buy-2-get-1, first-order discounts.
- If a combo or bundle saves money, suggest it: "Bundle of 3 for ₹XXX saves ₹YYY vs buying separately."
- Apply any visible coupon codes on the site.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with name, weight, quantity, and price
  - Subtotal
  - Discount / coupon savings
  - Delivery charges (free delivery threshold)
  - Total payable
  - Estimated delivery timeline
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if address is needed.
- Use `collect_payment`:
  - summary: JSON with products, weights, quantities, prices, discounts, total
  - amount_inr: total payable amount
  - description: "True Elements order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on True Elements.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered with weights, total paid, estimated delivery date.
- Mention: "All True Elements products are 100% whole grain with no artificial ingredients."

## Site Notes

- True Elements is an Indian D2C health food brand — specializes in whole grain, no-maida, no-refined-sugar products.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Popular products: Quinoa Granola, Steel Cut Oats, Chia Seeds, Roasted Sunflower Seeds, No Added Sugar Muesli, Protein Cookies.
- Products are categorized by goal: Weight Management, Protein, Heart Health, Immunity, Diabetic-Friendly.
- Free delivery above ₹499 usually. Standard delivery takes 4-7 business days.
- Combo packs and assorted boxes (e.g. "Healthy Breakfast Box") offer 15-25% savings.
- All products carry FSSAI certification. Many are gluten-free and vegan-certified.
- Check "Best Before" dates — True Elements products typically have 6-12 month shelf life.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
