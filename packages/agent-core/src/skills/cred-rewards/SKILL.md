---
name: cred-rewards
description: Redeem CRED coins for rewards, offers, cashback, and exclusive deals on the CRED platform.
triggers:
  - cred rewards
  - cred coins
  - redeem cred coins
  - cred offers
  - cred cashback
  - cred coin rewards
  - cred store
  - cred deals
siteUrl: https://cred.club/rewards
requiresAuth: true
params:
  - name: reward_type
    required: false
    hint: Type of reward (e.g. "cashback", "voucher", "brand offer", "spin to win")
  - name: brand
    required: false
    hint: Specific brand reward (e.g. "Amazon voucher", "Swiggy coupon", "Myntra discount")
---

# CRED Coins Rewards Redemption

Chrome profile: rsinghtomar3011@gmail.com. Operator CRED account logged in.

## Steps

### 1. Gather Requirements
- Check if user specified what type of reward they want.
- If not, use `ask_user` (input_type "freetext"): "What kind of CRED reward are you looking for? Options include cashback, brand vouchers (Amazon, Swiggy, Myntra, etc.), exclusive deals, or 'spin to win' games."
- Note any specific brand or category preference.

### 2. Open CRED Rewards
- Open a NEW tab and navigate to `https://cred.club/rewards` or `https://cred.club`.
- Take a snapshot to verify page loaded.
- Check if logged in (profile visible, coin balance shown).
- **If NOT logged in or session expired, STOP and tell user: "CRED session expired, please re-login in Chrome Debug."**
- Do NOT ask user for credentials.

### 3. Verify Login & Check Coin Balance
- Take snapshot confirming CRED rewards page.
- Note current CRED coin balance.
- Report coin balance to user.
- Browse available reward categories:
  - Cashback offers, brand vouchers, experiences, games (Jackpot, spin-to-win)
- Take snapshot of available rewards.

### 4. Browse & Select Reward
- Filter rewards by user's preference (type, brand, coin cost).
- Take snapshot of matching rewards.
- Present top options using `ask_user` (input_type "choice"):
  - Reward name, brand, value (e.g. "Rs 100 Amazon voucher"), coin cost, any conditions
- If user wants a game (spin-to-win, jackpot), navigate to games section.
- User selects preferred reward.
- Click on the reward for details.
- Take snapshot of reward details (terms, validity, how to use).

### 5. Review Redemption
- Use `confirm_action` to present redemption summary:
  - Reward: name, brand, value
  - Coin cost
  - Current coin balance and balance after redemption
  - Terms: validity period, usage conditions, any minimum spend
- Do NOT proceed unless user confirms.

### 6. Redeem Reward
- If reward is FREE (coin-only redemption):
  - Click "Redeem" or "Claim".
  - No payment needed — coins are deducted.
- If reward requires payment (discounted purchase):
  - Use `collect_payment` to collect via Razorpay:
    - summary: JSON with reward, value, coin cost, payment amount, terms
    - amount_inr: payment amount (number)
    - description: "CRED reward redemption"
  - STOP and WAIT for payment confirmation.
- Take snapshot of redemption confirmation.

### 7. Confirm & Share
- Take snapshot of reward/voucher code or confirmation.
- Report: reward redeemed, voucher code (if applicable), value, validity, how to use, remaining coin balance.
- If it's a voucher code, share the code with the user explicitly.

## Site Notes

- CRED coins are earned by paying credit card bills via CRED — 1 coin per Rs 1 paid.
- Rewards range from Rs 10 vouchers (low coins) to premium experiences (high coins).
- Popular rewards: Amazon, Flipkart, Swiggy, Zomato, Myntra vouchers.
- "Spin to win" and "Jackpot" games cost coins but can win bigger rewards.
- Rewards are time-limited — availability changes frequently.
- Operator Chrome Profile 3 is logged in. Do NOT ask user for phone or credentials.
- CRED uses React SPA — wait for rewards grid and coin balance to render.
- Session managed by cookies. If expired, operator re-logins in Chrome Debug.
- Some rewards sell out quickly — redeem promptly once user confirms.
- Voucher codes have expiry dates — always note and communicate the validity.
- CRED may show personalized rewards based on spending patterns.
- Use `confirm_action` for redemption review, `collect_payment` only if payment needed.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
