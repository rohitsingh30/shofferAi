---
name: 99designs-logo
description: Get a logo or brand identity design on 99designs — launch a design contest or hire a designer directly for logos, branding, packaging, and more.
triggers:
  - 99designs
  - logo design contest
  - 99designs logo
  - brand identity design
  - design contest
  - hire designer 99designs
  - logo competition
  - professional logo design
siteUrl: https://99designs.com
requiresAuth: true
params:
  - name: design_type
    required: true
    hint: Type of design needed (e.g. "logo design", "brand identity", "business card", "packaging", "web design")
  - name: approach
    required: false
    hint: Contest or direct hire (e.g. "contest", "1-to-1 project", "let me decide")
  - name: budget
    required: false
    hint: Budget tier (e.g. "Bronze $299", "Silver $499", "Gold $899", "Platinum $1299")
  - name: brand_name
    required: false
    hint: Brand or company name for the design
  - name: style_preference
    required: false
    hint: Design style (e.g. "minimalist", "vintage", "playful", "corporate", "hand-drawn")
---

# 99designs Logo & Brand Design

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify design type, use `ask_user` (input_type "choice"): "What type of design do you need?" with options "Logo Design", "Brand Identity Pack", "Business Card", "Packaging Design", "Web/App Design", "T-shirt Design", "Other".
- If approach not specified, use `ask_user` (input_type "choice"): "How would you like to get your design?" with options "Design Contest (multiple designers compete, you pick the best)", "1-to-1 Project (hire a specific designer directly)", "Not sure — recommend one".
- If brand name not provided, use `ask_user` (input_type "freetext"): "What is the brand/company name for the design?"
- If style preference not provided, use `ask_user` (input_type "choice"): "What design style do you prefer?" with options "Minimalist & Clean", "Bold & Modern", "Vintage & Retro", "Playful & Fun", "Corporate & Professional", "Hand-drawn & Artisan", "Abstract & Geometric", "Not sure — open to ideas".
- If budget not specified, explain the tiers and use `ask_user` (input_type "choice"): "What's your budget?" with tier options.

### 2. Open 99designs in New Tab
- Open a NEW tab and navigate to `https://99designs.com`.
- Take a snapshot to see the homepage.
- Dismiss any promotional popups, cookie consent banners, or seasonal offers.
- Verify the main navigation and "Start a contest" or "Find a designer" buttons are visible.

### 3. Verify Login
- Look for a profile avatar, username, or account menu in the top-right.
- If signed in: proceed to design flow.
- If NOT signed in: Click "Log in", attempt login with rsinghtomar3011@gmail.com.
- If 2FA or email verification appears, use `ask_user`: "99designs needs verification. Please check your email and share the verification code."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to 99designs in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Start Contest or Find Designer
- **If Contest approach:**
  - Click "Start a contest" or navigate to the contest creation flow.
  - Select the design category (Logo, Brand Identity, etc.).
  - Take snapshot of the contest brief form.
- **If 1-to-1 Project approach:**
  - Navigate to "Find a designer" section.
  - Search for designers specializing in the required design type.
  - Filter by: style, budget range, rating, location.
  - Take snapshot of designer profiles.
  - Present top 5 designers via `ask_user` (input_type "choice"):
    - Designer name and level (Top Level, Mid Level, Entry Level)
    - Portfolio style match
    - Starting price
    - Rating and number of completed projects
    - Response time
  - Select the designer chosen by user.

### 5. Fill Design Brief
- Complete the design brief form with user-provided details:
  - Brand/company name and tagline (if any)
  - Industry and target audience
  - Design style preferences (selected earlier)
  - Color preferences: use `ask_user` (input_type "freetext"): "Any color preferences? (e.g. blue and white, earthy tones, no preference)"
  - What the logo should convey (e.g. trust, innovation, fun)
  - Existing brand materials or inspiration (URLs, images)
  - Where the logo will be used (web, print, signage, merchandise)
  - Designs to avoid or things NOT to include
- Use `ask_user` (input_type "freetext") for any fields requiring creative input.
- Take snapshot of the completed brief.

### 6. Select Package & Budget
- Review available packages/tiers:
  - **Bronze**: lowest price, fewer designers participate
  - **Silver**: mid-range, more designers, better quality
  - **Gold**: premium, top designers prioritized, more concepts
  - **Platinum**: highest tier, dedicated account manager, guaranteed top designers
- For 1-to-1: review the designer's package options and pricing.
- Present via `ask_user` (input_type "choice"):
  - Package name with price
  - Number of designers expected to participate (contest)
  - Number of initial concepts
  - Money-back guarantee details
- Take snapshot of the selected package details.

### 7. Review & Confirm
- Navigate to the order summary page.
- Take snapshot of the complete brief and pricing.
- Use `confirm_action` to present:
  - Design type and approach (contest or 1-to-1)
  - Brand name and brief summary
  - Package/tier selected
  - Price breakdown (design fee, platform fee, total)
  - Contest duration (typically 7 days for contests)
  - What is included (file formats, revisions, copyright transfer)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with design type, approach, brand name, package, designer (if 1-to-1), price breakdown, total USD and INR
  - amount_inr: total amount converted to INR (number)
  - description: "99designs design service"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on 99designs using available payment method.
- Handle payment OTP or verification via `ask_user` if needed.

### 9. Launch & Confirmation
- Take snapshot of the contest launch or project start confirmation.
- Report to user:
  - Contest/project ID
  - Design type and brief summary
  - Package and amount paid
  - Expected timeline (7 days for contest, varies for 1-to-1)
  - Number of designers expected (for contest)
  - "Designers will start submitting concepts. You can rate designs and provide feedback. I'll help you review submissions when they come in."
  - Next steps: rate designs, request revisions, pick winner

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- 99designs prices are in USD — convert to INR for `collect_payment` using approximate market rate.
- Contests typically run for 7 days, with a qualifying round + final round structure.
- 99designs offers a 100% money-back guarantee if you are not satisfied with contest results.
- Higher budget tiers attract more and better designers — Gold and above recommended for professional use.
- 1-to-1 projects may be more expensive per designer but you get dedicated attention and revisions.
- 99designs may show onboarding tutorials for first-time users — skip or dismiss them.
- Session can expire — if login page appears, STOP and inform user.
- 99designs uses React — always use Playwright fill/type methods.
- Use `confirm_action` for brief review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Full copyright transfer is included in all packages — the winning design becomes 100% yours.
- Contest winners are chosen by the client (user) — designers compete, user picks the best.
- If user needs brand identity pack (logo + business card + letterhead), recommend the Brand Identity category.
