---
name: slurrp-farm
description: Buy healthy kids snacks, cereals, pancake mixes, and nutrition from Slurrp Farm — browse, add to cart, subscribe or buy.
triggers:
  - slurrp farm
  - slurrp
  - kids snacks online
  - healthy kids food
  - slurrp farm order
  - buy kids cereal
  - slurrp farm snacks
  - baby food online
  - millet snacks kids
siteUrl: https://www.slurrpfarm.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "ragi cookies, millet dosa mix, protein pancake mix, puffs for toddler")
  - name: child_age
    required: false
    hint: Child's age for age-appropriate recommendations (e.g. "2 years", "5 years")
  - name: subscription
    required: false
    hint: Whether to set up subscription (yes/no, default no)
---

# Slurrp Farm Kids Nutrition Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific products, or age-based recommendations.
- If the user is vague (e.g. "healthy snacks for my kid"), use `ask_user` (input_type "freetext"):
  "How old is your child? What type of products are you looking for — snacks (puffs, cookies), cereals, pancake/dosa mixes, or nutrition powders?"
- Ask about dietary needs: any allergies, preference for millet-based or organic.
- Check if they want one-time purchase or subscription (monthly delivery with discount).

### 2. Open Slurrp Farm & Verify Login
- Open a NEW tab and navigate to `https://www.slurrpfarm.com`.
- Take snapshot. Verify logged in (check for account icon or user name in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Close any promotional popup or newsletter signup.

### 3. Browse & Search Products
- Use search bar or browse by category: Snacks, Cereals, Mixes, Nutrition, By Age.
- If child's age was provided, filter by age group (6m+, 1yr+, 2yr+, etc.).
- Take snapshot of product listings.
- For each item, extract: product name, weight/size, price, age recommendation, key ingredients.
- If multiple options, use `ask_user` (input_type "choice"):
  "Product Name — Weight — ₹XXX — Age: X+ — Key: millet/ragi/oats based"
- If item is out of stock, suggest similar alternatives from the catalog.
- Repeat for all requested items.

### 4. Subscription Check
- If user wants subscription, check if the product supports "Subscribe & Save".
- Show subscription savings (typically 10-15% off + free delivery).
- Use `ask_user` (input_type "choice"): "One-time purchase ₹XXX vs Subscribe & Save ₹YYY (every 30/45/60 days)"
- Set up subscription frequency if chosen.

### 5. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with size, quantity, price, and age suitability
  - Subscription details (if any): frequency, per-delivery cost
  - Subtotal
  - Discount / coupon savings
  - Delivery charges
  - Total payable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify or enter delivery address.
- Use `ask_user` if address is needed.
- Apply available coupon codes or first-order discounts.
- Use `collect_payment`:
  - summary: JSON with products, sizes, quantities, prices, subscription info, total
  - amount_inr: total payable amount
  - description: "Slurrp Farm order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on Slurrp Farm.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, items ordered, subscription status (if any), total paid, estimated delivery.
- If subscription was set up, mention: "Your subscription is active. You can manage it from your Slurrp Farm account."

## Site Notes

- Slurrp Farm is a popular Indian D2C brand for healthy kids nutrition — millet-based, no maida, no refined sugar.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after extended inactivity — if login wall appears, ask user to re-login manually in Chrome Debug.
- Products are categorized by age: 6 months+, 1 year+, 2 years+, 4 years+, and family packs.
- Popular products: Ragi Cookies, Millet Puffs, Protein Pancake Mix, Millet Dosa Mix, Foxtail Millet Cereal.
- Subscribe & Save gives 10-15% off and free delivery — worth recommending for regular purchases.
- All products are made from millets (ragi, jowar, foxtail) — naturally gluten-free options available.
- Free delivery above ₹499 typically. Delivery takes 3-7 days across India.
- Combo packs and variety boxes offer significant savings — check before individual purchases.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
