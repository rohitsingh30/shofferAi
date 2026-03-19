---
name: twitter-ads
description: Create X/Twitter ad campaign — promoted tweets, follower growth, website traffic with targeting and budget controls.
triggers:
  - twitter ads
  - x ads
  - create twitter ad
  - twitter ad campaign
  - twitter advertising
  - promote tweet
  - twitter promotion
  - x advertising
  - run twitter ad
  - twitter marketing
siteUrl: https://ads.x.com
requiresAuth: true
params:
  - name: objective
    required: false
    hint: Campaign objective (e.g. "reach", "engagement", "website traffic", "followers", "app installs", "video views")
  - name: budget
    required: false
    hint: Daily or total budget in INR (e.g. "₹500/day", "₹10000 total")
  - name: audience
    required: false
    hint: Target audience description (e.g. "18-45 tech enthusiasts in India")
  - name: tweet_content
    required: false
    hint: Tweet text to promote (or existing tweet URL)
  - name: duration
    required: false
    hint: Campaign duration (e.g. "7 days", "14 days", "30 days")
---

# X/Twitter Ad Campaign Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine campaign objective via `ask_user` (input_type "choice"):
  - "Reach — Show your ad to maximum people"
  - "Engagements — Get likes, retweets, replies on promoted tweet"
  - "Website Traffic — Drive clicks to your website"
  - "Followers — Grow your X/Twitter following"
  - "Video Views — Promote video content for maximum views"
  - "App Installs — Drive mobile app downloads"
  - "Conversions — Track and optimize for website actions"
- Determine the promoted content:
  - Promote an existing tweet (provide tweet URL)
  - Create a new promoted tweet (draft ad copy)
  - Promote account (for follower growth)
- Gather target audience:
  - Location (India, specific states/cities)
  - Age range and gender
  - Interests and topics (technology, sports, politics, entertainment, business)
  - Follower look-alikes (target users similar to followers of specific accounts)
  - Keywords (target users who tweet about specific topics)
  - Device targeting (iOS, Android, desktop)
- Ask about budget: daily budget or total campaign budget in INR.
- Ask about campaign duration.

### 2. Open X Ads & Verify Login
- Open a NEW tab and navigate to `https://ads.x.com`.
- Take snapshot. Check if logged in (X Ads dashboard visible with campaign overview).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify the correct X/Twitter account and ad account are selected.
- Check if billing information is set up — X requires payment method before launching campaigns.

### 3. Create Campaign
- Click "Create Campaign" in X Ads Manager.
- Select the campaign objective as chosen by user.
- Name the campaign descriptively (e.g. "X - Engagement - Tech Launch - March 2026").
- Set funding source and billing information.
- Configure campaign-level budget (daily cap or total budget).
- Set campaign start and end dates.
- Take snapshot of campaign settings.

### 4. Configure Ad Group (Targeting)
- Create an ad group within the campaign.
- Set audience targeting:
  - **Location**: India (or specific cities/states).
  - **Age**: as specified.
  - **Gender**: as specified.
  - **Languages**: English, Hindi, etc.
  - **Interests**: select from X's interest categories.
  - **Follower look-alikes**: enter @handles of accounts whose followers are similar to target audience.
  - **Keywords**: terms users tweet about or search for.
  - **Conversation topics**: trending or evergreen topics.
  - **Device/OS**: if targeting mobile app users.
- Set placement:
  - Home timelines, profiles, search results, X Audience Platform (partner apps).
- Set bidding:
  - Automatic bid (recommended for beginners)
  - Maximum bid (set a cap per engagement/click)
  - Target cost (aim for specific cost per result)
- Take snapshot of targeting summary and audience size estimate.
- Use `ask_user` to confirm targeting configuration.

### 5. Create Ad Creative
- For promoted tweet:
  - If using existing tweet: select from recent tweets on the account.
  - If creating new: compose tweet text (up to 280 characters), add image/video/GIF.
  - Write compelling copy with clear CTA.
  - Add website card (image + headline + URL) if driving traffic.
- For follower campaign: set up the promoted account card with compelling bio.
- For video ads: upload video (recommended 15 seconds or less for best engagement).
- Take snapshot of ad preview.
- Use `ask_user` to confirm ad content and creative.

### 6. Review & Confirm
- Use `confirm_action` with full campaign summary:
  - Campaign objective
  - Promoted content (tweet text or existing tweet)
  - Target audience (location, interests, keywords, follower look-alikes)
  - Estimated audience size
  - Placements selected
  - Budget (daily/total) and duration
  - Bidding strategy
  - Estimated cost per result
- Do NOT launch unless user confirms.

### 7. Payment & Launch
- Use `collect_payment`:
  - summary: JSON with objective, audience, budget, duration, placements, tweet_preview, bidding_strategy
  - amount_inr: total campaign budget
  - description: "X/Twitter ad campaign"
- WAIT for payment confirmation from user.
- Click "Launch Campaign" to submit.
- Take snapshot of campaign launch confirmation.
- Report to user: campaign launched, campaign ID, estimated reach, daily budget, schedule.
- Mention: "X reviews ads within a few hours. Monitor performance in X Ads Manager. You can pause, edit, or end the campaign anytime."

## Site Notes

- X/Twitter ads are managed at ads.x.com — previously ads.twitter.com, now rebranded to X.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to X/Twitter. Do NOT ask user for credentials.
- X Ads requires a verified payment method before campaigns can launch — credit/debit card is the primary method in India.
- Minimum campaign spend in India is approximately ₹1,500 total — smaller budgets may not deliver meaningful results.
- Follower look-alike targeting is X's most powerful feature — targeting followers of competitor or industry accounts is highly effective.
- X has smaller reach in India compared to Facebook/Instagram but excels for B2B, tech, news, and politically engaged audiences.
- Promoted tweets appear in timelines and look native — high engagement rates when content is organic-feeling.
- Video ads on X auto-play on mute — ensure first 3 seconds are visually compelling. Add captions for sound-off viewing.
- X's ad approval is usually faster than Meta (hours, not days) — but can reject ads violating content policies.
- Keyword targeting allows reaching users based on their recent tweets and searches — very intent-driven.
- Billing is prepaid or postpaid depending on account age and spend history — verify billing type before launching.
- Use `confirm_action` for review, `collect_payment` for budget commitment. Always WAIT for user response.
