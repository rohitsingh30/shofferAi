---
name: paytm-gold
description: Buy digital gold on Paytm — select amount or grams, buy 24K gold, track holdings.
triggers:
  - paytm gold
  - buy gold on paytm
  - digital gold
  - buy digital gold
  - gold investment
  - paytm digital gold
  - 24k gold buy
  - gold on paytm
  - invest in gold
  - buy gold online
siteUrl: https://paytm.com/gold
requiresAuth: true
params:
  - name: amount
    required: false
    hint: Amount in INR to invest (e.g. "₹500", "₹1000", "₹5000")
  - name: grams
    required: false
    hint: Grams of gold to buy (e.g. "0.1g", "0.5g", "1g")
  - name: action
    required: false
    hint: Action to perform — "buy", "sell", or "check holdings"
---

# Paytm Digital Gold

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Ask user what they want: buy gold, sell gold, or check current holdings.
- For buying: ask amount in INR or grams of gold.
- Common buy amounts: ₹100, ₹500, ₹1000, ₹5000, ₹10000.
- If neither amount nor grams specified, show current gold price and let user decide.
- Use `ask_user` for any missing details.

### 2. Open Paytm Gold & Verify Login
- Open a NEW tab and navigate to `https://paytm.com/gold`.
- Take snapshot. Verify logged in (Paytm account visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. View Gold Dashboard
- Take snapshot of the gold dashboard showing:
  - Current gold price per gram (24K, 999 purity)
  - User's existing gold holdings (if any): grams held, current value
  - Buy/sell options
- Report current gold price and holdings to user.
- Gold price fluctuates — show live rate with timestamp.

### 4. Select Purchase Amount
- If buying by amount: enter INR amount → system calculates grams.
- If buying by grams: enter grams → system calculates INR amount.
- If user hasn't decided, present options via `ask_user` (input_type "choice"):
  "₹500 — ~0.07g at current rate"
  "₹1,000 — ~0.14g at current rate"
  "₹5,000 — ~0.70g at current rate"
  "₹10,000 — ~1.40g at current rate"
  "Custom amount"
- Take snapshot showing purchase details with exact grams and amount.

### 5. Review & Confirm
- Use `confirm_action` with purchase summary:
  - Gold purity: 24K, 999 fineness
  - Gold price per gram (live rate)
  - Amount in INR
  - Grams of gold to receive
  - Gold partner (e.g. Augmont, MMTC-PAMP)
  - GST (3% on gold purchase)
  - Total to pay (amount + GST)
  - Storage: free safe custody in insured vault
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with gold_grams, price_per_gram, amount, gst, total, partner
  - amount_inr: total including GST
  - description: "Paytm digital gold purchase"
- WAIT for payment confirmation.

### 7. Complete & Confirm
- Complete payment on Paytm (UPI/card/Paytm wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of success page.
- Report: transaction ID, grams purchased, buy price, total paid, total holdings (updated), gold partner, option to convert to physical gold or gold coin.

## Site Notes

- Paytm Digital Gold is 24K, 999 purity gold stored in insured vaults by partners (Augmont/MMTC-PAMP).
- Gold can be bought for as low as ₹1 on Paytm — no minimum gram restriction.
- GST of 3% is applicable on gold purchase and is added to the buy price.
- Chrome profile rsinghtomar3011@gmail.com is pre-logged into Paytm. Do NOT ask user for credentials.
- Gold price is locked for a few minutes after initiating purchase — complete payment within the window.
- Digital gold can be converted to physical gold coins/bars and delivered to user's address.
- Gold can be sold back anytime at live sell rate (slightly lower than buy rate — bid-ask spread).
- Paytm Gold+ offers additional interest on gold holdings — mention if available.
- Gold is a hedge against inflation — good for portfolio diversification, but returns vary.
- No lock-in period — user can sell anytime. No demat account needed.
- Use `confirm_action` for review, `collect_payment` for purchase. WAIT for user response.
