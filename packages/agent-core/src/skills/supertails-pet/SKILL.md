---
name: supertails-pet
description: Order pet food and supplies from Supertails — dog/cat food, accessories, medicines, grooming, checkout, pay.
triggers:
  - supertails
  - super tails
  - order from supertails
  - pet food
  - dog food
  - cat food
  - pet supplies
  - order pet food
  - supertails order
  - pet medicine
siteUrl: https://supertails.com
requiresAuth: true
params:
  - name: items
    required: true
    hint: What to order (e.g. "Pedigree adult dog food 3kg", "cat litter", "flea collar for dog")
  - name: pet_type
    required: false
    hint: Pet type (dog, cat, bird, fish)
  - name: address
    required: false
    hint: Delivery address or pincode
  - name: payment_method
    required: false
    hint: Payment preference (UPI, card, COD)
---

# Supertails Pet Supplies Ordering

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect search preferences
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **product** (type: "text", required): What product to search for
2. **budget** (type: "slider", collapsed): Budget range, min 100, max 50000, presets [500, 1000, 2000, 5000]

**CRITICAL**: Do NOT open the browser without knowing what product to search for.
### 1. Get Delivery Details
- BEFORE opening the browser, check if user provided an address.
- If not, use `ask_user` (input_type "freetext"): "What's your delivery address or pincode?"
- If pet type is unclear from the request, use `ask_user` (input_type "choice"): "What type of pet are you ordering for?" with options: Dog, Cat, Bird, Fish, Other.

### 2. Open Supertails & Set Location
- Open a NEW tab and navigate to `https://supertails.com`.
- Take snapshot. Verify logged in (account/profile icon in header).
- If pincode/location popup appears, enter the user's pincode and confirm.
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Confirm location set and products visible.

### 3. Search & Select Products
For each item the user requested:
- Use the search bar to search for the item.
- Take snapshot of results.
- Find the closest match. Check brand, size/weight, pet type, life stage, price.
- If multiple variants, present top 3-5 options with details:
  - Brand and product name
  - Size/weight options (e.g. 1.2kg, 3kg, 7kg, 15kg)
  - Price and any available discounts
  - Ratings
- Use `ask_user` (input_type "choice") to let user pick.
- For food: confirm flavor (chicken, lamb, fish), life stage (puppy/kitten, adult, senior), and pack size.
- For medicines/supplements: confirm pet's weight and dosage requirements.
- For accessories: confirm size (S, M, L, XL) based on pet breed/size.
- Click "Add to Cart". Adjust quantity if user specified.
- If out of stock, inform user and suggest alternatives.
- Repeat for all items.

### 4. Apply Offers
- Check for available coupons/offers.
- Supertails often has first-order discounts and auto-ship savings.
- Apply best available coupon.

### 5. Review Cart
- Open cart, take snapshot.
- Use `confirm_action` to present order summary:
  - Each item with brand, variant, size, and price
  - Discount/coupon applied
  - Subtotal, delivery charges, total
  - Estimated delivery date
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Checkout & Payment
- Proceed to checkout.
- Verify delivery address is correct.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with items, prices, discount, delivery charge, total, estimated delivery
  - amount_inr: total amount (number)
  - description: "Supertails pet supplies order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.

### 7. Place Order & Confirm
- Click "Place Order" or equivalent.
- Handle payment OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: order number, items ordered, total paid, estimated delivery date.

## Site Notes

- Supertails delivers across India — standard delivery 2-5 days, express available in select cities.
- Operator Chrome Profile 3 should be logged in. Do NOT ask user for phone or credentials.
- If session expired, login transparently. OTP goes to operator.
- Supertails is India's largest pet care platform — carries all major brands (Royal Canin, Pedigree, Whiskas, Drools, Farmina).
- Free delivery usually above ₹399-499.
- Subscribe & Save (auto-ship) offers 5-15% discount on recurring orders — mention for food/medicines.
- Pet medicines may require vet consultation — Supertails offers free vet consultations.
- For prescription medicines, check if a prescription upload is required.
- Life stage matters for pet food: Puppy/Kitten (0-1yr), Adult (1-7yr), Senior (7+yr) — confirm with user.
- Supertails uses a React-based SPA — always use Playwright fill/type methods.
- Use `confirm_action` for cart review (no money), `collect_payment` for checkout (actual payment).
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
