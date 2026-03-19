---
name: render-deploy
description: Deploy web services on Render — static sites, APIs, background workers, PostgreSQL databases, cron jobs.
triggers:
  - render
  - render deploy
  - deploy on render
  - render.com
  - render hosting
  - deploy api render
  - render static site
  - render web service
  - render database
  - render postgres
  - deploy backend render
  - host on render
siteUrl: https://dashboard.render.com
requiresAuth: true
params:
  - name: repo_url
    required: true
    hint: GitHub/GitLab repository URL (e.g. "https://github.com/user/my-app")
  - name: service_type
    required: true
    hint: Service type (e.g. "web service", "static site", "background worker", "cron job")
  - name: runtime
    required: false
    hint: Runtime environment (e.g. "Node", "Python", "Go", "Rust", "Docker", auto-detected)
  - name: database
    required: false
    hint: Database to provision (e.g. "PostgreSQL" or "none")
  - name: plan
    required: false
    hint: Instance plan (e.g. "Free", "Starter $7/mo", "Standard $25/mo", default Free)
---

# Render Web Service Deployment

Chrome profile: rsinghtomar3011@gmail.com. Operator Render account.

## Steps

### 1. Gather Requirements
- Confirm you have: repository URL and service type.
- If repo URL is missing, use `ask_user` (input_type "freetext"): "What is the GitHub repository URL for your project?"
- If service type is unclear, use `ask_user` (input_type "choice"): "What type of service?" — "Web Service (API/backend)", "Static Site (React, Vue, HTML)", "Background Worker", "Cron Job", "PostgreSQL Database".
- Clarify tech stack for build configuration: Node.js, Python, Go, Rust, Docker.
- Ask about database needs: "Do you need a PostgreSQL database?"
- Default plan to Free tier if not specified.
- Ask about environment variables the app requires.

### 2. Open Render Dashboard in New Tab
- Open a NEW tab and navigate to `https://dashboard.render.com`.
- Take a snapshot to see the dashboard.
- Dismiss any promotional banners, changelog notifications, or onboarding tooltips.
- Verify the Render dashboard is loaded with the services list.

### 3. Verify Login
- Look for the account avatar, email, or team name in the sidebar.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Sign In", then "GitHub" or "Google" login.
- Follow OAuth flow with operator account (rsinghtomar3011@gmail.com).
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Create New Service
- Click "+ New" button in the top navigation.
- Select the service type from the dropdown:
  - "Web Service" for APIs and backends
  - "Static Site" for frontend apps
  - "Background Worker" for queue processors
  - "Cron Job" for scheduled tasks
  - "PostgreSQL" for database
- Connect to GitHub: search for and select the repository.
- If repo is not listed, click "Configure account" to grant Render access to the repo.
- Take snapshot after repository selection.

### 5. Configure Service Settings
- Render shows the configuration form after repo selection.
- Fill in:
  - **Name**: Service name (auto-generated from repo, can customize).
  - **Region**: Use `ask_user` (input_type "choice") if not specified: "Oregon (US West)", "Ohio (US East)", "Frankfurt (EU)", "Singapore (Asia)".
  - **Branch**: main (or specified branch).
  - **Root Directory**: Set if monorepo.
  - **Runtime**: Auto-detected (Node, Python, Go, Rust, Docker).
  - **Build Command**: Auto-detected (e.g. "npm install && npm run build").
  - **Start Command**: e.g. "npm start", "node dist/index.js", "gunicorn app:app".
- **Instance Type**: Use `ask_user` (input_type "choice"):
  - "Free (512MB RAM, shared CPU, spins down after inactivity)"
  - "Starter $7/mo (512MB RAM, shared CPU, always on)"
  - "Standard $25/mo (2GB RAM, dedicated CPU)"
  - "Pro $85/mo (4GB RAM, dedicated CPU)"
- Take snapshot of the complete configuration.

### 6. Add Database (if requested)
- If PostgreSQL is needed:
  - Click "+ New" > "PostgreSQL".
  - Configure: name, region (same as web service), plan.
  - Database plans: "Free (256MB, 1GB storage, expires in 90 days)", "Starter $7/mo", "Standard $20/mo".
  - Use `ask_user` (input_type "choice") for database plan selection.
  - After creation, copy the Internal Database URL.
  - Add DATABASE_URL environment variable to the web service.
- Take snapshot of database details.

### 7. Configure Environment Variables
- In the service configuration, scroll to "Environment Variables" section.
- Click "Add Environment Variable" for each required variable.
- Auto-link database URL if PostgreSQL was provisioned in the same account.
- Use `ask_user` (input_type "freetext") for each secret: "Please provide the value for {VAR_NAME}:"
- Common variables: NODE_ENV=production, DATABASE_URL, API keys, JWT secrets.
- Take snapshot of environment variables (names visible, values masked).

### 8. Review & Confirm Deployment
- Review all service settings.
- Use `confirm_action` to present:
  - Service name and type
  - Repository and branch
  - Runtime and build/start commands
  - Instance plan and estimated monthly cost
  - Database (if provisioned) and its plan
  - Environment variables (names only)
  - Region
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 9. Deploy & Monitor
- Click "Create Web Service" (or equivalent button).
- Render starts building and deploying automatically.
- Monitor build logs in real-time on the deploy page.
- Take snapshot of build progress.
- If build fails:
  - Extract error from build logs.
  - Report to user with diagnosis and fix suggestions.
  - Offer to update build settings and trigger manual redeploy.
- If build succeeds:
  - Render auto-generates a URL (e.g. my-app.onrender.com).
  - Take snapshot of the live service dashboard.

### 10. Deployment Confirmation
- Take final snapshot of the service overview.
- Extract: service URL, deploy status, build duration, instance type, region.
- Report full details to user:
  - Live service URL (https://my-app.onrender.com)
  - Database connection string (if provisioned)
  - Custom domain setup: Settings > Custom Domains > add CNAME
  - Auto-deploy: enabled by default (pushes to branch trigger deploy)
  - Health check URL (if web service)
  - How to view logs, restart, and redeploy
- Use `collect_payment` if using paid plans:
  - summary: JSON with service type, plan, database plan, estimated monthly cost
  - amount_inr: monthly cost in INR (number)
  - description: "Render service deployment"
- If deployment failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Render Free tier web services spin down after 15 minutes of inactivity — cold starts take 30-60 seconds. Warn users about this.
- Free PostgreSQL databases expire after 90 days — data is deleted. Use Starter ($7/mo) for persistent data.
- Render auto-detects Node.js, Python, Go, Rust, Ruby, and Docker — usually zero build config needed.
- Singapore region is closest for Indian users — recommend for lowest latency.
- Build cache is enabled by default — subsequent deploys are faster.
- Render supports Blueprints (render.yaml) for infrastructure-as-code — mention for complex setups.
- Internal networking between services in the same account is free and private.
- Custom domains require CNAME record pointing to the .onrender.com URL. HTTPS is automatic.
- Session via GitHub/Google OAuth lasts a long time — rarely expires.
- Health checks are configured in service settings — Render restarts unhealthy services automatically.
- Logs are available in real-time via the dashboard — useful for debugging.
