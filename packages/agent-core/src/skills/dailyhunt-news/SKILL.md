---
name: dailyhunt-news
description: Subscribe to DailyHunt premium — regional news, short videos, ePapers, and ad-free reading experience.
triggers:
  - dailyhunt subscription
  - subscribe dailyhunt
  - dailyhunt premium
  - dailyhunt news
  - regional news subscription
  - dailyhunt app
  - dailyhunt ad free
  - indian news subscription
  - hindi news app
  - dailyhunt plan
siteUrl: https://www.dailyhunt.in
requiresAuth: true
params:
  - name: plan
    required: false
    hint: DailyHunt premium plan (e.g. "monthly", "annual")
  - name: language
    required: false
    hint: Preferred language for news (e.g. "Hindi", "Telugu", "Tamil", "Kannada", "English")
  - name: interests
    required: false
    hint: News categories of interest (e.g. "politics", "cricket", "technology", "entertainment")
---

# DailyHunt Premium Subscription

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants from DailyHunt Premium:
  - **Ad-free reading** — No ads across news articles and short videos.
  - **ePapers** — Digital editions of regional newspapers.
  - **Exclusive content** — Premium articles and analysis.
  - **Short videos** — Viral clips, entertainment, news bites.
- Ask user's preferred language(s) via `ask_user` (input_type "choice"):
  - Hindi, English, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, etc.
- Ask about content interests: politics, sports, entertainment, technology, business, lifestyle.
- Confirm subscription duration preference: monthly or annual.

### 2. Open DailyHunt & Verify Login
- Open a NEW tab and navigate to `https://www.dailyhunt.in`.
- Take snapshot. Check if logged in (profile icon or account menu visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- If already subscribed to premium, inform user and ask about renewal or plan change.

### 3. Navigate to Premium Plans
- Navigate to the premium subscription or upgrade page.
- Take snapshot of available plans and pricing.
- DailyHunt Premium typically offers:
  - **Monthly** — auto-renewing monthly subscription
  - **Annual** — discounted yearly plan
- Show user the plans with current pricing via `ask_user` (input_type "choice").
- Verify on-screen prices — do not hardcode amounts.

### 4. Configure Language & Interests
- Set user's preferred language(s) in the app settings if not already configured.
- Select news categories matching user's interests.
- Take snapshot showing personalized feed setup.
- Confirm language and interest selections with user.

### 5. Review & Confirm
- Use `confirm_action` with subscription summary:
  - Plan type (Monthly / Annual)
  - Price
  - Selected languages
  - Content interests configured
  - Features included (ad-free, ePapers, premium articles, short videos)
  - Billing cycle (auto-renew)
  - Supported platforms (web, Android, iOS)
- Do NOT proceed unless user confirms.

### 6. Payment
- Use `collect_payment`:
  - summary: JSON with plan, price, languages, features, billing_cycle
  - amount_inr: subscription price
  - description: "DailyHunt premium subscription"
- WAIT for payment confirmation from user.

### 7. Complete & Confirm
- Proceed with payment on DailyHunt. Handle payment OTP via `ask_user` if needed.
- Take snapshot of subscription confirmation page.
- Report to user: premium activated, price paid, languages configured, next billing date.
- Mention: "Access premium content on DailyHunt app (iOS/Android) or web. Ad-free experience is now active."
- Mention: "You can cancel anytime from DailyHunt account settings."

## Site Notes

- DailyHunt supports 14+ Indian languages — it is the largest regional news aggregator in India.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- DailyHunt login is typically phone-number-based with OTP — the operator's number must be registered.
- Short video content (Virals) is a major feature — similar to Instagram Reels but news-focused.
- ePapers include regional newspapers like Dainik Jagran, Eenadu, Dinamalar — great for users who want traditional newspaper reading digitally.
- DailyHunt premium pricing and features may vary — always verify on-screen. Do not hardcode prices.
- The web version at dailyhunt.in may have limited functionality compared to the mobile app — inform user if relevant.
- Session typically persists for a long time but may expire after extended inactivity.
- DailyHunt may prompt location access for local news — allow it for better personalization.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
