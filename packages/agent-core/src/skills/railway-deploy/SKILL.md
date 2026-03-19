---
name: railway-deploy
description: Deploy backend application on Railway.app — connect GitHub repo, configure environment variables, provision database, deploy services.
triggers:
  - railway
  - railway deploy
  - deploy on railway
  - railway app
  - deploy backend
  - railway database
  - railway postgres
  - deploy api railway
  - railway hosting
  - railway project
  - deploy server railway
  - railway service
siteUrl: https://railway.app
requiresAuth: true
params:
  - name: repo_url
    required: true
    hint: GitHub repository URL (e.g. "https://github.com/user/my-api") or "new project"
  - name: service_type
    required: false
    hint: Service type (e.g. "web service", "worker", "cron job", default "web service")
  - name: database
    required: false
    hint: Database to provision (e.g. "PostgreSQL", "MySQL", "Redis", "MongoDB", or "none")
  - name: env_vars
    required: false
    hint: Environment variables needed (e.g. "DATABASE_URL, API_KEY, NODE_ENV")
---

# Railway.app Backend Deployment

Chrome profile: rsinghtomar3011@gmail.com. Operator Railway account.

## Steps

### 1. Gather Requirements
- Confirm you have: repository URL or project type.
- If repo URL is missing, use `ask_user` (input_type "choice"): "How would you like to start?" — "Deploy from GitHub repo", "Deploy a template (Rails, Django, Express)", "Start empty project".
- Clarify the tech stack: Node.js, Python, Go, Rust, Ruby, Docker — Railway auto-detects most.
- Ask if a database is needed: "Do you need a database?" — "PostgreSQL", "MySQL", "Redis", "MongoDB", "None".
- Ask about critical environment variables the app needs.
- Default service type to "web service" if not specified.

### 2. Open Railway in New Tab
- Open a NEW tab and navigate to `https://railway.app/dashboard`.
- Take a snapshot to see the dashboard.
- Dismiss any onboarding modals, changelog popups, or promotional banners.
- Verify the Railway dashboard is loaded with existing projects visible.

### 3. Verify Login
- Look for the account avatar, username, or team selector in the sidebar or header.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Login", then "Login with GitHub".
- Follow GitHub OAuth flow with operator account.
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the GitHub 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Create New Project
- Click "+ New Project" button.
- Select deployment method:
  - **GitHub repo**: Click "Deploy from GitHub repo" and search for/select the repository.
  - **Template**: Browse available templates and select one.
  - **Empty**: Click "Empty project" to start from scratch.
- If GitHub access is needed, authorize Railway GitHub app.
- Take snapshot after repository selection.

### 5. Configure Service
- Railway auto-detects the runtime and creates a service.
- Take snapshot of the project canvas showing the service.
- Click on the service to open its settings.
- Configure:
  - **Build settings**: Verify build command (auto-detected, e.g. "npm run build").
  - **Start command**: Verify start command (e.g. "npm start", "node dist/index.js").
  - **Root directory**: Set if monorepo (e.g. "apps/api").
  - **Watch paths**: Configure if only certain directories should trigger redeploys.
- Take snapshot of build/start configuration.

### 6. Add Database (if requested)
- Click "+ New" on the project canvas.
- Select the database: "PostgreSQL", "MySQL", "Redis", "MongoDB".
- Railway provisions the database instantly.
- Take snapshot showing the database service on the canvas.
- The DATABASE_URL variable is automatically available to linked services.
- Click on the database to see connection details.
- Extract: connection URL, host, port, database name, username.

### 7. Configure Environment Variables
- Click on the web service, then "Variables" tab.
- Railway auto-injects database URLs if a DB is provisioned.
- Add additional environment variables:
  - Use `ask_user` (input_type "freetext") for each required variable: "Please provide the value for {VAR_NAME}:"
  - Common vars: NODE_ENV=production, PORT (auto-set by Railway), API keys, secrets.
- Take snapshot of configured variables (names only, mask values).

### 8. Review & Confirm Deployment
- Review the complete project configuration.
- Use `confirm_action` to present:
  - Repository and branch
  - Service type (web service, worker)
  - Database (if any)
  - Environment variables (names only)
  - Estimated monthly cost (Railway usage-based pricing)
  - Free tier: $5 credit/month, 512MB RAM, shared CPU
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 9. Deploy & Monitor
- Click "Deploy" or deployment happens automatically after configuration.
- Monitor the build logs in real-time.
- Take snapshot of build progress.
- If build fails:
  - Extract error from build logs.
  - Report to user with suggested fixes.
  - Offer to update settings and redeploy.
- If build succeeds:
  - Generate a public domain: click "Settings" > "Networking" > "Generate Domain".
  - Extract the Railway URL (e.g. my-api-production.up.railway.app).
  - Take snapshot of the live service.

### 10. Deployment Confirmation
- Take final snapshot of the project overview.
- Extract: service URL, deploy status, build time, database connection string (if DB).
- Report full details to user:
  - Live service URL
  - Database connection details (if provisioned)
  - Custom domain setup instructions (if needed)
  - Auto-deploy status (pushes to main auto-deploy)
  - Resource usage and estimated monthly cost
  - How to view logs and redeploy
- Use `collect_payment` if costs exceed free tier:
  - summary: JSON with services, database, estimated monthly cost
  - amount_inr: estimated first month cost (number)
  - description: "Railway.app service deployment"
- If deployment failed, report error details and next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Railway gives $5 free credit per month — mention this to budget-conscious users.
- Usage-based pricing: pay only for what you use (RAM, CPU, network, disk).
- Railway auto-detects Dockerfile, nixpacks (Node, Python, Go, Rust, Ruby, Java) — usually zero config.
- Database provisioning is instant — no waiting for setup.
- DATABASE_URL is auto-injected when database and service are in the same project.
- PORT environment variable is auto-set by Railway — app must listen on $PORT (not hardcoded 3000).
- Railway supports monorepos — set root directory to the specific app folder.
- Public domains must be explicitly generated — services are private by default.
- Build logs and runtime logs are separate — check both for debugging.
- Railway session via GitHub OAuth typically lasts a long time.
- Custom domains require CNAME record pointing to the Railway-generated domain.
