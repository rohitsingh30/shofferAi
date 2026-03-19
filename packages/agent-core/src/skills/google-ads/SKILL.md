---
name: google-ads
description: Create Google Ads campaign — set up search, display, or video ads with keywords, budget, ad copy, and targeting.
triggers:
  - google ads
  - create google ad
  - google ads campaign
  - google advertising
  - google search ads
  - adwords
  - google ppc
  - run google ad
  - google display ad
  - google ad campaign setup
siteUrl: https://ads.google.com
requiresAuth: true
params:
  - name: campaign_type
    required: false
    hint: Campaign type (e.g. "search", "display", "video", "shopping", "performance max")
  - name: keywords
    required: false
    hint: Target keywords (e.g. "best hotel in delhi", "buy shoes online", "plumber near me")
  - name: budget
    required: false
    hint: Daily budget in INR (e.g. "₹500/day", "₹1000/day")
  - name: location
    required: false
    hint: Target location (e.g. "Mumbai", "Delhi NCR", "All India")
  - name: goal
    required: false
    hint: Campaign goal (e.g. "website traffic", "phone calls", "store visits", "leads")
---

# Google Ads Campaign Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine campaign type via `ask_user` (input_type "choice"):
  - "Search — Text ads on Google search results (best for leads and sales)"
  - "Display — Banner ads across websites and apps (best for awareness)"
  - "Video — YouTube video ads (best for brand awareness)"
  - "Performance Max — AI-optimized across all Google channels"
  - "Shopping — Product listing ads (for e-commerce)"
- Determine campaign goal:
  - Website traffic, phone calls, leads, sales, app installs, store visits, brand awareness.
- Gather targeting details:
  - Location (city, state, country, radius targeting)
  - Language (English, Hindi, etc.)
  - Audience demographics (age, gender, household income)
- For Search campaigns, gather:
  - Target keywords (5-20 keywords)
  - Negative keywords (terms to exclude)
- Ask about daily budget in INR.
- Ask about campaign duration or if it should run continuously.

### 2. Open Google Ads & Verify Login
- Open a NEW tab and navigate to `https://ads.google.com`.
- Take snapshot. Check if logged in (Google Ads dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify the correct Google Ads account is active.
- Check if billing is set up — if not, inform user billing setup will be needed.

### 3. Create Campaign
- Click "+ New Campaign" in Google Ads.
- Select campaign goal as determined in step 1.
- Select campaign type (Search, Display, Video, Performance Max, etc.).
- Name the campaign descriptively (e.g. "Search - Plumber Delhi - March 2026").
- Configure campaign settings:
  - Networks: Google Search, Search Partners (for Search campaigns).
  - Location targeting: as specified.
  - Language targeting.
  - Bidding strategy: maximize clicks, maximize conversions, target CPA, or manual CPC.
- Take snapshot of campaign settings.

### 4. Set Up Ad Groups & Keywords (Search Campaigns)
- Create ad groups organized by theme (e.g. "Plumber Services", "Emergency Plumbing").
- For each ad group:
  - Add relevant keywords with match types (broad, phrase, exact).
  - Add negative keywords to exclude irrelevant traffic.
- For Display/Video campaigns:
  - Set up audience targeting (interests, demographics, placements).
  - Select specific websites, YouTube channels, or topics if needed.
- Take snapshot of keyword list and estimated search volume.
- Use `ask_user` to confirm keywords and targeting.

### 5. Create Ad Copy
- For Search ads, write:
  - **Headlines** (up to 15, max 30 chars each) — compelling, keyword-rich.
  - **Descriptions** (up to 4, max 90 chars each) — value proposition, CTA.
  - **Display URL path** — clean, descriptive URL path.
  - **Sitelink extensions** — links to specific pages.
  - **Callout extensions** — "Free Estimates", "24/7 Service", etc.
  - **Call extension** — business phone number.
- For Display ads: upload banner images or use responsive display ads.
- For Video ads: link YouTube video URL.
- Take snapshot of ad preview.
- Use `ask_user` to confirm ad copy and extensions.

### 6. Set Budget & Bidding
- Set daily budget as specified by user.
- Choose bidding strategy based on goal:
  - Maximize clicks (for traffic)
  - Maximize conversions (for leads/sales)
  - Target CPA (if user has a cost-per-lead target)
  - Manual CPC (for full control)
- Take snapshot of budget and bidding settings.
- Show user: estimated daily clicks, estimated CPC, estimated daily spend.

### 7. Review & Confirm
- Use `confirm_action` with full campaign summary:
  - Campaign type and goal
  - Target location and language
  - Keywords (top 10) and match types
  - Ad copy (headlines, descriptions)
  - Extensions configured
  - Daily budget and bidding strategy
  - Estimated clicks and CPC
  - Campaign duration
- Do NOT launch unless user confirms.

### 8. Payment & Launch
- Use `collect_payment`:
  - summary: JSON with campaign_type, goal, keywords, budget_daily, location, bidding_strategy, estimated_clicks
  - amount_inr: first month estimated spend (daily budget x 30)
  - description: "Google Ads campaign"
- WAIT for payment confirmation from user.
- Click "Publish Campaign" to submit.
- Take snapshot of campaign launch confirmation.
- Report to user: campaign live, campaign ID, expected review time, daily budget set.
- Mention: "Google reviews ads within a few hours. Monitor performance in Google Ads dashboard. Adjust budget and keywords as needed."

## Site Notes

- Google Ads is the world's largest PPC advertising platform — essential for search intent-based marketing.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Google. Do NOT ask user for credentials.
- Google Ads billing in India supports credit/debit cards, UPI, net banking, and prepaid balance. Billing is post-pay with threshold billing.
- Minimum daily budget in India is approximately ₹20/day — but ₹200+/day recommended for meaningful results.
- Google's Smart Campaigns (simplified mode) exist but Expert Mode gives much more control — use Expert Mode by default.
- Keyword Planner tool within Google Ads is free and invaluable — use it to research keyword volumes and CPC estimates.
- Quality Score (1-10) affects ad position and cost — higher score means lower CPC and better placement.
- Location targeting in India supports city, state, pincode, and radius targeting — hyperlocal works well for service businesses.
- Ad extensions (sitelinks, callouts, call, location) significantly improve CTR — always add at least 3 extensions.
- Google Ads has a learning period of 7-14 days — advise user not to make major changes during this period.
- Use `confirm_action` for review, `collect_payment` for budget commitment. Always WAIT for user response.
