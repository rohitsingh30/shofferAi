---
name: epic-games
description: Buy or claim games on Epic Games Store. Browse store, buy games, claim free weekly games, and manage library.
triggers:
  - epic games store
  - buy epic game
  - epic games purchase
  - claim free epic game
  - epic free games
  - epic games store buy
  - fortnite vbucks
  - epic games claim
  - buy on epic store
  - epic games weekly free
siteUrl: https://store.epicgames.com
requiresAuth: true
params:
  - name: game_name
    required: false
    hint: Name of the game to buy or claim (e.g. "Fortnite", "Alan Wake 2")
  - name: action
    required: false
    hint: Action to perform — "buy", "claim_free", or "browse"
---

# Epic Games Store Purchase / Claim

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to do on Epic Games Store via `ask_user` (input_type "choice"):
  - "Buy a specific game"
  - "Claim this week's free game(s)"
  - "Browse deals and sales"
  - "Buy V-Bucks or in-game currency"
- If buying a specific game, ask for the game name if not provided.
- If claiming free games, no additional info needed — navigate directly.
- Check if user wants to buy for themselves or as a gift.

### 2. Open Epic Games Store & Verify Login
- Open a NEW tab and navigate to `https://store.epicgames.com`.
- Take snapshot. Check if logged in (profile avatar/username in top-right corner).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Epic may show a cookie consent banner — dismiss it.

### 3. Search or Browse Games
- **If buying**: Use the search bar to find the requested game. Take snapshot of results.
- **If claiming free**: Navigate to the free games section (usually featured on homepage or via `https://store.epicgames.com/en-US/free-games`).
- Take snapshot of results or free games listing.
- Present available options to user via `ask_user` (input_type "choice") with:
  - Game name
  - Price (or "FREE" for weekly claims)
  - Rating/reviews if available
  - Free game claim deadline (e.g., "Free until March 20")

### 4. Select Game & Review Details
- Click on the chosen game to view its store page.
- Take snapshot of game store page.
- Present game details to user:
  - Full price or "Free" (check for active discounts with Epic coupons)
  - Game description and genre
  - Platform requirements
  - Edition options (Standard, Deluxe, etc.) if applicable
  - Whether user already owns it ("In Library" badge)
- If already owned, inform user and suggest alternatives.

### 5. Add to Cart / Claim & Confirm
- **For purchase**: Click "Add to Cart" or "Buy Now".
- **For free claim**: Click "Get" or "Claim" button.
- Take snapshot of cart or claim confirmation.
- Use `confirm_action` with summary:
  - Game name and edition
  - Price (or "Free — weekly claim")
  - Any Epic coupon discount applied
  - Claim deadline for free games
  - Platform (PC / Mac)
- Do NOT proceed unless user confirms.

### 6. Payment (Skip for Free Claims)
- **For free claims**: Epic may still require clicking through a "Place Order" for ₹0.
- **For purchases**: Use `collect_payment`:
  - summary: JSON with game_name, edition, price_inr, discount, coupon_applied
  - amount_inr: total price in INR (0 for free claims)
  - description: "Epic Games Store purchase"
- WAIT for payment confirmation from user (even for free — to confirm claim).

### 7. Complete & Confirm
- Complete the checkout/claim process.
- Select payment method if purchasing (UPI / credit card / debit card / PayPal / Epic Wallet).
- Handle OTP via `ask_user` if needed.
- Take snapshot of purchase/claim confirmation page.
- Report to user: game added to library, total paid (or "Free"), where to download (Epic Games Launcher), install size if shown.
- For free claims: mention next week's upcoming free game(s) if visible.
- Mention: "Epic offers refunds within 14 days if played less than 2 hours."

## Site Notes

- Epic Games Store offers free games every week (usually Thursday to Thursday) — a major draw for PC gamers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Epic Games. Do NOT ask user for credentials.
- Epic frequently distributes mega coupons (₹750 off on games ₹1,149+) during seasonal sales — check and apply automatically.
- India regional pricing is available on Epic — prices are shown in INR.
- Epic Games Store has a smaller catalog than Steam but includes many exclusives (e.g., Alan Wake 2, Fortnite).
- Free game claims require a one-time "purchase" flow at ₹0 — the user must click through checkout even for free games.
- Two-factor authentication (2FA) is often enabled — Epic may send an email code during login. Use `ask_user` to get the code.
- Epic Wallet balance can be used for purchases — check balance before checkout.
- Payment methods in India: UPI, credit/debit card, PayPal, Epic Wallet. No net banking or COD.
- Fortnite V-Bucks and other in-game currencies are purchased through the game itself, not the store — redirect user accordingly.
- Epic Games Launcher is required to download and play purchased games — remind user to install it if needed.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
