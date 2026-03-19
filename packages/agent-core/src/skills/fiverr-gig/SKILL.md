---
name: fiverr-gig
description: Search and order services (gigs) on Fiverr — find freelancers, review packages, place order with requirements.
triggers:
  - fiverr
  - order on fiverr
  - fiverr gig
  - buy fiverr service
  - hire on fiverr
  - fiverr freelancer
  - order gig
  - fiverr.com
siteUrl: https://www.fiverr.com
requiresAuth: true
params:
  - name: service
    required: true
    hint: What service to order (e.g. "logo design", "video editing", "website development")
  - name: budget
    required: false
    hint: Budget range (e.g. "$50-100", "under $200")
  - name: delivery_time
    required: false
    hint: Preferred delivery time (e.g. "1 day", "3 days", "7 days")
  - name: requirements
    required: false
    hint: Specific requirements for the gig (e.g. "minimalist style", "60 second video")
---

# Fiverr Gig Search & Order

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a service, use `ask_user` (input_type "freetext"): "What service are you looking for on Fiverr? (e.g. logo design, video editing, translation)"
- If no budget provided, use `ask_user` (input_type "freetext"): "What's your budget range for this service?"
- If no specific requirements provided, use `ask_user` (input_type "freetext"): "Any specific requirements or details for the freelancer? (e.g. style, format, length)"

### 2. Open Fiverr & Verify Login
- Open a NEW tab and navigate to `https://www.fiverr.com`.
- Take a snapshot. Check if logged in (profile avatar or username in top-right).
- If NOT logged in, click Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Fiverr in Chrome Debug."**
- Take snapshot to confirm logged-in state and homepage visible.

### 3. Search for Services
- Use the search bar at the top of the page.
- Type the service the user is looking for and press Enter.
- Apply filters:
  - Budget range if specified.
  - Delivery time if specified.
  - Seller level: "Level 2" or "Top Rated" preferred.
  - Sort by: "Best Selling" or "Recommended".
- Take snapshot of search results.

### 4. Present Gig Options
- Scan results. Extract top 5-7 gigs with:
  - Seller name and level (New, Level 1, Level 2, Top Rated)
  - Gig title
  - Starting price
  - Rating and number of reviews
  - Delivery time
  - Thumbnail description
- Use `ask_user` (input_type "choice") to let user pick a gig.
- If none are suitable, ask if user wants to adjust search or filters.

### 5. Review Gig & Select Package
- Click on the selected gig to open the detail page.
- Take snapshot of the gig page.
- Present the available packages (Basic, Standard, Premium) with:
  - Package name and price
  - What's included (revisions, delivery time, features)
- Use `ask_user` (input_type "choice") to let user pick a package.
- If user has specific requirements, check if any package extras (add-ons) are needed.

### 6. Place Order & Payment
- Click "Continue" or "Order Now" for the selected package.
- Review the order summary page.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with gig title, seller, package, price, delivery time, inclusions
  - amount_inr: total amount converted to INR (number)
  - description: "Fiverr gig order"
- STOP and WAIT — payment panel opens for user.
- Only proceed if payment confirmed. If cancelled, ask what to change.

### 7. Submit Requirements & Confirm
- After payment, Fiverr shows a requirements form for the seller.
- Fill in the requirements using what user provided. Use `ask_user` for any missing fields.
- Click "Submit Requirements" or "Start Order".
- Take snapshot of the order confirmation page.
- Report to user:
  - Order number
  - Gig title and seller name
  - Package selected and price paid
  - Expected delivery date
  - "You'll receive updates in your Fiverr inbox"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Fiverr prices are in USD — convert to INR for `collect_payment` using approximate rate.
- Fiverr may show promotional banners, cookie consent, or upsell popups — dismiss them.
- Prioritize sellers with "Top Rated" or "Level 2" badges and 4.8+ ratings.
- Some gigs have mandatory requirements after purchase — ensure user provides all details.
- Fiverr sessions can expire — if login page appears, STOP and inform user.
- Fiverr uses React — always use Playwright fill/type methods.
- Use `collect_payment` for the actual order (real money). WAIT for user response. Do NOT auto-proceed.
- Fiverr charges a service fee on top of gig price — include it in the total shown to user.
- Delivery time starts after requirements are submitted, not after payment.
- If seller is unavailable or gig is paused, inform user and suggest alternatives.
