---
name: pharmeasy-medicine
description: Order medicines on PharmEasy — search by name or upload prescription, add to cart, checkout.
triggers:
  - pharmeasy
  - order medicine
  - buy medicine
  - order tablets
  - pharmacy online
  - medicine delivery
  - pharmeasy order
  - order meds
  - prescription medicine
siteUrl: https://pharmeasy.in
requiresAuth: true
params:
  - name: medicine
    required: true
    hint: Medicine name(s) or "upload prescription" (e.g. "Crocin 500mg", "Dolo 650", "upload my prescription")
  - name: quantity
    required: false
    hint: Quantity for each (default 1 strip/bottle)
---

# PharmEasy Medicine Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: ordering specific medicines by name, or uploading a prescription?
- If by name: get medicine names and quantities.
- If prescription: will need user to share prescription image.
- Use `ask_user` for clarification.

### 2. Open PharmEasy & Verify Login
- Open a NEW tab and navigate to `https://pharmeasy.in`.
- Take snapshot. Verify logged in.
- Set delivery location if prompted.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Search by Medicine Name
- For each medicine:
  - Type name in search bar. Take snapshot of results.
  - Match exact medicine (name, strength, form — tablet/syrup/injection).
  - If multiple brands/generics, present options with price comparison:
    "Brand Name — ₹XXX for [pack size] — [manufacturer]"
  - Add to cart with requested quantity.
- If medicine requires prescription, PharmEasy will ask for it during checkout.

### 3b. Upload Prescription
- Navigate to "Upload Prescription" section.
- Use `ask_user` to get prescription image/file from user.
- Upload the prescription.
- PharmEasy pharmacist will verify and add medicines — this takes 30-60 minutes.
- Inform user: "Prescription uploaded. PharmEasy will prepare your order and notify you."

### 4. Review Cart
- Go to cart. Take snapshot.
- Use `confirm_action`:
  - Medicines list: name, strength, quantity, price each
  - Subtotal
  - Delivery charges (free above ₹499 usually)
  - Discount (PharmEasy offers up to 25% off on medicines)
  - Total amount
  - Estimated delivery (1-2 days for most areas)
- Do NOT proceed unless user confirms.

### 5. Checkout & Payment
- Proceed to checkout. Verify delivery address.
- Upload prescription if required and not yet uploaded.
- Use `collect_payment`:
  - summary: JSON with medicines, quantities, prices, total
  - amount_inr: total
  - description: "PharmEasy medicine order"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment (UPI/card/COD available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation.
- Report: order ID, medicines ordered, total paid, estimated delivery date.
- Remind: "Keep prescription handy. Delivery partner may ask for it."

## Site Notes

- PharmEasy is India's largest online pharmacy. Up to 25% discount on medicines.
- Prescription required for Schedule H/H1 drugs — non-negotiable.
- OTC medicines (Crocin, Dolo, antacids) don't need prescription.
- Generic alternatives are often 50-80% cheaper — suggest if available.
- PharmEasy Plus membership: free delivery, extra discounts.
- COD (Cash on Delivery) available — mention as option.
- Delivery: 1-2 days in metros, 2-4 days in other cities.
- Cold-chain medicines (insulin, etc.) have special delivery — may take longer.
- Substitution: PharmEasy may substitute with equivalent brand if stock out — inform user.
- Health products (vitamins, wellness) also available — no prescription needed.
- Reorder feature: if user has ordered before, previous orders can be reordered quickly.
- Use `confirm_action` for review, `collect_payment` for checkout. WAIT for user response.
