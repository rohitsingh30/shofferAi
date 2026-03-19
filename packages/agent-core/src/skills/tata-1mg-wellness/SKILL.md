---
name: tata-1mg-wellness
description: Buy wellness, ayurvedic, and nutrition products on Tata 1mg — vitamins, immunity boosters, skin care, supplements.
triggers:
  - 1mg wellness
  - tata 1mg vitamins
  - buy vitamins online
  - 1mg ayurvedic
  - immunity supplements
  - buy supplements 1mg
  - tata 1mg wellness order
  - skin care supplements
  - buy ayurvedic products online
siteUrl: https://www.1mg.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: Products to buy (e.g. "multivitamin, omega 3 capsules, ashwagandha, biotin for hair, vitamin D3")
  - name: health_goal
    required: false
    hint: Health goal (immunity, hair/skin, energy, bone health, digestion, weight management)
  - name: preference
    required: false
    hint: Preference for ayurvedic/herbal vs allopathic/clinical supplements
---

# Tata 1mg Wellness & Supplements Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Identify what the user wants: specific products, or goal-based recommendations.
- If the user is vague (e.g. "need some vitamins"), use `ask_user` (input_type "freetext"):
  "What health goal are you targeting? Options: Daily Nutrition (multivitamins), Immunity (Vitamin C, Zinc), Hair & Skin (Biotin, Collagen), Bone Health (Calcium, D3), Energy & Stamina (B12, Iron), Digestion (Probiotics), or Ayurvedic (Ashwagandha, Chyawanprash)."
- Ask preference: ayurvedic/herbal vs allopathic supplements.
- Check for any allergies or dietary restrictions (vegetarian capsules, sugar-free).

### 2. Open Tata 1mg & Verify Login
- Open a NEW tab and navigate to `https://www.1mg.com`.
- Take snapshot. Verify logged in (check for account/profile section in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Navigate to the Wellness or Health Supplements section (not the Medicines section).
- Set delivery pincode if prompted.

### 3. Search & Browse Products
- Search for each requested product in the search bar. Take snapshot.
- Filter by: brand, price, rating, discount, vegetarian/vegan, ayurvedic.
- For each product, extract: name, brand, form (tablets/capsules/powder/liquid), count/size, MRP, selling price, discount, rating, reviews.
- Present top 3-5 options per category using `ask_user` (input_type "choice"):
  "Brand Product — Form (tablets/capsules) — Count — ₹XXX (XX% off MRP ₹YYY) — Rating X.X (XXXX reviews)"
- Highlight Tata 1mg branded products (good quality, competitive pricing).
- Mention if products are FSSAI/GMP certified or doctor-recommended.
- Repeat for all requested items.

### 4. Check Product Details
- Click selected product. Take snapshot of product page.
- Review: composition, dosage, benefits, side effects, usage instructions.
- Show key details to user: "Contains X mg of [ingredient], recommended dose: X per day with meals."
- Check for combo offers (e.g. "Buy 2 Get 1 Free", "Pack of 3 save 20%").
- If better value pack exists, suggest it.

### 5. Review Cart
- Add selected products to cart. Navigate to cart. Take snapshot.
- Use `confirm_action` to present order summary:
  - Each product with brand, form, count, and price
  - Quantity for each item
  - Subtotal
  - Discounts applied (product + coupon)
  - Delivery charges (free above ₹249 usually)
  - Total payable
  - Estimated delivery date
  - 1mg authenticity guarantee
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout. Verify delivery address.
- Apply best available coupon code (check for bank offers, first-order, health category discounts).
- Use `collect_payment`:
  - summary: JSON with products, brands, forms, counts, prices, total
  - amount_inr: total payable amount
  - description: "Tata 1mg wellness order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Complete the order on 1mg.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order number, products ordered, total paid, estimated delivery date.
- Dosage reminder: "Take [product] [dosage] [timing] for best results. Consult a doctor if you have pre-existing conditions."
- Mention: "Track your order on the 1mg app or website."

## Site Notes

- Tata 1mg is India's largest health platform — wellness section covers vitamins, supplements, ayurvedic, and personal care.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Navigate to Wellness/Supplements section, NOT the Medicines/Pharmacy section (that requires prescriptions).
- Tata 1mg Lab-verified products have been independently tested — look for "1mg Quality Assured" badge.
- Popular brands: Himalaya, Dabur, Zandu, HealthKart HK Vitals, Muscleblaze, Now Foods, Tata 1mg branded.
- Free delivery above ₹249. Standard delivery: 2-5 business days in metros, 5-8 in other cities.
- Compare price per unit/capsule across brands — some show "per capsule" pricing for easy comparison.
- Check for subscription options (auto-refill) for daily supplements — saves 5-10%.
- Ayurvedic products are popular: Ashwagandha, Shilajit, Chyawanprash, Triphala — highlight if user prefers natural.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
