---
name: steam-game
description: Buy or gift games on Steam. Search the store, check reviews and pricing, add to cart, and complete purchase.
triggers:
  - buy steam game
  - steam purchase
  - steam store
  - buy game on steam
  - gift steam game
  - steam game purchase
  - steam wishlist buy
  - purchase on steam
  - steam game gift
  - steam buy for friend
siteUrl: https://store.steampowered.com
requiresAuth: true
params:
  - name: game_name
    required: false
    hint: Name of the game to buy (e.g. "Counter-Strike 2", "Elden Ring")
  - name: gift
    required: false
    hint: Whether to gift this game to someone (true/false)
  - name: recipient_email
    required: false
    hint: Email of the gift recipient (only if gifting)
---

# Steam Game Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which game(s) the user wants to buy. Ask via `ask_user` if not specified.
- Clarify if this is a purchase for themselves or a gift for someone else.
- If gifting, ask for the recipient's Steam account name or email via `ask_user`.
- Check if the user has any preference for edition (Standard, Deluxe, Ultimate, GOTY, etc.).
- If user is browsing, ask what genre or type of game they want:
  - Use `ask_user` (input_type "choice"):
    - "I know the exact game name"
    - "Browse top sellers"
    - "Browse by genre (action, RPG, strategy, etc.)"
    - "Check current Steam sales/deals"

### 2. Open Steam Store & Verify Login
- Open a NEW tab and navigate to `https://store.steampowered.com`.
- Take snapshot. Check if logged in (username in top-right navigation bar).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If age verification gate appears, select appropriate birthdate and continue.

### 3. Search & Browse Games
- Search for the requested game using the Steam search bar.
- Take snapshot of search results.
- If multiple results, present top 3-5 options via `ask_user` (input_type "choice") with:
  - Game name
  - Price (or "Free to Play")
  - Review rating (Overwhelmingly Positive, Very Positive, Mixed, etc.)
  - Release date
- Click on the selected game to view its store page.
- Take snapshot of the game's store page.

### 4. Review Game Details
- Present game details to user via `ask_user`:
  - Full price (check for discounts/sales)
  - Review score and count
  - Minimum/recommended system requirements
  - Available editions (Standard, Deluxe, etc.)
  - Any DLC or season pass bundles
  - Whether user already owns the game (Steam shows "Already in your library")
- If game is already owned, inform user and ask if they want to gift it instead.
- If multiple editions exist, use `ask_user` (input_type "choice") to pick edition.

### 5. Add to Cart & Review
- Click "Add to Cart" for the selected game/edition.
- Navigate to cart page.
- Take snapshot of cart.
- Use `confirm_action` with purchase summary:
  - Game name and edition
  - Price (including any discount percentage and original price)
  - Gift recipient (if applicable)
  - Payment will be processed via Steam checkout
  - Regional pricing (India INR)
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with game_name, edition, price_inr, discount, gift_recipient
  - amount_inr: total cart price in INR
  - description: "Steam game purchase"
- WAIT for payment confirmation from user.

### 7. Complete Purchase & Confirm
- Proceed to Steam checkout.
- Select payment method (UPI / credit card / debit card / net banking / Steam Wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation page.
- Report to user: game purchased, total paid, where to find it in Steam library, download instructions.
- If gift: confirm gift was sent, provide gift tracking details.
- Mention: "Refund available within 14 days of purchase if played less than 2 hours."

## Site Notes

- Steam is the largest PC gaming marketplace — most games are available here with regional India pricing in INR.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Steam. Do NOT ask user for credentials.
- Steam India prices are significantly cheaper than US/EU prices due to regional pricing — always show INR amounts.
- Steam frequently runs major sales (Summer Sale, Winter Sale, Autumn Sale) — check for active discounts and highlight savings.
- Age verification gates appear for mature-rated games — handle automatically by selecting a birthdate.
- Steam Wallet balance can be used alongside other payment methods — check wallet balance before checkout.
- Payment methods in India: UPI, credit/debit card, net banking, Steam Wallet, Paytm. No COD.
- Steam Guard (2FA) may prompt for email/authenticator code during login — use `ask_user` to get the code.
- Gifted games go to the recipient's email — they must accept and add to their Steam library.
- Refund policy: within 14 days of purchase AND less than 2 hours of playtime — mention this to user.
- Some games are region-locked — purchases made from India may only work in the Indian region.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
