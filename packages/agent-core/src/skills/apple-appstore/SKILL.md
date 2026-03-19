---
name: apple-appstore
description: Buy apps, games, or subscriptions on the Apple App Store via the web. Browse, purchase, and manage subscriptions.
triggers:
  - apple app store
  - buy iphone app
  - app store purchase
  - buy ios app
  - apple subscription
  - app store india
  - buy app on iphone
  - apple arcade subscribe
  - icloud subscription
  - app store buy game
siteUrl: https://apps.apple.com
requiresAuth: true
params:
  - name: app_name
    required: false
    hint: Name of the app or game to buy (e.g. "Procreate", "Minecraft", "Facetune")
  - name: action
    required: false
    hint: Action — "buy_app", "subscribe", or "browse"
  - name: subscription
    required: false
    hint: Subscription name if subscribing (e.g. "Apple Arcade", "iCloud+", "Apple Music")
---

# Apple App Store Purchase / Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to do via `ask_user` (input_type "choice"):
  - "Buy a specific app or game"
  - "Subscribe to an Apple service (Arcade, Music, iCloud+, TV+)"
  - "Browse top apps / games"
  - "Manage existing subscriptions"
- If buying an app, ask for the app name if not provided.
- If subscribing, determine which service:
  - **Apple Arcade** — ₹99/mo — unlimited games, no ads, no in-app purchases
  - **Apple Music** — Individual ₹99/mo, Family ₹149/mo, Student ₹49/mo
  - **iCloud+** — 50GB ₹75/mo, 200GB ₹219/mo, 2TB ₹749/mo
  - **Apple TV+** — ₹99/mo
  - **Apple One** — Individual ₹195/mo (Arcade + Music + TV+ + iCloud 50GB)
- Clarify if user is looking for a one-time purchase app or a subscription-based app.

### 2. Open App Store & Verify Login
- Open a NEW tab and navigate to `https://apps.apple.com`.
- Take snapshot. Check if logged in (Apple ID avatar/sign-in button in header).
- If NOT logged in, login transparently with Apple ID. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Apple may require 2FA — use `ask_user` to get the 6-digit code sent to the user's device.

### 3. Search & Browse
- Use the App Store search to find the requested app or game.
- Take snapshot of search results.
- Present top results to user via `ask_user` (input_type "choice") with:
  - App name and developer
  - Price (or "Free" / "Free with In-App Purchases")
  - Rating and number of reviews
  - Category (Productivity, Games, Photo, etc.)
- For subscriptions: navigate to the specific service page.
- Click on the selected app to view its detail page.
- Take snapshot of app detail page.

### 4. Review App/Subscription Details
- Present details to user:
  - Price (one-time or subscription)
  - App size
  - Compatibility (iPhone, iPad, Mac — via Apple Silicon)
  - In-app purchases list (if any)
  - Privacy information
  - Rating and reviews summary
  - What's new (latest update notes)
- For subscriptions: show plan options and pricing tiers.
- Use `ask_user` (input_type "choice") for plan/tier selection if applicable.

### 5. Review & Confirm
- Use `confirm_action` with purchase summary:
  - App/service name
  - Price (one-time or monthly/annual subscription)
  - Apple ID being charged
  - For subscriptions: billing cycle, auto-renewal info, free trial (if any)
  - Compatible devices
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with app_name, price_inr, purchase_type, apple_id, billing_cycle
  - amount_inr: app price or first subscription payment in INR
  - description: "Apple App Store purchase"
- WAIT for payment confirmation from user.

### 7. Complete & Confirm
- Complete the purchase on the App Store.
- Apple may require Face ID / Touch ID / password confirmation — handle via `ask_user` if needed.
- Handle OTP for payment via `ask_user` if needed.
- Take snapshot of purchase confirmation.
- Report to user:
  - App/subscription purchased
  - Total charged
  - Where to find it (device's App Store → Purchased, or auto-download)
  - For subscriptions: next billing date, how to manage/cancel in Settings → Apple ID → Subscriptions
- Mention: "Subscriptions can be cancelled anytime from Settings → Apple ID → Subscriptions."

## Site Notes

- Apple App Store web version (apps.apple.com) allows browsing and initiating purchases, but final download happens on the iOS/Mac device.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in with an Apple ID. Do NOT ask user for credentials.
- Apple ID often requires two-factor authentication — a 6-digit code is sent to trusted devices. Use `ask_user` to collect this.
- India App Store prices are in INR — Apple uses fixed price tiers (₹29, ₹49, ₹79, ₹99, ₹149, ₹249, etc.).
- Apple Arcade at ₹99/mo is excellent value — 200+ games with no ads and no in-app purchases.
- iCloud+ storage is essential for iPhone users — recommend based on user's needs (photos, backups).
- Apple One bundle saves money if user wants multiple Apple services — highlight savings vs. individual subscriptions.
- Payment methods: credit/debit card, UPI (added via iPhone), Apple ID balance (from gift cards). No net banking.
- Family Sharing allows sharing purchased apps and subscriptions with up to 5 family members — mention if relevant.
- Refund requests for apps go through reportaproblem.apple.com — Apple is generally generous with refunds within 14 days.
- Some apps are "Free" but heavily rely on in-app purchases/subscriptions — inform user about the true cost.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
