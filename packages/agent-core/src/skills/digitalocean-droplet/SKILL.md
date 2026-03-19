---
name: digitalocean-droplet
description: Create and manage DigitalOcean Droplets — select region, size, OS image, configure networking, deploy cloud servers.
triggers:
  - digitalocean
  - create droplet
  - digitalocean droplet
  - digital ocean
  - deploy droplet
  - cloud server
  - vps server
  - digitalocean server
  - spin up droplet
  - do droplet
  - digitalocean vm
  - launch droplet
siteUrl: https://cloud.digitalocean.com
requiresAuth: true
params:
  - name: droplet_name
    required: true
    hint: Name for the droplet (e.g. "my-web-server", "api-backend")
  - name: os_image
    required: false
    hint: Operating system (e.g. "Ubuntu 24.04", "Debian 12", "CentOS Stream 9", default Ubuntu 24.04 LTS)
  - name: size
    required: false
    hint: Droplet size/plan (e.g. "basic-1gb", "2gb", "4gb", default Basic $6/mo)
  - name: region
    required: false
    hint: Datacenter region (e.g. "BLR1", "NYC1", "SFO3", default BLR1 Bangalore)
  - name: ssh_key
    required: false
    hint: SSH key name or whether to use password authentication
---

# DigitalOcean Droplet Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator DigitalOcean account.

## Steps

### 1. Gather Requirements
- Confirm you have: droplet name.
- If droplet name is missing, use `ask_user` (input_type "freetext"): "What would you like to name your droplet? (e.g. my-web-server)"
- Clarify purpose if helpful — web server, database, API backend — to recommend appropriate size.
- Default OS to Ubuntu 24.04 LTS if not specified.
- Default region to BLR1 (Bangalore) for lowest latency from India.
- Default plan to Basic $6/mo (1 vCPU, 1GB RAM, 25GB SSD) if not specified.

### 2. Open DigitalOcean in New Tab
- Open a NEW tab and navigate to `https://cloud.digitalocean.com`.
- Take a snapshot to see the dashboard.
- Dismiss any promotional banners, onboarding tours, or "Try App Platform" modals.
- Verify the DigitalOcean Cloud dashboard is loaded with project list visible.

### 3. Verify Login
- Look for the account avatar, team name, or email in the top-right header.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Log In", attempt login with operator Google account (rsinghtomar3011@gmail.com).
- If 2FA prompt appears, use `ask_user` (input_type "otp"): "Please enter the DigitalOcean 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Navigate to Create Droplet
- Click the green "Create" button in the top-right, then select "Droplets".
- Alternatively, navigate to `https://cloud.digitalocean.com/droplets/new`.
- Take snapshot of the droplet creation page.
- Verify all configuration sections are visible: Region, Image, Size, Authentication, etc.

### 5. Configure Droplet
- **Region**: Select the target datacenter region. Click the region tab.
  - Use `ask_user` (input_type "choice") if not specified: "BLR1 (Bangalore)", "NYC1 (New York)", "SFO3 (San Francisco)", "LON1 (London)", "SGP1 (Singapore)", "AMS3 (Amsterdam)".
- **Image**: Select the OS image. Click the appropriate distribution tab.
  - Use `ask_user` (input_type "choice") if user is unsure: "Ubuntu 24.04 LTS", "Debian 12", "CentOS Stream 9", "Fedora 40", "Rocky Linux 9".
- **Size**: Select the droplet plan.
  - Use `ask_user` (input_type "choice"): "Basic $6/mo (1 vCPU, 1GB, 25GB SSD)", "Basic $12/mo (1 vCPU, 2GB, 50GB SSD)", "Basic $24/mo (2 vCPU, 4GB, 80GB SSD)", "Basic $48/mo (4 vCPU, 8GB, 160GB SSD)".
- **Authentication**: Select SSH key or password.
  - If SSH keys exist on account, list them for user selection.
  - If no SSH keys, use password authentication and generate a root password.
- **Hostname**: Enter the droplet name.
- **Optional**: Enable backups ($1.20/mo), monitoring (free), IPv6 (free).
- Take snapshot of the complete configuration.

### 6. Review & Confirm
- Scroll to the bottom to see the full configuration summary and monthly cost.
- Take snapshot of the summary.
- Use `confirm_action` to present:
  - Droplet name, region, OS image
  - CPU, RAM, SSD size
  - Monthly cost and hourly cost
  - Authentication method
  - Additional features (backups, monitoring)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with droplet name, region, OS, size, monthly cost, hourly cost, features
  - amount_inr: first month cost in INR (number)
  - description: "DigitalOcean Droplet provisioning"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- DigitalOcean bills hourly — explain that the collected amount covers the first month estimate.

### 8. Create Droplet & Confirm
- Click "Create Droplet" button at the bottom.
- Wait for droplet provisioning (typically 30-60 seconds).
- Take snapshot of the droplet details page.
- Extract: droplet name, public IPv4 address, region, OS, size, status, monthly cost.
- Report full details to user:
  - IP address for SSH access
  - SSH command: `ssh root@<ip-address>`
  - Root password (if password auth chosen)
  - Console access URL
- If creation failed, report error (quota limit, payment issue) and suggest fixes.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- DigitalOcean uses hourly billing — explain that charges accrue per hour, not upfront monthly.
- BLR1 (Bangalore) is the closest region for Indian users — recommend by default.
- Basic plan at $6/mo (1GB RAM) is sufficient for most small projects — mention free tier alternatives if budget-conscious.
- SSH key authentication is more secure than password — recommend SSH keys when available.
- Droplet creation takes 30-60 seconds — wait for "Active" status before reporting IP.
- Backups cost 20% of droplet price — mention but let user decide.
- DigitalOcean has a referral credit system — check if account has credits before payment.
- Firewall rules must be configured separately after droplet creation — remind user about security.
- Session typically lasts several hours — but may expire if idle too long.
- "Create" button is green and in the top-right — do not confuse with project-level actions.
- Use `confirm_action` before creating the droplet. Do NOT auto-proceed with paid resources.
