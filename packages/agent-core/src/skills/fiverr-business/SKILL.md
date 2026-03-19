---
name: fiverr-business
description: Buy business services on Fiverr — logo design, marketing, writing, video production, web development, and other professional services.
triggers:
  - fiverr business
  - buy logo design
  - fiverr marketing
  - fiverr writing service
  - hire designer fiverr
  - fiverr web development
  - business service fiverr
  - fiverr video editing
siteUrl: https://www.fiverr.com
requiresAuth: true
params:
  - name: service_category
    required: true
    hint: Category of business service (e.g. "logo design", "social media marketing", "blog writing", "video editing", "website development")
  - name: budget
    required: false
    hint: Budget range in USD (e.g. "$50-100", "under $500", "$200-300")
  - name: deadline
    required: false
    hint: When you need the delivery (e.g. "3 days", "1 week", "2 weeks")
  - name: brief
    required: false
    hint: Project brief or specific requirements (e.g. "minimalist logo for tech startup", "10 blog posts about AI")
---

# Fiverr Business Services

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a service category, use `ask_user` (input_type "choice"): "What business service do you need?" with options "Logo & Brand Design", "Social Media Marketing", "Content Writing", "Video Editing & Production", "Website Development", "SEO Services", "Translation", "Voiceover", "Other".
- If no budget specified, use `ask_user` (input_type "freetext"): "What is your budget for this service? (e.g. $50-100, under $500)"
- If no brief provided, use `ask_user` (input_type "freetext"): "Please describe what you need in detail. Include style preferences, target audience, brand name, and any specific requirements."
- If deadline matters, use `ask_user` (input_type "choice"): "When do you need this delivered?" with options "Express (1-2 days)", "Standard (3-5 days)", "Flexible (1-2 weeks)", "No rush".

### 2. Open Fiverr in New Tab
- Open a NEW tab and navigate to `https://www.fiverr.com`.
- Take a snapshot to see the homepage.
- Dismiss any promotional popups, cookie consent, seasonal banners, or upsell modals.
- Verify the search bar and main navigation are visible.

### 3. Verify Login
- Look for a profile avatar, username, or notification bell in the top-right.
- If signed in: proceed to search.
- If NOT signed in: Click "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Fiverr needs additional verification. Please complete the sign-in step in the browser and type 'done'."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Fiverr in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search & Filter Services
- Use the search bar to enter the service category or specific query.
- Press Enter to search.
- Apply filters based on user requirements:
  - Budget range: set min/max price slider.
  - Delivery time: select matching option.
  - Seller level: prefer "Top Rated Seller" or "Level 2 Seller".
  - Seller speaks: "English" (or user-preferred language).
  - Sort by: "Best Selling" for reliability or "Highest Rated" for quality.
- For Fiverr Pro services (premium), check the "Pro services" filter if budget allows.
- Take snapshot of filtered search results.

### 5. Present Service Options
- Scan results. Extract top 5-7 gigs with:
  - Seller name, level badge, and profile country
  - Gig title and thumbnail description
  - Starting price (Basic package)
  - Rating (stars) and total number of reviews
  - Delivery time for basic package
  - Number of orders in queue (if visible)
- Use `ask_user` (input_type "choice") to let user pick a service/seller.
- If none are suitable, offer to refine search, change category, or view more results.

### 6. Review Gig Details & Select Package
- Click on the selected gig to open the detail page.
- Take snapshot of the gig page including portfolio samples.
- Present the three packages (Basic, Standard, Premium) with:
  - Package name, price, and delivery time
  - Number of revisions included
  - Key deliverables (e.g. logo files, source files, 3D mockup)
  - Any extras/add-ons available (expedited delivery, additional concepts, source files)
- Use `ask_user` (input_type "choice") to let user select a package.
- If user needs specific add-ons, check their prices and present options.
- Review seller's portfolio and recent reviews — summarize quality for user.

### 7. Place Order & Payment
- Click "Continue" for the selected package (with any add-ons).
- Review the order summary page showing total cost.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with gig title, seller name and level, package selected, deliverables, delivery time, add-ons, service fee, total USD and INR
  - amount_inr: total amount converted to INR (number)
  - description: "Fiverr business service order"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete the order on Fiverr after payment is confirmed.

### 8. Submit Requirements & Confirm
- After order is placed, Fiverr shows a requirements page for the seller.
- Fill in project requirements using the user's brief:
  - Project description and goals
  - Brand name, tagline, color preferences (for design)
  - Target audience and style references
  - File uploads if needed (use `ask_user` to guide file selection)
- Use `ask_user` for any mandatory fields the seller requires.
- Click "Submit Requirements" or "Start Order".
- Take snapshot of the order confirmation.
- Report to user:
  - Order number
  - Seller name and gig title
  - Package and price paid
  - Expected delivery date
  - Number of revisions included
  - "You'll receive updates and deliveries in your Fiverr inbox. I'll help you review when delivery arrives."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Fiverr prices are in USD — convert to INR for `collect_payment` using approximate market rate.
- Fiverr charges a service fee (~5.5%) on top of gig price — include this in the total shown to user.
- Top Rated and Level 2 sellers are more reliable — prioritize them over new sellers.
- Fiverr Pro sellers charge premium but deliver professional agency-quality work — recommend for high-budget projects.
- Fiverr may show cookie consent, promotional banners, or upsell popups — dismiss them promptly.
- Session can expire — if login page appears, STOP and inform user.
- Fiverr uses React — always use Playwright fill/type methods.
- Use `collect_payment` for the actual order. WAIT for user response. Do NOT auto-proceed.
- Delivery time starts after requirements are submitted, NOT after payment — inform user.
- Sellers in different time zones may take longer to respond — set expectations.
- If seller is unavailable, on vacation, or gig is paused, inform user and suggest alternatives.
- Check seller's response time and recent delivery stats before recommending.
