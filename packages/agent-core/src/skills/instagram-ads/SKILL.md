---
name: instagram-ads
description: Create Instagram ad campaign — set objective, target audience, budget, ad creative, and launch via Meta Ads Manager.
triggers:
  - instagram ads
  - create instagram ad
  - instagram ad campaign
  - instagram promotion
  - promote on instagram
  - instagram advertising
  - instagram boost post
  - run instagram ad
  - instagram sponsored
  - instagram marketing
siteUrl: https://adsmanager.facebook.com
requiresAuth: true
params:
  - name: objective
    required: false
    hint: Campaign objective (e.g. "brand awareness", "reach", "traffic", "engagement", "leads", "sales")
  - name: budget
    required: false
    hint: Daily or total budget in INR (e.g. "₹500/day", "₹5000 total")
  - name: audience
    required: false
    hint: Target audience description (e.g. "18-35 women in Mumbai interested in fashion")
  - name: duration
    required: false
    hint: Campaign duration (e.g. "7 days", "30 days", "ongoing")
  - name: creative_type
    required: false
    hint: Ad format (e.g. "image", "video", "carousel", "stories", "reels")
---

# Instagram Ad Campaign Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine campaign objective via `ask_user` (input_type "choice"):
  - "Awareness — Reach people most likely to remember your ad"
  - "Traffic — Send people to your website or app"
  - "Engagement — Get more likes, comments, shares, event responses"
  - "Leads — Collect lead information (email, phone)"
  - "Sales — Drive purchases on your website or app"
  - "App Promotion — Get more app installs"
- Gather target audience details:
  - Location (city, state, or all India)
  - Age range (e.g. 18-35)
  - Gender (all, male, female)
  - Interests (e.g. fashion, fitness, technology, food)
  - Custom audiences (website visitors, email list) — if available.
- Ask about budget: daily budget or lifetime budget, amount in INR.
- Ask about campaign duration: start date, end date, or ongoing.
- Ask about ad creative: image, video, carousel, Stories, Reels.
- Confirm if user has creative assets ready or needs guidance.

### 2. Open Meta Ads Manager & Verify Login
- Open a NEW tab and navigate to `https://adsmanager.facebook.com`.
- Take snapshot. Check if logged in (Ads Manager dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Ensure the correct ad account is selected (check account name in top bar).
- Verify that an Instagram account is connected to the ad account.

### 3. Create Campaign
- Click "Create" to start a new campaign.
- Select the campaign objective as chosen by user.
- Name the campaign descriptively (e.g. "Instagram - Fashion Sale - March 2026").
- Configure campaign-level settings:
  - Campaign budget optimization (CBO) if using campaign-level budget.
  - A/B testing option (skip unless user requests).
- Take snapshot of campaign settings.
- Proceed to ad set level.

### 4. Configure Ad Set (Targeting & Budget)
- Set audience targeting:
  - Location: as specified by user (pin-drop or radius for local businesses).
  - Age: as specified.
  - Gender: as specified.
  - Detailed targeting: add interests, behaviors, demographics.
  - Placements: select "Instagram" only (Feed, Stories, Reels, Explore) or "Manual placements" to choose specific Instagram placements.
- Set budget and schedule:
  - Daily or lifetime budget as specified.
  - Start and end dates.
- Take snapshot of targeting summary and estimated reach.
- Show user: estimated audience size, daily reach estimate, cost per result estimate.
- Use `ask_user` to confirm targeting looks correct.

### 5. Create Ad Creative
- Select ad format: single image, video, carousel, or collection.
- If user has creative assets:
  - Upload images/videos via the media library.
- If user needs help:
  - Suggest using existing Instagram posts to promote (boost post option).
  - Mention Meta's free creative tools.
- Enter ad copy:
  - Primary text (main caption)
  - Headline (for feed ads)
  - Call-to-action button (Shop Now, Learn More, Sign Up, etc.)
  - Destination URL (website, app store, etc.)
- Take snapshot of ad preview (how it will appear on Instagram Feed, Stories, Reels).
- Use `ask_user` to confirm creative and copy.

### 6. Review & Confirm
- Use `confirm_action` with full campaign summary:
  - Campaign objective
  - Target audience (location, age, gender, interests)
  - Estimated reach
  - Budget (daily/lifetime) and duration
  - Ad format and placements
  - Ad copy and CTA
  - Destination URL
  - Estimated cost per result
- Do NOT launch unless user confirms.

### 7. Payment & Launch
- Use `collect_payment`:
  - summary: JSON with objective, audience, budget, duration, placements, estimated_reach
  - amount_inr: total campaign budget (or first billing amount)
  - description: "Instagram ad campaign"
- WAIT for payment confirmation from user.
- Click "Publish" to submit the campaign for review.
- Take snapshot of campaign submission confirmation.
- Report to user: campaign submitted, review typically takes 24 hours, campaign ID, start date.
- Mention: "Meta reviews all ads before they go live (usually within 24 hours). You can monitor performance in Ads Manager."

## Site Notes

- Instagram ads are created through Meta Ads Manager (adsmanager.facebook.com) — same platform as Facebook ads.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Meta. Do NOT ask user for credentials.
- An Instagram Business or Creator account must be connected to the Meta ad account — verify this before creating ads.
- Minimum daily budget in India is approximately ₹80/day — inform user if their budget is below minimum.
- Instagram Reels ads are currently the highest-engagement format in India — recommend if objective is engagement or awareness.
- Ad review by Meta takes up to 24 hours — ads that violate policies will be rejected with a reason.
- Billing is post-pay in India — Meta charges the payment method after the ad spends the budget threshold or at month end.
- Detailed targeting with Indian city-level precision works well — hyperlocal targeting is effective for small businesses.
- A/B testing is available at campaign level — recommend for budgets above ₹5,000 to optimize performance.
- Campaign metrics to track: reach, impressions, CTR, CPC, CPM, conversions — guide user on what to monitor post-launch.
- Use `confirm_action` for review, `collect_payment` for budget commitment. Always WAIT for user response.
