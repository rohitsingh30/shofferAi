---
name: hostinger-hosting
description: Buy web hosting on Hostinger — select hosting plan, register domain, deploy website, configure SSL and email.
triggers:
  - hostinger
  - hostinger hosting
  - buy hosting
  - web hosting
  - hostinger plan
  - cheap hosting
  - wordpress hosting hostinger
  - shared hosting
  - hostinger website
  - deploy on hostinger
  - hostinger domain
  - hosting plan
siteUrl: https://www.hostinger.in
requiresAuth: true
params:
  - name: hosting_type
    required: true
    hint: Type of hosting (e.g. "shared", "wordpress", "cloud", "vps")
  - name: domain
    required: false
    hint: Domain name to use (e.g. "mysite.com") or "register new" or "use existing"
  - name: plan_tier
    required: false
    hint: Plan tier (e.g. "Premium", "Business", "Cloud Startup", default Premium)
  - name: duration
    required: false
    hint: Billing period (e.g. "1 month", "12 months", "48 months", default 12 months)
---

# Hostinger Web Hosting Purchase

Chrome profile: rsinghtomar3011@gmail.com. Operator Hostinger account.

## Steps

### 1. Gather Requirements
- Confirm you have: hosting type.
- If hosting type is missing, use `ask_user` (input_type "choice"): "What type of hosting do you need?" — "Shared Hosting (websites)", "WordPress Hosting", "Cloud Hosting (high traffic)", "VPS (full control)".
- Ask about domain: "Do you have an existing domain, want to register a new one, or use a free subdomain?"
- If registering new domain, gather desired domain name.
- Default plan tier to Premium if not specified.
- Default billing period to 12 months if not specified (best value).
- Clarify website purpose to recommend appropriate plan.

### 2. Open Hostinger in New Tab
- Open a NEW tab and navigate to `https://www.hostinger.in`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, chat widgets, countdown timer banners, or cookie consent.
- Verify the main hosting plans page or dashboard is visible.
- If on marketing page, click "Hosting" in the top nav to see plans.

### 3. Verify Login
- Look for a profile icon, account email, or "My Account" / "hPanel" link in the header.
- If signed in: proceed to plan selection.
- If NOT signed in: Click "Log In" or navigate to `https://hpanel.hostinger.com`.
- Attempt login with operator Google account (rsinghtomar3011@gmail.com).
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the Hostinger 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Select Hosting Plan
- Navigate to the appropriate hosting category page:
  - Shared: `https://www.hostinger.in/web-hosting`
  - WordPress: `https://www.hostinger.in/wordpress-hosting`
  - Cloud: `https://www.hostinger.in/cloud-hosting`
  - VPS: `https://www.hostinger.in/vps-hosting`
- Take snapshot of available plans with pricing.
- Extract plan details: name, price/month, storage, bandwidth, websites, free domain, SSL, email.
- Use `ask_user` (input_type "choice") to present plan options:
  - "Single — Rs X/mo — 1 website, 50GB SSD"
  - "Premium — Rs X/mo — 100 websites, 100GB SSD, free domain"
  - "Business — Rs X/mo — 100 websites, 200GB SSD, daily backups"
- Click "Add to Cart" for the selected plan.

### 5. Configure Billing Period
- Hostinger shows billing period options with different pricing.
- Take snapshot of billing period selection.
- Use `ask_user` (input_type "choice"): "Select billing period:" — "1 Month (Rs X/mo)", "12 Months (Rs X/mo)", "24 Months (Rs X/mo)", "48 Months (Rs X/mo)".
- Mention that longer periods have steeper discounts but higher upfront cost.
- Select the chosen billing period.

### 6. Domain Setup
- If plan includes free domain:
  - Use `ask_user` (input_type "freetext"): "Enter your desired domain name (e.g. mywebsite.com):"
  - Search for availability. If taken, present alternatives.
- If user has existing domain:
  - Select "I already have a domain" option.
  - Enter the existing domain name.
- If using free subdomain:
  - Select the free subdomain option.
  - Enter desired subdomain prefix.
- Take snapshot after domain configuration.

### 7. Review Order & Confirm
- Review the complete order on the checkout page.
- Take snapshot of order summary.
- Use `confirm_action` to present:
  - Hosting plan name and tier
  - Billing period and monthly rate
  - Domain name (new registration or existing)
  - Total upfront cost
  - Renewal price (mention it will be higher)
  - Free inclusions (SSL, email, domain)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with plan, billing period, domain, monthly price, total upfront cost, renewal price
  - amount_inr: total upfront amount (number)
  - description: "Hostinger web hosting purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Hostinger using available method (card, UPI, net banking, PayPal).
- Handle payment OTP via `ask_user` (input_type "otp") if needed.

### 9. Setup & Confirmation
- Take snapshot of the purchase confirmation page.
- Extract: order ID, hosting plan, domain, expiry date, hPanel access URL.
- Report full details to user:
  - hPanel dashboard URL
  - Domain name and DNS status
  - How to install WordPress (if WordPress hosting)
  - SSL certificate status
  - Email setup instructions
  - Nameserver details for DNS configuration
- If purchase failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Hostinger shows heavily discounted introductory prices — ALWAYS mention the renewal price which is significantly higher.
- 48-month plan has the lowest per-month cost but highest upfront payment — explain the tradeoff.
- Free domain is included only with Premium and Business plans (12+ months).
- Hostinger uses hPanel (not cPanel) — different interface from traditional hosts.
- Cookie consent and chat widgets appear on almost every page — dismiss immediately.
- Promotional countdown timers create false urgency — they reset. Do not rush the user.
- SSL is free and auto-configured on all plans.
- WordPress auto-installer is available in hPanel after purchase.
- DNS propagation takes 24-48 hours when using a new domain.
- Session in hPanel can expire after 30 minutes of inactivity.
- India pricing is shown in INR on hostinger.in — use this domain, not hostinger.com.
