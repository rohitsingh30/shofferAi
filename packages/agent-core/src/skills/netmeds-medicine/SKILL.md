---
name: netmeds-medicine
description: Order medicines on Netmeds — search by name, check generic alternatives, upload prescription, order.
triggers:
  - netmeds
  - netmeds medicine
  - order medicine netmeds
  - buy medicine netmeds
  - netmeds pharmacy
  - netmeds order
  - netmeds prescription
  - generic medicine netmeds
  - netmeds delivery
siteUrl: https://www.netmeds.com
requiresAuth: true
params:
  - name: medicine
    required: true
    hint: Medicine name(s) or "upload prescription" (e.g. "Azithromycin 500mg", "Pan D", "upload prescription")
  - name: quantity
    required: false
    hint: Quantity for each medicine (default 1 strip/bottle)
---

# Netmeds Medicine Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Requirements
- Determine: ordering specific medicines by name, or uploading a prescription?
- If by name: get medicine names, strengths (mg/ml), and quantities.
- If prescription: will need user to share prescription image.
- Use `ask_user` for clarification if medicine name is ambiguous or strength is missing.
- Ask: "Would you like me to check for cheaper generic alternatives on Netmeds?"

### 2. Open Netmeds & Verify Login
- Open a NEW tab and navigate to `https://www.netmeds.com`.
- Take snapshot. Verify logged in (check for "My Account" or user name).
- Set delivery pincode if prompted.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3a. Search by Medicine Name
- For each medicine:
  - Use the search bar to type medicine name. Take snapshot of search results.
  - Match exact medicine: name, strength, form (tablet/capsule/syrup/cream/injection).
  - Check "Generic Alternatives" section — Netmeds prominently shows these.
  - Present options with price and generic comparison:
    "Brand — ₹XXX for [pack] — [manufacturer] | Generic: ₹YYY (ZZ% cheaper)"
  - Use `ask_user` (input_type "choice") if multiple options exist.
  - Add selected medicine to cart with requested quantity.
- If medicine requires prescription, Netmeds flags it — will be needed at checkout.

### 3b. Upload Prescription
- Navigate to "Upload Prescription" section on Netmeds.
- Use `ask_user` to get prescription image from user.
- Upload the prescription.
- Netmeds pharmacist will verify and add medicines to order.
- Inform user: "Prescription uploaded. Netmeds will verify and prepare your order."

### 4. Review Cart
- Navigate to cart. Take snapshot.
- Use `confirm_action`:
  - Medicines list: name, strength, form, quantity, MRP, discounted price
  - Netmeds discount (up to 25% off)
  - Subtotal after discount
  - Delivery charges (free above ₹500 usually)
  - NMS SuperSaver/wallet discount if applicable
  - Total payable amount
  - Estimated delivery (2-4 business days)
- Do NOT proceed unless user confirms.

### 5. Checkout & Payment
- Proceed to checkout. Verify delivery address and pincode.
- Upload prescription if prompted and not yet done.
- Apply coupon code if available (check for FIRST order discounts).
- Use `collect_payment`:
  - summary: JSON with medicines, quantities, prices, discount, total
  - amount_inr: total payable
  - description: "Netmeds medicine order"
- WAIT for payment confirmation.

### 6. Complete & Confirm
- Complete payment (UPI/card/net banking/wallet/COD available).
- Handle OTP via `ask_user` if needed.
- Take snapshot of order confirmation page.
- Report: order ID, medicines ordered, total paid, estimated delivery date.
- Remind: "Keep prescription handy for delivery. Pharmacist may call to verify."
- Mention: "Track your order on the Netmeds app or website under My Orders."

## Site Notes

- Netmeds is a Reliance-owned online pharmacy — one of the top 3 in India.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 15-30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Netmeds is strong on generic medicine visibility — always check the "Generic Alternatives" tab.
- Generic medicines can be 50-85% cheaper than branded equivalents.
- Prescription mandatory for Schedule H/H1 drugs — cannot be bypassed on any platform.
- OTC items (pain relief, antacids, vitamins, health devices) do not need prescription.
- Netmeds First (loyalty program) gives extra cashback — check if user is enrolled.
- Delivery: 2-4 days in metros, 4-7 days in smaller cities. Express delivery in select areas.
- COD available for orders under ₹2000 in most pincodes.
- Netmeds also sells wellness, personal care, and Ayurveda products.
- Use `confirm_action` for cart review, `collect_payment` for checkout. WAIT for user response.
