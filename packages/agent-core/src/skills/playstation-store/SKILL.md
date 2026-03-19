---
name: playstation-store
description: Buy PS5 and PS4 games on PlayStation Store India. Browse, purchase digital games, DLC, and PS Plus subscriptions.
triggers:
  - playstation store
  - buy ps5 game
  - buy ps4 game
  - psn store
  - playstation purchase
  - ps store india
  - buy playstation game
  - ps plus subscription
  - playstation digital game
  - psn buy game
siteUrl: https://store.playstation.com/en-in
requiresAuth: true
params:
  - name: game_name
    required: false
    hint: Name of the game to buy (e.g. "God of War Ragnarok", "Spider-Man 2")
  - name: platform
    required: false
    hint: PS5 or PS4 (default PS5)
  - name: edition
    required: false
    hint: Standard, Deluxe, or Digital Deluxe edition
---

# PlayStation Store India Game Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which game the user wants to buy. Ask via `ask_user` if not specified.
- Clarify the platform via `ask_user` (input_type "choice"):
  - "PS5"
  - "PS4"
  - "PS5 + PS4 (cross-buy if available)"
- Check if user wants a specific edition (Standard, Deluxe, Digital Deluxe, Ultimate).
- Ask if they are interested in DLC, season passes, or bundles.
- If user is just browsing, ask what they want:
  - "Search for a specific game"
  - "Browse top sellers / new releases"
  - "Check current PS Store sales"
  - "Subscribe to PS Plus"

### 2. Open PlayStation Store & Verify Login
- Open a NEW tab and navigate to `https://store.playstation.com/en-in`.
- Take snapshot. Check if logged in (PSN avatar/username in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Accept cookie consent if prompted.

### 3. Search & Browse Games
- Use the PS Store search bar to find the requested game.
- Take snapshot of search results.
- If multiple results or editions exist, present top options via `ask_user` (input_type "choice") with:
  - Game name and edition
  - Platform compatibility (PS5 / PS4 / PS5+PS4)
  - Price in INR
  - Any active discount or PS Plus discount
- Click on the selected game to view its store page.
- Take snapshot of the game's product page.

### 4. Review Game Details
- Present game details to user:
  - Price in INR (check for discounts, PS Plus member discounts)
  - Available editions and their prices
  - File size for download
  - PS Plus required for online multiplayer (if applicable)
  - Cross-buy availability (buy once, play on PS4 and PS5)
  - User ratings and critic scores
  - Release date
- If game is already in the user's library, inform them.
- Use `ask_user` (input_type "choice") if multiple editions are available.

### 5. Add to Cart & Confirm
- Click "Add to Cart" for the selected game/edition.
- Navigate to cart.
- Take snapshot of cart page.
- Use `confirm_action` with purchase summary:
  - Game name, edition, and platform
  - Price in INR (including any PS Plus discount)
  - File size
  - Whether it includes free PS5 upgrade (for PS4 purchases)
  - PSN Wallet balance (if visible)
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with game_name, edition, platform, price_inr, ps_plus_discount
  - amount_inr: total price in INR
  - description: "PlayStation Store India purchase"
- WAIT for payment confirmation from user.

### 7. Complete Purchase & Confirm
- Proceed to PS Store checkout.
- Select payment method (credit/debit card / UPI / PSN Wallet / net banking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation page.
- Report to user: game purchased, total paid, download will begin automatically on PS5/PS4 if in rest mode, estimated download size.
- Mention: "You can start the download from your PS5/PS4 Library or the PlayStation App."
- Mention refund policy: "Digital purchases can be refunded within 14 days if not downloaded."

## Site Notes

- PlayStation Store India shows prices in INR — India gets competitive pricing for most titles.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to PSN. Do NOT ask user for credentials.
- PS Plus members get exclusive discounts on many games — check if the account has an active PS Plus subscription.
- PS Store runs frequent sales (Mega March, Days of Play, Holiday Sale, etc.) — highlight active discounts.
- Cross-buy games purchased on PS4 often include a free PS5 upgrade — always check and mention this.
- PSN Wallet can be topped up separately and used for purchases — check wallet balance before checkout.
- Some games require PS Plus for online multiplayer — inform user if the game has significant online components.
- Payment methods in India: credit/debit card, UPI (limited support), PSN Wallet. No COD or net banking.
- Pre-orders are available on PS Store — game auto-downloads before release date so it is ready on launch day.
- Digital Deluxe and Ultimate editions often include early access (2-3 days before standard release) — worth mentioning.
- PS Store refund policy is strict: no refund once download has started. Inform user before purchase.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
