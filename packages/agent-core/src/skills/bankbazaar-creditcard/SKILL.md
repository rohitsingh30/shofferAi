---
name: bankbazaar-creditcard
description: Compare and apply for credit cards on BankBazaar — browse offers, compare features, apply online.
triggers:
  - bankbazaar credit card
  - compare credit cards
  - apply for credit card
  - best credit card india
  - credit card apply online
  - bankbazaar card
  - credit card comparison
  - new credit card
  - credit card offers
  - bankbazaar apply
siteUrl: https://www.bankbazaar.com/credit-card.html
requiresAuth: false
params:
  - name: card_type
    required: false
    hint: Type of credit card (e.g. "rewards", "travel", "fuel", "cashback", "premium", "lifetime free")
  - name: bank
    required: false
    hint: Preferred bank (e.g. "HDFC", "SBI", "ICICI", "Axis", "Kotak", "Amex")
  - name: income
    required: false
    hint: Annual income for eligibility check (e.g. "6 LPA", "10 LPA", "25 LPA")
---

# BankBazaar Credit Card Comparison & Application

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Ask user what type of credit card they want: rewards, travel, fuel, cashback, premium, lifetime free.
- Ask for preferred bank if any.
- Ask for annual income range (needed for eligibility filtering).
- Ask for key preferences: annual fee tolerance, reward type, lounge access, fuel surcharge waiver.
- Use `ask_user` for any missing details.

### 2. Open BankBazaar & Verify Login
- Open a NEW tab and navigate to `https://www.bankbazaar.com/credit-card.html`.
- Take snapshot. Check if logged in (profile icon or name visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note: BankBazaar works without login for browsing, but login is needed for application.

### 3. Browse & Filter Credit Cards
- Apply filters based on user preferences: card type, bank, annual fee, features.
- Wait for results to load.
- Take snapshot of filtered credit card listings.
- Extract top 5 cards with: card name, bank, annual fee, joining fee, reward rate, key benefits.

### 4. Present Options to User
- Present top cards via `ask_user` (input_type "choice") with comparison details:
  "HDFC Regalia — ₹2,500/yr — 4X rewards on travel — Lounge access"
  "SBI SimplyCLICK — ₹499/yr — 10X on Amazon — Lifetime free option"
  "Axis Flipkart — ₹500/yr — 5% cashback Flipkart — Fuel surcharge waiver"
- If user wants more details on a specific card, click through and show full features.
- Take snapshot of selected card's detail page.

### 5. Fill Application Form
- Click "Apply Now" on the chosen card.
- Fill in personal details: name, DOB, PAN, phone, email, income, employment type.
- Use `ask_user` for any details not already known: PAN number, employer name, DOB.
- Take snapshot after form is filled.

### 6. Review & Confirm Application
- Use `confirm_action` with application summary:
  - Card name and bank
  - Annual fee / joining fee
  - Key benefits and reward rate
  - User's declared income
  - Any pre-approved offers
  - Processing fee (if any)
- Do NOT proceed unless user confirms.

### 7. Payment (if applicable)
- Some cards have a processing/joining fee collected upfront.
- If fee required, use `collect_payment`:
  - summary: JSON with card_name, bank, fee_type, amount
  - amount_inr: processing/joining fee
  - description: "BankBazaar credit card application fee"
- WAIT for payment confirmation.
- If no upfront fee, skip this step.

### 8. Submit & Confirm
- Submit the application.
- Handle OTP verification via `ask_user` if needed (Aadhaar/phone OTP).
- Take snapshot of confirmation page.
- Report: application reference number, card applied for, expected timeline, next steps (document upload, verification call).

## Site Notes

- BankBazaar is India's largest financial product comparison platform — trusted and RBI-compliant.
- Credit card approval depends on CIBIL score (750+ preferred), income, and existing credit history.
- BankBazaar shows pre-approved offers based on profile — these have higher approval rates.
- Lifetime free cards (no annual fee ever) are popular — filter for these if user is fee-sensitive.
- Chrome profile rsinghtomar3011@gmail.com may have saved profile data on BankBazaar. Do NOT ask user for credentials.
- Application does NOT guarantee approval — bank will independently verify and decide.
- PAN card is mandatory for credit card application in India — ask user if not provided.
- Some banks (HDFC, ICICI) offer instant approval with e-KYC via Aadhaar OTP.
- Annual fee waiver is often available on spending ₹X lakhs/year — mention this to user.
- BankBazaar earns commission from banks — their recommendations may be biased toward higher-commission cards.
- Use `confirm_action` for review, `collect_payment` for any fees. WAIT for user response.
