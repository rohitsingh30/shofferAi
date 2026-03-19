---
name: 1mg-medicine
description: Order medicines on 1mg (Tata Health) — search by name, upload prescription, compare generics, checkout.
triggers:
  - 1mg
  - tata 1mg
  - order medicine 1mg
  - buy medicine 1mg
  - 1mg pharmacy
  - tata health medicine
  - 1mg order
  - medicine delivery 1mg
  - 1mg prescription
siteUrl: https://www.1mg.com
requiresAuth: true
params:
  - name: medicine
    required: true
    hint: Medicine name(s) or "upload prescription" (e.g. "Crocin 650mg", "Metformin 500mg", "upload prescription")
  - name: quantity
    required: false
    hint: Quantity for each medicine (default 1 strip/bottle)
---

# 1mg (Tata Health) Medicine Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: ordering specific medicines by name, or uploading a prescription?
- If by name: get medicine names, strengths, and quantities.
- If prescription: will need user to share prescription image.
- Use `ask_user` for clarification if medicine name is ambiguous.
- Ask about generic preference: "Would you like me to check for cheaper generic alternatives?"

### 2. Open 1mg & Verify Login
- Open a NEW tab and navigate to `https://www.1mg.com`.
- Take snapshot. Verify logged in (check for profile name or login prompt).
- Set delivery pincode/location if prompted.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Search by Medicine Name
- For each medicine:
  - Type name in search bar. Take snapshot of results.
  - Match exact medicine: name, strength, form (tablet/capsule/syrup/injection).
  - If multiple brands available, show price comparison:
    "Brand Name — ₹XXX for [pack size] — [manufacturer] — [% off MRP]"
  - Suggest generic alternatives if available and significantly cheaper.
  - Add to cart with requested quantity.
- If medicine requires prescription, 1mg will ask during checkout.

### 3b. Upload Prescription
- Navigate to "Upload Prescription" or click the prescription icon.
- Use `ask_user` to get prescription image from user.
- Upload the prescription.
- 1mg pharmacist will verify and prepare order (takes 1-4 hours).
- Inform user: "Prescription uploaded. 1mg will verify and prepare your order."

### 4. Review Cart
- Go to cart. Take snapshot.
- Use `confirm_action`:
  - Medicines list: name, strength, quantity, price each, discount %
  - Subtotal
  - 1mg Cash/wallet balance if applicable
  - Delivery charges (free above ₹149 usually)
  - Coupon/discount applied
  - Total amount
  - Estimated delivery date
- Do NOT proceed unless user confirms.

### 5. Checkout & Payment
- Proceed to checkout. Verify delivery address.
- Apply best available coupon if any.
- Upload prescription during checkout if required and not yet done.
- Use `collect_payment`:
  - summary: JSON with medicines, quantities, prices, discounts, total
  - amount_inr: total amount
  - description: "1mg medicine order"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment (UPI/card/wallet/COD available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, medicines ordered, total paid, estimated delivery date, delivery address.
- Remind: "Keep prescription ready. Delivery partner may verify for Schedule H drugs."
- Mention: "Track your order in the 1mg app or website."

## Site Notes

- 1mg (now Tata 1mg) is one of India's largest online pharmacies with up to 25% off on medicines.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 15-30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Prescription mandatory for Schedule H/H1 drugs — cannot be bypassed.
- OTC medicines (Crocin, Dolo, antacids, vitamins) do not need prescription.
- Generic alternatives on 1mg are often 60-80% cheaper — always suggest when available.
- 1mg Care Plan: subscription for extra discounts and free delivery — check if user has it.
- Delivery: same-day in select cities, 1-2 days in metros, 2-5 days in other areas.
- COD (Cash on Delivery) available for most orders.
- Cold-chain items (insulin, vaccines) have special packaging and may have different delivery times.
- 1mg Lab Tests also available on the platform — but this skill is for medicine orders only.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
