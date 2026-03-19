---
name: wingreens-sauce
description: Buy sauces, dips, spreads, and condiments from Wingreens Farms — browse catalog, add to cart, order online.
triggers:
  - wingreens
  - wingreens farms
  - buy sauce online
  - wingreens sauce
  - buy dips online
  - wingreens dips
  - order wingreens
  - wingreens spreads
  - buy condiments wingreens
siteUrl: https://www.wingreens.in
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "chipotle mayo, sriracha sauce, peri peri dip, garlic aioli")
  - name: quantity
    required: false
    hint: Quantity per item (default 1) or specific pack size
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD, wallet)
---

# Wingreens Farms Sauce & Dip Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific sauces, dips, spreads, or combos.
- If the user is vague (e.g. "buy some sauces"), use `ask_user` (input_type "freetext"):
  "What kind of sauces/dips are you looking for? Some popular options: Chipotle Mayo, Sriracha, Peri Peri, Tandoori Mayo, Garlic Aioli, Schezwan, Honey Mustard."
- Ask about quantity and any dietary preferences (vegan, low-cal, sugar-free).

### 2. Open Wingreens & Verify Login
- Open a NEW tab and navigate to `https://www.wingreens.in`.
- Take snapshot. Verify logged in (account/profile icon visible in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup that appears on the homepage.

### 3. Browse & Search Products
- Use the search bar or browse categories (Sauces, Dips, Spreads, Combos).
- Take snapshot of search results or category page.
- For each item requested, find the matching product. Check name, flavor, size, price.
- If multiple variants exist (sizes: 130g/180g/450g, or flavors), use `ask_user` (input_type "choice"):
  "Product Name — Size — ₹XXX (MRP ₹YYY) — Brief description"
- If item is out of stock, inform user and suggest similar alternatives from Wingreens range.
- Repeat for all requested items.

### 4. Add to Cart & Apply Offers
- Add each selected product to cart with correct quantity.
- Check for combo deals (e.g. "Buy 3, Save 15%", sauce bundles).
- If combo is better value, suggest it: "There's a combo deal for ₹XXX vs buying separately at ₹YYY. Want the combo?"
- Apply any active coupon codes visible on the site.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with flavor, size, quantity, and price
  - Subtotal
  - Discount / coupon savings
  - Delivery charges (free delivery threshold if applicable)
  - Total payable
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify delivery address.
- Enter or confirm shipping address. Use `ask_user` if address not on file.
- Use `collect_payment`:
  - summary: JSON with products, sizes, quantities, prices, discounts, total
  - amount_inr: total payable amount
  - description: "Wingreens Farms order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Wingreens.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered with quantities, total paid, estimated delivery date.
- Mention: "Track your order on Wingreens website or via the email confirmation."

## Site Notes

- Wingreens Farms is a popular Indian D2C brand for sauces, dips, and spreads — known for preservative-free products.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Popular products: Chipotle Mayo, Sriracha, Tandoori Mayo, Peri Peri, Schezwan, Honey Mustard, Achari Mayo.
- Free delivery above a certain order value (usually ₹399-499).
- Combo packs offer 10-20% savings — always check before adding individual items.
- Products are vegetarian and preservative-free — highlight this if user cares about clean-label food.
- Shelf life is usually 6-9 months for sauces and dips.
- Delivery typically takes 3-7 business days depending on location.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
