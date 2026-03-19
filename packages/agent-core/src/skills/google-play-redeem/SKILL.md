---
name: google-play-redeem
description: Redeem a Google Play gift card or promo code. Enter the code, add balance to the Google account, and verify.
triggers:
  - redeem google play
  - google play gift card
  - google play code
  - redeem play store code
  - google play balance
  - add google play credit
  - play store gift card
  - google play promo code
  - redeem play store
  - google play redeem code
siteUrl: https://play.google.com/store
requiresAuth: true
params:
  - name: code
    required: false
    hint: Google Play gift card or promo code (e.g. "ABCD-1234-EFGH-5678")
---

# Google Play Gift Card Redemption

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Ask the user for their Google Play gift card or promo code via `ask_user` if not provided.
- Clarify the type of code:
  - **Gift Card**: Physical or digital card with a monetary value (e.g., ₹100, ₹500, ₹1000)
  - **Promo Code**: Promotional code for a specific app, game, or in-app item
- If user has a physical card, guide them: "Scratch the back of the card to reveal the code."
- Confirm the code format — Google Play codes are typically in the format XXXX-XXXX-XXXX-XXXX or a shorter promo string.
- Ask if they want to redeem to their own account or check the balance of an existing card.

### 2. Open Google Play Store & Verify Login
- Open a NEW tab and navigate to `https://play.google.com/store`.
- Take snapshot. Check if logged in (Google account avatar in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify the logged-in account matches the intended account — show user the email via `ask_user` for confirmation.
- Important: Gift card balance is tied to the Google account — redeeming to the wrong account cannot be undone.

### 3. Navigate to Redeem Page
- Navigate to `https://play.google.com/redeem` or find the "Redeem" option in the Play Store menu.
- Take snapshot of the redeem page.
- If the redeem page shows current Play balance, note it and inform user of their existing balance.

### 4. Enter Code & Preview
- Enter the gift card or promo code in the redemption field.
- Click "Redeem" or "Next" to validate the code.
- Take snapshot of the validation result.
- If code is invalid, inform user: "This code appears to be invalid. Please double-check and re-enter."
- If code is valid, the page will show:
  - Amount to be added (for gift cards, e.g., "₹500 will be added to your account")
  - Or specific item/app (for promo codes)
- Present this to user for review.

### 5. Confirm Redemption
- Use `confirm_action` with redemption summary:
  - Code (partially masked for security, e.g., "ABCD-****-****-5678")
  - Value being added (e.g., "₹500 Google Play balance")
  - Or promo item being claimed
  - Google account receiving the credit (email)
  - Current balance + new balance after redemption
  - Note: "This action cannot be undone — balance cannot be transferred between accounts"
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with code_masked, value_inr, google_account, redemption_type
  - amount_inr: 0 (redemption is free — the card was already purchased)
  - description: "Google Play gift card redemption"
- WAIT for user confirmation (even though amount is ₹0, this confirms the action).

### 7. Complete & Confirm
- Click the final "Confirm" or "Redeem" button to apply the code.
- Take snapshot of the confirmation page.
- Report to user:
  - Amount added to Google Play balance
  - New total Google Play balance
  - Google account email the credit was added to
  - How to use: "This balance can be used for apps, games, movies, books, and subscriptions on Google Play."
- Mention: "Google Play balance cannot be transferred to another account or refunded to cash."
- If promo code: confirm which app/item was unlocked or credited.

## Site Notes

- Google Play gift cards are available in India in denominations of ₹100, ₹200, ₹500, ₹1000, and ₹1500.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Google. Do NOT ask user for credentials.
- Gift card balance is permanently tied to the Google account it is redeemed on — double-confirm the account before redeeming.
- Google Play balance can be used for: apps, games, in-app purchases, movies, books, and subscriptions (YouTube Premium, Google One, etc.).
- Promo codes are different from gift cards — they unlock specific items, not monetary balance.
- Google Play codes purchased in India can only be redeemed on Indian Google accounts (region-locked).
- If the code has already been redeemed, Google will show an error — inform user to contact the seller.
- Google Play balance does NOT expire — it stays on the account indefinitely.
- Users cannot combine two partial balances or split a gift card across accounts — one code, one account.
- The redemption page at `play.google.com/redeem` is the fastest path — avoid navigating through menus.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
