---
name: chatgpt-subscribe
description: Subscribe to ChatGPT Plus or Pro plan on OpenAI. Select plan, enter payment, and activate premium access.
triggers:
  - chatgpt plus
  - subscribe chatgpt
  - chatgpt pro
  - chatgpt subscription
  - buy chatgpt plus
  - upgrade chatgpt
  - chatgpt premium
  - openai plus plan
  - chatgpt paid plan
  - get chatgpt plus
siteUrl: https://chat.openai.com
requiresAuth: true
params:
  - name: plan
    required: false
    hint: Preferred plan — "Plus" ($20/mo) or "Pro" ($200/mo)
  - name: team
    required: false
    hint: Whether this is for ChatGPT Team ($25/user/mo) — true/false
---

# ChatGPT Plus / Pro Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine which ChatGPT plan the user wants via `ask_user` (input_type "choice"):
  - "Plus — $20/mo (~₹1,670/mo) — GPT-4o, DALL-E, browsing, Advanced Data Analysis, 80 messages/3hr on GPT-4o"
  - "Pro — $200/mo (~₹16,700/mo) — Unlimited GPT-4o, o1 pro mode, extended thinking, priority access"
  - "Team — $25/user/mo (~₹2,090/mo) — Workspace, admin console, higher limits, data not used for training"
- Clarify what features matter most to the user (speed, usage limits, o1 access, team collaboration).
- Note: ChatGPT bills in USD — Indian cards are charged with forex conversion. Inform user of approximate INR equivalent.
- If user already has Plus and wants Pro (or vice versa), this is a plan change.

### 2. Open ChatGPT & Verify Login
- Open a NEW tab and navigate to `https://chat.openai.com`.
- Take snapshot. Check if logged in (profile icon in bottom-left sidebar).
- If NOT logged in, login transparently via Google SSO or email. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check current subscription status — navigate to Settings → Subscription to see if already subscribed.

### 3. Navigate to Subscription Page
- Click on profile icon → "My Plan" or navigate to Settings → Subscription.
- Take snapshot of current plan status.
- If user is on Free plan: click "Upgrade to Plus" or "Upgrade" button.
- If user is on Plus and wants Pro: look for upgrade option in subscription settings.
- If user already has the requested plan, inform them and ask if they want to manage/cancel instead.
- Take snapshot of plan selection page.

### 4. Select Plan & Review
- Click on the desired plan (Plus / Pro / Team).
- Take snapshot of the checkout/plan details page.
- Use `confirm_action` with subscription summary:
  - Plan name (Plus / Pro / Team)
  - Price per month in USD and approximate INR
  - Key features included
  - Usage limits (messages per hour for GPT-4o, o1 access, etc.)
  - Billing: monthly auto-renew (billed in USD)
  - Forex note: "Charged in USD — your bank will apply forex conversion to INR"
  - First charge date
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price_usd, price_inr_approx, features, billing_cycle
  - amount_inr: approximate INR equivalent of the USD price
  - description: "ChatGPT subscription"
- WAIT for payment confirmation from user.

### 6. Enter Payment Details & Complete
- On the OpenAI checkout page, enter payment details (credit/debit card).
- OpenAI uses Stripe for payments — enter card number, expiry, CVV, billing address.
- Handle OTP via `ask_user` if needed (international transaction OTP).
- Take snapshot of payment confirmation page.
- Report to user:
  - Plan activated (Plus / Pro / Team)
  - Monthly charge in USD (and approximate INR)
  - Features now available
  - Next billing date
  - How to cancel: Settings → Subscription → Cancel Plan
- Mention: "You can cancel anytime. Access continues until the end of the billing period."

### 7. Verify Activation
- Navigate back to ChatGPT main page.
- Take snapshot confirming the plan badge (Plus/Pro indicator visible).
- Verify user can access GPT-4o or o1 (depending on plan) by checking model selector.
- Confirm to user that subscription is active and all premium features are available.

## Site Notes

- ChatGPT is by OpenAI — the most popular AI chatbot. Plus gives GPT-4o access, Pro gives unlimited usage and o1 pro mode.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to OpenAI/ChatGPT. Do NOT ask user for credentials.
- ChatGPT bills in USD — Indian credit/debit cards will incur forex markup (typically 1.5-3.5% depending on the bank).
- OpenAI accepts only credit/debit cards via Stripe — no UPI, no net banking, no wallets. International transactions must be enabled on the card.
- ChatGPT Plus ($20/mo) is the most popular plan — provides GPT-4o, DALL-E image generation, web browsing, and code interpreter.
- ChatGPT Pro ($200/mo) is for power users — unlimited messages, o1 pro mode with extended thinking, priority access during peak hours.
- ChatGPT Team ($25/user/mo, annual billing) adds workspace features and guarantees data is not used for training.
- Some Indian banks block international recurring payments — if payment fails, suggest user enable international transactions or try a different card.
- OpenAI may require phone verification during signup — use `ask_user` to get the OTP if prompted.
- Plan changes take effect immediately — upgrading from Plus to Pro charges the difference prorated.
- Cancellation is immediate but access continues until end of billing period — no partial refunds.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
