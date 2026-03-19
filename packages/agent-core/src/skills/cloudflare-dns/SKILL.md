---
name: cloudflare-dns
description: Manage domains and DNS on Cloudflare — add sites, configure DNS records, enable SSL/TLS, set up page rules and security.
triggers:
  - cloudflare
  - cloudflare dns
  - add site cloudflare
  - dns records
  - configure dns
  - cloudflare ssl
  - cloudflare domain
  - manage dns
  - dns setup
  - cloudflare cdn
  - add dns record
  - cloudflare security
siteUrl: https://dash.cloudflare.com
requiresAuth: true
params:
  - name: domain
    required: true
    hint: Domain name to manage (e.g. "mywebsite.com")
  - name: action
    required: true
    hint: Action to perform (e.g. "add site", "add DNS record", "enable SSL", "configure page rules")
  - name: record_type
    required: false
    hint: DNS record type (e.g. "A", "AAAA", "CNAME", "MX", "TXT")
  - name: record_value
    required: false
    hint: DNS record value (e.g. IP address, hostname, TXT content)
---

# Cloudflare DNS Management

Chrome profile: rsinghtomar3011@gmail.com. Operator Cloudflare account.

## Steps

### 1. Gather Requirements
- Confirm you have: domain name and desired action.
- If domain is missing, use `ask_user` (input_type "freetext"): "What domain would you like to manage on Cloudflare? (e.g. mywebsite.com)"
- If action is unclear, use `ask_user` (input_type "choice"): "What would you like to do?" — "Add new site to Cloudflare", "Add/Edit DNS records", "Configure SSL/TLS", "Set up page rules", "Check analytics", "Configure security settings".
- For DNS record operations, gather: record type, name/subdomain, value, TTL, proxy status.
- For adding a new site, confirm the domain is already registered with a registrar.

### 2. Open Cloudflare Dashboard in New Tab
- Open a NEW tab and navigate to `https://dash.cloudflare.com`.
- Take a snapshot to see the dashboard.
- Dismiss any promotional banners, onboarding tours, or feature announcement modals.
- Verify the Cloudflare dashboard is loaded with the account overview or site list.

### 3. Verify Login
- Look for the account email, avatar, or account selector in the top-right.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Log in", attempt login with operator Google account (rsinghtomar3011@gmail.com).
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the Cloudflare 2FA code from your authenticator app."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Navigate to Domain
- **If adding new site**:
  - Click "+ Add a site" button on the dashboard.
  - Enter the domain name and click "Continue".
  - Select plan: use `ask_user` (input_type "choice") — "Free (SSL, CDN, DDoS protection)", "Pro ($20/mo — WAF, image optimization)", "Business ($200/mo — custom SSL, SLA)".
  - Cloudflare will scan existing DNS records. Wait for scan to complete.
  - Take snapshot of discovered DNS records.
- **If managing existing site**:
  - Click on the domain from the site list on the dashboard.
  - If domain is not listed, it needs to be added first.
  - Take snapshot of the domain overview page.

### 5. Execute DNS Action
- **Add DNS Record**:
  - Click "DNS" in the left sidebar, then "Records" tab.
  - Click "+ Add record".
  - Select record type from dropdown (A, AAAA, CNAME, MX, TXT, etc.).
  - Fill: Name (subdomain or @), Content (IP/hostname/value), TTL (Auto), Proxy status (orange cloud on/off).
  - Use `ask_user` for missing record details.
  - Take snapshot before saving.
- **Edit DNS Record**:
  - Locate the existing record in the DNS records table.
  - Click "Edit" on the record row.
  - Update the value as requested.
- **Delete DNS Record**:
  - Use `confirm_action` before deleting: "Delete DNS record: TYPE NAME -> VALUE?"
  - Click "Delete" on the record row.
- **Configure SSL/TLS**:
  - Click "SSL/TLS" in the sidebar.
  - Use `ask_user` (input_type "choice"): "SSL mode:" — "Flexible (HTTP to origin)", "Full (self-signed cert OK)", "Full (strict) (valid cert required)", "Off".
  - Recommend "Full (strict)" for production sites.
  - Enable "Always Use HTTPS" and "Automatic HTTPS Rewrites".
- **Page Rules**:
  - Click "Rules" > "Page Rules".
  - Click "Create Page Rule". Enter URL pattern and configure rule settings.

### 6. Review Changes & Confirm
- Take snapshot of the pending changes or new configuration.
- Use `confirm_action` to present:
  - Domain name
  - Action performed (record added/edited, SSL configured, etc.)
  - Record details (type, name, value, proxy status)
  - Impact explanation (e.g. "This will point yourdomain.com to IP X.X.X.X")
- Do NOT save/apply unless user confirms. If cancelled, discard changes.

### 7. Apply & Verify
- Click "Save" to apply the DNS record or configuration change.
- Take snapshot of the updated records list or settings page.
- For new sites: extract the Cloudflare nameservers (e.g. anna.ns.cloudflare.com, bob.ns.cloudflare.com).
- Report to user:
  - What was configured
  - Nameservers to set at registrar (for new sites)
  - Propagation time estimate (usually minutes for Cloudflare, 24-48 hrs for NS changes)
  - Proxy status (orange cloud = proxied through Cloudflare CDN, grey = DNS only)

### 8. Nameserver Update Guidance (New Sites)
- If this is a new site addition, provide nameserver update instructions:
  - "Update your domain's nameservers at your registrar to:"
  - List both Cloudflare nameservers.
  - Explain that DNS propagation can take up to 48 hours.
  - Cloudflare will send an email when the site is active.
- Use `ask_user`: "Would you like me to help update nameservers at your domain registrar?"
- Take final snapshot confirming the setup status.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Cloudflare Free plan includes SSL, CDN, DDoS protection, and DNS management — sufficient for most sites.
- Orange cloud icon = traffic proxied through Cloudflare (CDN + security). Grey cloud = DNS only (direct to origin).
- A records for root domain (@) should typically be proxied (orange cloud). MX records CANNOT be proxied.
- CNAME flattening is automatic on Cloudflare — CNAME at root domain works (unlike other DNS providers).
- SSL modes: "Flexible" works without origin cert but is less secure. "Full (strict)" is recommended for production.
- DNS changes on Cloudflare propagate within seconds (for already-active domains). NS changes take 24-48 hours.
- Cloudflare session lasts several hours but may require re-auth for sensitive operations.
- Always verify the correct domain is selected before making changes — dashboard shows all domains in the account.
- TXT records for domain verification (Google, SPF, DKIM) must NOT be proxied (grey cloud only).
- Free plan allows 3 page rules — use them wisely for redirects and caching.
- When adding MX records, priority matters — lower number = higher priority.
