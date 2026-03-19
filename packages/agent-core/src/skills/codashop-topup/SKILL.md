---
name: codashop-topup
description: Top up gaming credits on Codashop India. BGMI UC, Free Fire Diamonds, Genshin Genesis Crystals, Mobile Legends, and more.
triggers:
  - codashop top up
  - bgmi uc top up
  - free fire diamonds
  - genshin top up
  - codashop recharge
  - buy game credits
  - mobile legends diamonds
  - gaming top up
  - codashop india
  - buy uc bgmi
  - valorant points india
  - pubg mobile uc
siteUrl: https://www.codashop.com/in
requiresAuth: false
params:
  - name: game
    required: false
    hint: Game to top up (e.g. "BGMI", "Free Fire", "Genshin Impact", "Mobile Legends")
  - name: amount
    required: false
    hint: Amount of credits/currency to buy (e.g. "60 UC", "100 Diamonds", "300 Genesis Crystals")
  - name: player_id
    required: false
    hint: In-game player ID for the top-up
---

# Codashop India Gaming Top-Up

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which game the user wants to top up. Use `ask_user` (input_type "choice"):
  - "BGMI (Battlegrounds Mobile India) — UC"
  - "Free Fire — Diamonds"
  - "Genshin Impact — Genesis Crystals"
  - "Mobile Legends — Diamonds"
  - "Valorant — VP (Valorant Points)"
  - "Call of Duty Mobile — CP"
  - "Other game"
- Ask for the amount of credits/currency to purchase if not specified.
- **Critical**: Ask for the user's in-game Player ID via `ask_user` — Codashop requires this to deliver credits directly.
- Confirm the Player ID carefully — wrong ID means credits go to the wrong account (non-refundable).
- If user does not know their Player ID, guide them: "Open the game, go to Profile/Settings, and copy your Player ID."

### 2. Open Codashop & Navigate
- Open a NEW tab and navigate to `https://www.codashop.com/in`.
- Take snapshot. Codashop does NOT require login for purchases — it uses Player ID + payment.
- If logged in with a Codashop account, that is fine but not required.
- Accept cookie consent if prompted.

### 3. Select Game & Top-Up Amount
- Click on the game tile or search for the game on Codashop India.
- Take snapshot of the game's top-up page.
- Present available top-up denominations via `ask_user` (input_type "choice"), e.g. for BGMI:
  - "60 UC — ₹75"
  - "325 UC — ₹380"
  - "660 UC — ₹750"
  - "1800 UC — ₹1,900"
  - "3850 UC — ₹3,800"
- Prices vary by game — always read from the screen, never hardcode.
- User selects the denomination they want.

### 4. Enter Player ID & Verify
- Enter the user's Player ID in the designated field.
- Some games require additional info (Server ID, Zone ID) — ask via `ask_user` if prompted.
- Codashop may show the player's in-game username for verification — show this to user.
- Use `ask_user` to confirm: "Is this your account: [username shown]? (Yes/No)"
- If username does not match, re-enter Player ID.

### 5. Review & Confirm
- Use `confirm_action` with top-up summary:
  - Game name
  - Top-up amount (e.g., "660 UC" or "100 Diamonds")
  - Price in INR
  - Player ID (masked partially for display)
  - In-game username (if shown by Codashop)
  - Delivery: instant to in-game account
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with game, credits_amount, price_inr, player_id_masked
  - amount_inr: price of the top-up in INR
  - description: "Codashop gaming top-up"
- WAIT for payment confirmation from user.

### 7. Complete & Confirm
- Select payment method on Codashop (UPI / credit card / debit card / net banking / Paytm / PhonePe).
- Handle OTP via `ask_user` if needed.
- Take snapshot of payment confirmation / success page.
- Report to user: credits purchased, amount delivered, Player ID, delivery is instant — ask user to check in-game.
- Mention: "Credits are delivered instantly. If not received within 5 minutes, contact Codashop support."
- Provide Codashop order ID for reference.

## Site Notes

- Codashop is an official top-up partner for most mobile games — credits are delivered directly to the in-game account.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) may or may not be logged into Codashop — login is NOT required for purchases.
- Codashop does NOT require game login — it only needs the Player ID to deliver credits. Do NOT ask user for game credentials.
- Player ID is critical — entering the wrong ID sends credits to someone else, and refunds are generally not possible.
- Codashop India pricing is in INR and often matches or beats in-game store prices due to direct carrier billing deals.
- Popular games on Codashop India: BGMI, Free Fire, Genshin Impact, Mobile Legends, Call of Duty Mobile, Valorant.
- Payment methods: UPI, credit/debit card, net banking, Paytm, PhonePe, Google Pay, carrier billing (Jio/Airtel).
- Credits are delivered instantly (within seconds) — if not received, user should check in-game mailbox or inventory.
- Codashop sometimes offers bonus credits or promotional deals — check the game page for active offers.
- Some games (like Genshin Impact) require selecting the correct server region — ask user which server they play on.
- Codashop issues a digital receipt — save/screenshot the order confirmation for reference.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
