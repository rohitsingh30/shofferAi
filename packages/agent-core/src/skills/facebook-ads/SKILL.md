---
name: facebook-ads
description: Create Facebook ad campaign — set objective, target audience, creative, budget, and launch via Meta Ads Manager.
triggers:
  - facebook ads
  - create facebook ad
  - facebook ad campaign
  - facebook advertising
  - facebook promotion
  - promote on facebook
  - fb ads
  - run facebook ad
  - facebook marketing
  - facebook boost
siteUrl: https://adsmanager.facebook.com
requiresAuth: true
params:
  - name: objective
    required: false
    hint: Campaign objective (e.g. "awareness", "traffic", "engagement", "leads", "sales")
  - name: budget
    required: false
    hint: Daily or total budget in INR (e.g. "₹500/day", "₹10000 total")
  - name: audience
    required: false
    hint: Target audience description (e.g. "25-45 males in Bangalore interested in tech")
  - name: duration
    required: false
    hint: Campaign duration (e.g. "7 days", "14 days", "ongoing")
  - name: creative_type
    required: false
    hint: Ad format (e.g. "image", "video", "carousel", "collection")
---

# Facebook Ad Campaign Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine campaign objective via `ask_user` (input_type "choice"):
  - "Awareness — Maximize reach and brand recall"
  - "Traffic — Drive visits to website, app, or Facebook page"
  - "Engagement — Get likes, comments, shares, event responses, page likes"
  - "Leads — Collect contact info via lead forms (no website needed)"
  - "Sales — Drive purchases and conversions on website"
  - "App Promotion — Get more app installs and engagement"
- Gather target audience:
  - Location (city, state, pin code radius, or all India)
  - Age range and gender
  - Interests and behaviors (e.g. shopping, technology, fitness, parenting)
  - Custom audiences: website visitors, email lists, lookalike audiences
- Ask about budget: daily or lifetime, amount in INR.
- Ask about duration: start/end dates or continuous.
- Ask about ad format: single image, video, carousel, slideshow, collection.
- Determine if user has creative assets (images, videos) or needs guidance.

### 2. Open Meta Ads Manager & Verify Login
- Open a NEW tab and navigate to `https://adsmanager.facebook.com`.
- Take snapshot. Check if logged in (Ads Manager dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify correct ad account is selected in the top navigation bar.
- Check if a Facebook Page is connected (required for running ads).

### 3. Create Campaign
- Click "Create" to start a new campaign.
- Select Buying Type: "Auction" (default) or "Reach and Frequency" (for predictable reach).
- Select the campaign objective chosen by user.
- Name the campaign (e.g. "Facebook - Lead Gen - Tech Products - March 2026").
- Configure campaign-level settings:
  - Campaign budget optimization (CBO): on or off based on preference.
  - Special ad categories: declare if applicable (housing, credit, employment, politics).
- Take snapshot and proceed to ad set level.

### 4. Configure Ad Set (Audience & Placement)
- Define the audience:
  - Location: city-level, state, or radius targeting.
  - Age and gender as specified.
  - Detailed targeting: interests, behaviors, demographics, job titles.
  - Exclude specific audiences if needed (e.g. existing customers).
  - Lookalike audience: based on existing customer list if available.
- Set placements:
  - **Advantage+ placements** (automatic across Facebook, Instagram, Messenger, Audience Network).
  - Or **Manual placements**: Facebook Feed, Right Column, Marketplace, Stories, Reels, In-Stream Video.
- Set budget (daily or lifetime) and schedule (start/end dates).
- Take snapshot of audience definition and estimated reach.
- Show user: estimated daily reach, potential audience size, estimated results.
- Use `ask_user` to confirm targeting and budget.

### 5. Create Ad Creative
- Select ad format: single image, video, carousel, or collection.
- If user has assets: upload images or videos.
- If user needs help: suggest stock images or existing page posts.
- Enter ad content:
  - **Primary text**: Main ad copy (compelling, benefit-focused, with CTA).
  - **Headline**: Short, attention-grabbing (max 40 chars recommended).
  - **Description**: Supporting text below headline.
  - **Call-to-action button**: Learn More, Shop Now, Sign Up, Get Offer, Contact Us, etc.
  - **Destination URL**: Landing page, website, or Instant Experience.
- For Lead ads: design the lead form (fields: name, email, phone, custom questions).
- Take snapshot of ad preview across placements.
- Use `ask_user` to confirm creative and copy look good.

### 6. Review & Confirm
- Use `confirm_action` with full campaign summary:
  - Campaign objective
  - Target audience (location, demographics, interests)
  - Estimated audience size and daily reach
  - Placements selected
  - Budget (daily/lifetime) and duration
  - Ad format and creative summary
  - Ad copy (primary text, headline, CTA)
  - Destination URL or lead form
  - Estimated cost per result
- Do NOT launch unless user confirms.

### 7. Payment & Launch
- Use `collect_payment`:
  - summary: JSON with objective, audience_size, budget, duration, placements, ad_format, estimated_reach
  - amount_inr: total campaign budget or first billing amount
  - description: "Facebook ad campaign"
- WAIT for payment confirmation from user.
- Click "Publish" to submit campaign for review.
- Take snapshot of submission confirmation.
- Report to user: campaign submitted for review, expected approval within 24 hours, campaign ID, budget, schedule.
- Mention: "Meta typically reviews ads within 24 hours. Monitor performance in Ads Manager. You can pause or adjust anytime."

## Site Notes

- Facebook ads are managed via Meta Ads Manager (adsmanager.facebook.com) — same platform as Instagram ads.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Meta. Do NOT ask user for credentials.
- A Facebook Page is required to run ads — verify one exists before starting campaign creation.
- Minimum daily budget in India is approximately ₹80/day — inform user if budget is below threshold.
- Facebook's Advantage+ audience (formerly broad targeting) uses AI to find best audience — good for beginners.
- Lead ads with instant forms are extremely effective in India — users submit info without leaving Facebook, reducing drop-off.
- Special ad categories (housing, employment, credit, social/political) have restricted targeting — declare upfront to avoid policy violations.
- Billing in India is post-pay: Meta charges after reaching a billing threshold or at month-end. Payment methods: credit/debit card, UPI, net banking.
- Facebook ads typically have lower CPC than Google Ads in India — great for awareness and engagement campaigns.
- Carousel ads with 3-10 images perform well for e-commerce — each card can link to a different product page.
- Ad fatigue sets in after 7-10 days with the same creative — recommend refreshing creative for campaigns longer than 2 weeks.
- Use `confirm_action` for review, `collect_payment` for budget commitment. Always WAIT for user response.
