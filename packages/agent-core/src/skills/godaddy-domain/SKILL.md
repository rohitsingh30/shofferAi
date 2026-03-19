---
name: godaddy-domain
description: Register a domain name on GoDaddy — search availability, compare extensions, purchase, configure DNS.
triggers:
  - godaddy
  - register domain
  - buy domain
  - domain name
  - godaddy domain
  - purchase domain
  - domain registration
  - get a domain
siteUrl: https://www.godaddy.com
requiresAuth: true
params:
  - name: domain_name
    required: true
    hint: Desired domain name (e.g. "mywebsite.com", "startup.io")
  - name: extensions
    required: false
    hint: Preferred extensions (e.g. ".com", ".in", ".io", ".ai")
  - name: duration
    required: false
    hint: Registration duration in years (default 1 year)
---

# GoDaddy Domain Registration

Chrome profile: rsinghtomar3011@gmail.com. Operator GoDaddy account.

## Steps

### 1. Gather Requirements
- Confirm you have: desired domain name.
- If domain name is missing, use `ask_user` (input_type "freetext"): "What domain name would you like to register? (e.g. mybusiness.com)"
- Ask about preferred extensions if not specified (.com, .in, .io, .ai, .co, .org).
- Default registration duration to 1 year if not specified.

### 2. Open GoDaddy in New Tab
- Open a NEW tab and navigate to `https://www.godaddy.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, cookie consent banners, or upsell modals.
- Verify the domain search bar is visible on the page.

### 3. Verify Login
- Look for a profile icon, username, or "My Account" in the top-right header.
- If signed in: proceed to domain search.
- If NOT signed in: Click "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search Domain Availability
- Type the desired domain name in the search bar and click "Search" or press Enter.
- Take snapshot of search results.
- Check if the exact domain is available.
- If available: note the price and proceed.
- If NOT available: extract suggested alternatives and similar domains.
- Present results via `ask_user` (input_type "choice"):
  - Available exact match with price
  - Alternative extensions (.com, .in, .io, .net, .org) with prices
  - Similar domain suggestions with prices
  - "Search for a different domain" option

### 5. Select Domain & Extensions
- Click "Add to Cart" for the selected domain.
- GoDaddy will show upsell pages (privacy protection, email, hosting).
- For domain privacy: use `ask_user` (input_type "choice") — "Add WHOIS privacy (₹XXX/yr)?" with Yes/No.
- Skip hosting, email, and other upsells unless user specifically asked.
- Click "Continue to Cart" or "No Thanks" to bypass upsells.
- Take snapshot after adding to cart.

### 6. Configure Registration
- Set registration duration (1 year default, or as user specified).
- Review auto-renewal setting — note if enabled.
- Use `ask_user` (input_type "choice") if duration options need user input: "1 year", "2 years", "3 years", "5 years".
- Take snapshot of cart with final configuration.

### 7. Review Order & Confirm
- Navigate to checkout/cart summary.
- Take snapshot of the complete order.
- Use `confirm_action` to present order summary:
  - Domain name and extension
  - Registration duration
  - Privacy protection (if added)
  - ICANN fee
  - Subtotal, taxes, total per year
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with domain, duration, privacy, ICANN fee, price breakdown, total
  - amount_inr: total amount (number)
  - description: "GoDaddy domain registration"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on GoDaddy using available payment method (card, UPI, net banking).
- Handle payment OTP via `ask_user` if needed.

### 9. Domain Confirmation & Setup
- Take snapshot of confirmation page.
- Extract: domain name, registration dates, expiry date, nameservers, order number.
- Report full details to user.
- Ask if user wants to configure DNS settings (A record, CNAME, nameservers).
- If DNS config requested, navigate to domain management and apply settings.
- If domain failed to register, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- GoDaddy aggressively upsells — skip hosting, email, SSL, website builder unless user asked.
- Domain privacy (WHOIS protection) is recommended — mention it to user but let them decide.
- ICANN fee (₹15-20/yr) is mandatory for .com/.net/.org domains.
- Prices shown are often first-year promotional — renewal price is higher. Mention this.
- GoDaddy may show prices in USD — convert to INR for the user if needed.
- Auto-renewal is ON by default — warn user about this.
- DNS propagation takes 24-48 hours after purchase.
- Some premium domains have higher prices — these are shown separately.
- Use `confirm_action` for order review (before money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator Google account. Do NOT ask user for credentials.
