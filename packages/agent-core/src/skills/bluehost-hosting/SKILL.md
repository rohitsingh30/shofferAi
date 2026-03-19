---
name: bluehost-hosting
description: Buy web hosting on Bluehost India — WordPress hosting, shared hosting, select plan, register domain, deploy website.
triggers:
  - bluehost
  - bluehost hosting
  - bluehost india
  - bluehost wordpress
  - wordpress hosting bluehost
  - bluehost plan
  - buy bluehost
  - bluehost domain
  - bluehost website
  - hosting on bluehost
  - bluehost shared hosting
  - bluehost web hosting
siteUrl: https://www.bluehost.in
requiresAuth: true
params:
  - name: hosting_type
    required: true
    hint: Type of hosting (e.g. "shared", "wordpress", "vps", "dedicated")
  - name: domain
    required: false
    hint: Domain name (e.g. "mysite.com") or "register new" or "use existing"
  - name: plan_tier
    required: false
    hint: Plan tier (e.g. "Basic", "Plus", "Choice Plus", "Pro", default Choice Plus)
  - name: duration
    required: false
    hint: Billing period (e.g. "12 months", "24 months", "36 months", default 36 months)
---

# Bluehost India Web Hosting Purchase

Chrome profile: rsinghtomar3011@gmail.com. Operator Bluehost account.

## Steps

### 1. Gather Requirements
- Confirm you have: hosting type.
- If hosting type is missing, use `ask_user` (input_type "choice"): "What type of hosting do you need?" — "Shared Hosting", "WordPress Hosting (optimized)", "VPS Hosting", "Dedicated Hosting".
- Ask about domain situation: "Do you want to register a new domain or use an existing one?"
- If registering new, gather desired domain name.
- Default plan to Choice Plus if not specified (best value with domain privacy).
- Default billing period to 36 months if not specified (lowest per-month rate).
- Clarify expected traffic and storage needs to recommend appropriate plan.

### 2. Open Bluehost in New Tab
- Open a NEW tab and navigate to `https://www.bluehost.in`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, live chat widgets, exit-intent modals, or cookie banners.
- Verify the Bluehost India page is loaded (pricing in INR, .in domain).
- If redirected to bluehost.com, manually navigate to bluehost.in for India pricing.

### 3. Verify Login
- Look for a profile icon, "My Account", or "Login" link in the top-right header.
- If signed in: proceed to plan selection.
- If NOT signed in: Click "Login" or navigate to `https://my.bluehost.in`.
- Attempt login with operator credentials.
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the Bluehost 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Hosting Plan
- Navigate to the appropriate hosting page:
  - Shared: `https://www.bluehost.in/hosting`
  - WordPress: `https://www.bluehost.in/wordpress-hosting`
  - VPS: `https://www.bluehost.in/vps-hosting`
  - Dedicated: `https://www.bluehost.in/dedicated-hosting`
- Take snapshot of available plans.
- Extract plan details: name, price/month, storage, bandwidth, websites, free domain, SSL, email accounts.
- Use `ask_user` (input_type "choice") to present plan options:
  - "Basic — Rs X/mo — 1 website, 50GB SSD, free domain"
  - "Plus — Rs X/mo — unlimited websites, unlimited SSD"
  - "Choice Plus — Rs X/mo — unlimited websites, domain privacy, backups"
  - "Pro — Rs X/mo — unlimited websites, dedicated IP, premium support"
- Click "Select" for the chosen plan.

### 5. Domain Registration
- Bluehost prompts for domain during checkout.
- **New domain**: Enter desired domain in "Create a new domain" field. Check availability.
  - If taken, present alternatives via `ask_user` (input_type "choice").
  - If available, proceed with registration (free for first year on most plans).
- **Existing domain**: Enter domain in "Use a domain you own" field.
  - Note: user will need to update nameservers to Bluehost after purchase.
- **Skip domain**: Select "I'll create my domain later" if user is undecided.
- Take snapshot after domain selection.

### 6. Configure Account & Package
- Fill account information from operator profile.
- Select billing period:
  - Use `ask_user` (input_type "choice"): "Select billing period:" — "12 Months (Rs X/mo)", "24 Months (Rs X/mo)", "36 Months (Rs X/mo)".
  - Mention that 36-month plan has lowest monthly rate but highest upfront cost.
- Review package extras — Bluehost pre-selects add-ons:
  - Domain Privacy: recommend keeping (protects WHOIS info).
  - SiteLock Security: optional, mention cost.
  - CodeGuard Basic: optional backup service.
  - Bluehost SEO Tools: skip unless user asks.
- Uncheck unnecessary add-ons to reduce cost.
- Take snapshot of the configured package with total.

### 7. Review Order & Confirm
- Review the complete order summary at checkout.
- Take snapshot of the final pricing.
- Use `confirm_action` to present:
  - Hosting plan and tier
  - Domain name and registration status
  - Billing period and monthly rate
  - Add-ons selected (domain privacy, backups, etc.)
  - Total upfront cost
  - Renewal price (will be higher — mention clearly)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan, domain, billing period, add-ons, monthly price, total cost, renewal price
  - amount_inr: total upfront amount (number)
  - description: "Bluehost India web hosting purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Bluehost using available method (credit card, debit card, UPI, net banking).
- Handle payment OTP via `ask_user` (input_type "otp") if needed.
- Bluehost India supports Razorpay/Paytm gateway — follow the payment flow.

### 9. Setup & Confirmation
- Take snapshot of the purchase confirmation and welcome page.
- Extract: order ID, hosting plan, domain, cPanel access, expiry date, nameservers.
- Report full details to user:
  - cPanel login URL and credentials
  - Domain nameservers (if new domain: auto-configured; if existing: provide NS records)
  - WordPress auto-install option
  - Free SSL certificate activation
  - Email account setup instructions
  - FTP credentials
- If purchase failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Bluehost India (bluehost.in) shows prices in INR — do NOT use bluehost.com which shows USD.
- Introductory prices are heavily discounted — ALWAYS mention the renewal price which is 2-3x higher.
- Bluehost pre-selects expensive add-ons at checkout — review and uncheck unnecessary ones to save money.
- Domain privacy is worth keeping — it hides personal info from WHOIS lookups.
- Free domain is included for the first year on most plans — renewal is separate.
- Bluehost uses cPanel (industry standard) unlike Hostinger which uses hPanel.
- WordPress auto-installer is available immediately after purchase via cPanel.
- Live chat widget is persistent and may overlap with page elements — dismiss or minimize.
- 36-month plan locks in the lowest rate but commits user for 3 years — explain tradeoff clearly.
- SSL is free via Let's Encrypt but may need manual activation in cPanel.
- DNS propagation takes 24-48 hours for new domains.
- Session can expire during long checkout flows — complete purchase promptly.
