---
name: youtube-ads
description: Create YouTube ad campaign — video ads with targeting, budget, and bidding via Google Ads for YouTube placements.
triggers:
  - youtube ads
  - create youtube ad
  - youtube ad campaign
  - youtube advertising
  - youtube video ad
  - promote on youtube
  - youtube marketing
  - run youtube ad
  - advertise on youtube
  - youtube promotion
siteUrl: https://ads.google.com
requiresAuth: true
params:
  - name: objective
    required: false
    hint: Campaign goal (e.g. "brand awareness", "product consideration", "website traffic", "leads", "sales")
  - name: video_url
    required: false
    hint: YouTube video URL to use as ad (e.g. "https://youtube.com/watch?v=...")
  - name: budget
    required: false
    hint: Daily budget in INR (e.g. "₹500/day", "₹1000/day")
  - name: audience
    required: false
    hint: Target audience description (e.g. "18-35 gamers in India")
  - name: ad_format
    required: false
    hint: YouTube ad format (e.g. "skippable in-stream", "non-skippable", "bumper", "discovery")
---

# YouTube Ad Campaign Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine campaign goal via `ask_user` (input_type "choice"):
  - "Brand Awareness & Reach — Maximum views and impressions"
  - "Product & Brand Consideration — Drive interest and consideration"
  - "Website Traffic — Send viewers to your website"
  - "Leads — Collect contact information from interested viewers"
  - "Sales — Drive purchases and conversions"
- Determine ad format via `ask_user` (input_type "choice"):
  - "Skippable In-Stream — Plays before/during/after videos, skip after 5s (best for storytelling)"
  - "Non-Skippable In-Stream — 15-second unskippable ad (best for short messages)"
  - "Bumper Ads — 6-second non-skippable (best for quick brand recall)"
  - "In-Feed (Discovery) — Appears in search results and recommendations (best for consideration)"
  - "Shorts Ads — Appear between YouTube Shorts (best for mobile-first audiences)"
- Ask for the YouTube video URL to use as ad creative.
  - If user doesn't have a video, guide them to create one or use YouTube Video Builder.
- Gather target audience:
  - Location (India-wide, specific states, or cities)
  - Age range and gender
  - Interests and affinities (tech enthusiasts, beauty, gaming, cooking, etc.)
  - Topics (specific YouTube content categories)
  - Placements (specific YouTube channels or videos to show ads on)
  - Keywords (related to content users are watching)
- Ask about daily budget in INR and campaign duration.

### 2. Open Google Ads & Verify Login
- Open a NEW tab and navigate to `https://ads.google.com`.
- Take snapshot. Check if logged in (Google Ads dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify correct Google Ads account is selected.
- Ensure a YouTube channel is linked to the Google Ads account (required for video campaigns).

### 3. Create Video Campaign
- Click "+ New Campaign" in Google Ads.
- Select campaign goal as determined in step 1.
- Select campaign type: "Video".
- Select campaign subtype based on chosen ad format:
  - Video reach campaign (for awareness)
  - Video action campaign (for conversions)
  - Video view campaign (for consideration)
- Name the campaign descriptively (e.g. "YouTube - Brand Awareness - Gaming - March 2026").
- Configure bidding strategy:
  - CPV (Cost Per View) for skippable in-stream
  - CPM (Cost Per Mille) for non-skippable and bumper
  - CPA (Cost Per Action) for conversion-focused campaigns
- Set daily budget and campaign dates.
- Take snapshot of campaign settings.

### 4. Configure Targeting
- Set audience targeting:
  - **Location**: India or specific regions/cities.
  - **Language**: English, Hindi, Tamil, Telugu, etc.
  - **Demographics**: Age, gender, parental status, household income.
  - **Audiences**: Affinity audiences (lifestyle/interest categories), in-market audiences (actively researching/buying).
  - **Topics**: YouTube content categories where ads will show.
  - **Placements**: Specific YouTube channels, videos, or websites.
  - **Keywords**: Content-related keywords.
- Set content exclusions:
  - Inventory type: Expanded, Standard (recommended), or Limited.
  - Exclude sensitive content categories if needed.
- Set frequency capping (how many times a user sees the ad per day/week).
- Take snapshot of targeting summary and estimated impressions.
- Use `ask_user` to confirm targeting details.

### 5. Create Video Ad
- Select the YouTube video to use as ad creative (paste URL).
- Configure the ad:
  - **Final URL**: Landing page / website URL.
  - **Display URL**: Clean URL shown in the ad.
  - **Call-to-action (CTA)**: "Learn More", "Shop Now", "Sign Up", "Get Quote", etc.
  - **Headline**: Short, compelling text (max 15 characters).
  - **Companion banner**: Upload or auto-generate from YouTube channel.
- For in-feed (discovery) ads:
  - Write thumbnail headline and description lines.
- Take snapshot of ad preview showing how it appears on YouTube.
- Use `ask_user` to confirm ad creative and CTA.

### 6. Review & Confirm
- Use `confirm_action` with full campaign summary:
  - Campaign goal and ad format
  - Video ad URL and duration
  - Target audience (location, demographics, interests, placements)
  - Estimated impressions and reach
  - Budget (daily) and duration
  - Bidding strategy and estimated CPV/CPM
  - CTA and landing page URL
  - Frequency cap settings
- Do NOT launch unless user confirms.

### 7. Payment & Launch
- Use `collect_payment`:
  - summary: JSON with goal, ad_format, video_url, audience, budget_daily, duration, bidding, estimated_views
  - amount_inr: total campaign budget (daily budget x days)
  - description: "YouTube ad campaign"
- WAIT for payment confirmation from user.
- Click "Publish Campaign" to submit.
- Take snapshot of campaign submission confirmation.
- Report to user: campaign submitted for review, campaign ID, estimated daily views, budget, start date.
- Mention: "Google reviews video ads within 24-48 hours. Once approved, your ad will start showing on YouTube. Monitor views, watch time, and CTR in Google Ads."

## Site Notes

- YouTube ads are created and managed through Google Ads (ads.google.com) — not a separate platform.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Google. Do NOT ask user for credentials.
- A YouTube channel must be linked to the Google Ads account to run video campaigns — verify this before starting.
- YouTube is India's largest video platform with 450M+ users — massive reach for video advertising.
- Skippable in-stream ads only charge when viewers watch 30 seconds (or the full ad if shorter) — cost-efficient for awareness.
- Bumper ads (6 seconds) are extremely effective for brand recall — keep the message simple and memorable.
- YouTube Shorts ads are relatively new and have lower CPMs — recommend for mobile-first Indian audiences.
- Video quality matters: 1080p minimum recommended. Poor quality videos get skipped immediately and waste budget.
- Average CPV in India ranges from ₹0.50 to ₹3.00 depending on targeting and competition — among the cheapest globally.
- Remarketing to users who watched previous videos is powerful — suggest setting up remarketing lists for future campaigns.
- Content exclusions are important — exclude controversial content categories to maintain brand safety.
- YouTube analytics provides detailed data on viewer demographics, watch time, and engagement — guide user on metrics to track.
- Use `confirm_action` for review, `collect_payment` for budget commitment. Always WAIT for user response.
