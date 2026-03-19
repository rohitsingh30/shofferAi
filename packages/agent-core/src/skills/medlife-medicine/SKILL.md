---
name: medlife-medicine
description: Order medicines on Medlife — search by name, upload prescription, add to cart, checkout with delivery.
triggers:
  - medlife
  - medlife medicine
  - order medicine medlife
  - buy medicine medlife
  - medlife pharmacy
  - prescription upload medlife
  - medlife order
  - medicine delivery medlife
siteUrl: https://www.medlife.com
requiresAuth: true
params:
  - name: medicine
    required: true
    hint: Medicine name(s) or "upload prescription" (e.g. "Crocin 500mg", "Azithromycin 500", "upload prescription")
  - name: quantity
    required: false
    hint: Quantity for each medicine (default 1 strip/bottle)
  - name: address
    required: false
    hint: Delivery address or pincode
---

# Medlife Medicine Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: ordering specific medicines by name, or uploading a prescription?
- If by name: collect medicine names, strengths, and quantities.
- If prescription: user will need to share a prescription image/file.
- Use `ask_user` to clarify any missing details.
- Ask whether they want branded or generic alternatives if applicable.

### 2. Open Medlife & Verify Login
- Open a NEW tab and navigate to `https://www.medlife.com`.
- Take snapshot. Verify logged in (check for user profile icon or name).
- Set delivery pincode/address if prompted.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Search by Medicine Name
- For each medicine:
  - Type medicine name in the search bar. Take snapshot of results.
  - Match exact medicine: name, strength, form (tablet/capsule/syrup/injection).
  - If multiple brands or generics available, present options with price comparison:
    "Brand Name — ₹XXX for [pack size] — [manufacturer] — [discount %]"
  - Use `ask_user` (input_type "choice") for user to pick preferred option.
  - Add to cart with the requested quantity.
- If medicine requires prescription, Medlife will flag it during checkout.

### 3b. Upload Prescription
- Navigate to "Upload Prescription" or "Order via Prescription" section.
- Use `ask_user` to get prescription image/file from user.
- Upload the prescription image.
- Medlife pharmacist will verify and prepare the order (may take 1-2 hours).
- Inform user: "Prescription uploaded successfully. Medlife will verify and notify you when the order is ready."

### 4. Review Cart
- Go to cart. Take snapshot.
- Use `confirm_action`:
  - Medicines list: name, strength, quantity, price each
  - Subtotal before discount
  - Discount applied (Medlife offers up to 25% off)
  - Delivery charges (free above ₹500 typically)
  - Total payable amount
  - Estimated delivery date (1-3 days for metros)
- Do NOT proceed unless user confirms.

### 5. Checkout & Payment
- Proceed to checkout. Verify delivery address is correct.
- Apply any available coupon codes visible on the page.
- Upload prescription if required and not yet uploaded.
- Use `collect_payment`:
  - summary: JSON with medicines, quantities, prices, discounts, total
  - amount_inr: total payable
  - description: "Medlife medicine order"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment (UPI/card/net banking/COD available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, medicines ordered with quantities, total paid, estimated delivery date, delivery address.
- Remind: "Keep your prescription handy — delivery partner may verify it on delivery."

## Site Notes

- Medlife is a leading online pharmacy in India with up to 25% discount on medicines.
- Prescription is mandatory for Schedule H and Schedule H1 drugs — cannot be bypassed.
- OTC medicines (paracetamol, antacids, vitamins) do not require a prescription.
- Generic alternatives can be 40-80% cheaper — always suggest generics when available.
- Medlife often has combo offers on health/wellness products — mention if relevant.
- Delivery timeline: 1-2 days in metro cities, 3-5 days in tier-2/tier-3 cities.
- COD (Cash on Delivery) is available for most pincodes — offer as a payment option.
- Cold-chain medicines (insulin, vaccines) require special handling and may have restricted delivery.
- Medlife Plus subscription offers additional discounts and free delivery — check if user is a member.
- Reorder feature: previous orders can be quickly reordered from order history.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response at each step.
