---
name: namecheap-domain
description: Register a domain on Namecheap — search availability, compare prices across extensions, purchase and configure.
triggers:
  - namecheap
  - namecheap domain
  - cheap domain
  - register domain namecheap
  - buy domain namecheap
  - domain on namecheap
  - affordable domain
  - domain registrar
siteUrl: https://www.namecheap.com
requiresAuth: true
params:
  - name: domain_name
    required: true
    hint: Desired domain name (e.g. "coolstartup.com", "myapp.io")
  - name: extensions
    required: false
    hint: Preferred extensions (e.g. ".com", ".io", ".dev", ".ai")
  - name: duration
    required: false
    hint: Registration duration in years (default 1 year)
---

# Namecheap Domain Registration

Chrome profile: rsinghtomar3011@gmail.com. Operator Namecheap account.

## Steps

### 1. Gather Requirements
- Confirm you have: desired domain name.
- If domain name is missing, use `ask_user` (input_type "freetext"): "What domain name would you like to register? (e.g. myproject.com)"
- Ask about preferred extensions if not specified. Suggest popular ones: .com, .io, .dev, .ai, .co, .in.
- Default registration duration to 1 year if not specified.
- Note any specific requirements (privacy, specific nameservers, etc.).

### 2. Open Namecheap in New Tab
- Open a NEW tab and navigate to `https://www.namecheap.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, cookie consent banners, or sale notifications.
- Verify the domain search bar is visible on the homepage.

### 3. Verify Login
- Look for a profile icon, username, or "Account" link in the top-right header.
- If signed in: proceed to domain search.
- If NOT signed in: Click "Sign In" or "Account", enter operator credentials.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search Domain Availability
- Type the desired domain name in the search bar and click the search button.
- Take snapshot of search results page.
- Extract availability for the exact domain and alternative extensions.
- Note: Namecheap shows a comparison table with multiple TLDs and prices.
- If exact match unavailable, extract suggested alternatives.
- Present results via `ask_user` (input_type "choice"):
  - Each available extension with price per year (e.g. ".com — $8.88/yr", ".io — $32.98/yr")
  - Premium domains flagged with higher prices
  - "Search for a different domain" as last option

### 5. Select Domain & Add-ons
- Click "Add to Cart" for the selected domain.
- Namecheap includes free WHOIS privacy (WhoisGuard) — confirm it's enabled.
- Check for any upsell pages (hosting, email, SSL, VPN).
- Skip upsells unless user specifically requested them.
- Use `ask_user` (input_type "choice") if premium DNS or other add-ons are shown.
- Take snapshot after adding to cart.

### 6. Configure Registration
- Navigate to the shopping cart.
- Set registration duration (1 year default, or as user specified).
- Verify WhoisGuard (free privacy) is enabled.
- Check auto-renewal setting.
- Use `ask_user` (input_type "choice") for duration: "1 year", "2 years", "3 years", "5 years", "10 years".
- Take snapshot of configured cart.

### 7. Review Order & Confirm
- Take snapshot of the complete cart summary.
- Use `confirm_action` to present order summary:
  - Domain name with extension
  - Registration duration
  - WhoisGuard status (free)
  - ICANN fee (if applicable)
  - Subtotal, any discounts, taxes, total
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Click "Confirm Order" or proceed to checkout.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with domain, extension, duration, WhoisGuard, price breakdown, total
  - amount_inr: total amount converted to INR (number)
  - description: "Namecheap domain registration"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Namecheap (card, PayPal, or account funds).
- Handle payment OTP via `ask_user` if needed.

### 9. Domain Confirmation & Setup
- Take snapshot of order confirmation page.
- Extract: domain name, registration date, expiry date, nameservers, order ID, WhoisGuard status.
- Report full details to user.
- Ask if user wants to configure: custom nameservers, DNS records (A, CNAME, MX), or redirect.
- If DNS config requested, navigate to Domain List > Manage and apply settings.
- If registration failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Namecheap includes FREE WhoisGuard (WHOIS privacy) on most domains — always enable it.
- Prices are shown in USD — convert to approximate INR for the user (mention exchange rate).
- Namecheap often has first-year discounts — renewal prices may be higher. Mention this.
- ICANN fee ($0.18/yr) applies to .com, .net, .org domains.
- Auto-renewal is configurable — recommend enabling it to avoid losing the domain.
- Namecheap's free DNS is sufficient for most use cases (BasicDNS).
- PremiumDNS ($4.88/yr) adds DDoS protection and faster resolution — optional.
- Domain transfers from other registrars require an auth/EPP code.
- Use `confirm_action` for order review (before money), `collect_payment` for actual payment.
- When using confirm_action or collect_payment, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator account. Do NOT ask user for credentials.
