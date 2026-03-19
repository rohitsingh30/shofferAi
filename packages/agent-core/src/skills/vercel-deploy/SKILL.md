---
name: vercel-deploy
description: Deploy a website on Vercel — import from GitHub, configure build settings, set environment variables, deploy to production.
triggers:
  - vercel
  - deploy on vercel
  - deploy website
  - vercel deploy
  - deploy to vercel
  - host website
  - deploy frontend
  - vercel hosting
siteUrl: https://vercel.com
requiresAuth: true
params:
  - name: github_repo
    required: true
    hint: GitHub repository URL or name (e.g. "username/repo-name")
  - name: framework
    required: false
    hint: Framework preset (e.g. "Next.js", "React", "Vue", "Svelte", "Other")
  - name: env_vars
    required: false
    hint: Environment variables to set (key=value pairs)
  - name: domain
    required: false
    hint: Custom domain to connect (e.g. "mysite.com")
---

# Vercel Website Deployment

Chrome profile: rsinghtomar3011@gmail.com. Operator Vercel account.

## Steps

### 1. Gather Requirements
- Confirm you have: GitHub repository URL or name.
- If repo is missing, use `ask_user` (input_type "freetext"): "What's the GitHub repository URL or name to deploy? (e.g. username/my-project)"
- Ask about framework if not obvious from repo name.
- Ask about environment variables if the project likely needs them (e.g. API keys, database URLs).
- Ask about custom domain if not specified.

### 2. Open Vercel in New Tab
- Open a NEW tab and navigate to `https://vercel.com`.
- Take a snapshot to see the landing page or dashboard.
- Dismiss any onboarding modals, upgrade prompts, or notification banners.
- Verify the Vercel dashboard is visible.

### 3. Verify Login
- Look for the user avatar, team name, or dashboard navigation in the header.
- If signed in: proceed to project import.
- If NOT signed in: Click "Log In", then "Continue with GitHub" or "Continue with Google" using rsinghtomar3011@gmail.com.
- If GitHub OAuth consent appears, authorize Vercel.
- If 2FA/CAPTCHA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Import GitHub Repository
- Click "Add New..." > "Project" or navigate to `https://vercel.com/new`.
- Take snapshot of the import page.
- If GitHub is not connected: click "Connect GitHub" and authorize.
- Search for the repository name in the import list.
- If repo not visible: click "Adjust GitHub App Permissions" to grant access.
- Click "Import" next to the target repository.
- Take snapshot of the import configuration page.

### 5. Configure Build Settings
- Verify Vercel auto-detected the framework (Next.js, React, Vue, etc.).
- If framework detection is wrong, use `ask_user` (input_type "choice") to select: "Next.js", "Create React App", "Vite", "Nuxt", "SvelteKit", "Astro", "Other".
- Review build settings:
  - **Build Command**: verify or customize (e.g. `npm run build`, `next build`).
  - **Output Directory**: verify (e.g. `.next`, `dist`, `build`, `out`).
  - **Install Command**: verify (e.g. `npm install`, `yarn install`).
  - **Root Directory**: set if monorepo (e.g. `apps/web`).
- Take snapshot of build configuration.

### 6. Set Environment Variables
- If user provided env vars or the project needs them:
  - Expand "Environment Variables" section.
  - For each variable: enter key and value, select environments (Production, Preview, Development).
  - Use `ask_user` (input_type "freetext") for each required env var the user hasn't provided.
- If no env vars needed, skip this step.
- Take snapshot showing configured environment variables.

### 7. Review & Deploy
- Use `confirm_action` to present deployment configuration:
  - Repository name and branch
  - Framework detected
  - Build command and output directory
  - Environment variables set (keys only, not values)
  - Root directory (if set)
  - Deployment URL preview (*.vercel.app)
- Do NOT proceed unless user confirms. If changes needed, modify settings.
- Click "Deploy" button.
- Wait for the deployment to start building.
- Take snapshot of the build progress page.

### 8. Monitor Deployment
- Watch the build logs for errors.
- If build fails:
  - Take snapshot of the error logs.
  - Report the error to user with relevant log lines.
  - Use `ask_user` to get guidance on fixing (missing env vars, wrong build command, etc.).
  - Click "Redeploy" after fixes.
- If build succeeds: wait for deployment to complete.
- Take snapshot of the successful deployment page.

### 9. Configure Custom Domain (Optional)
- If user requested a custom domain:
  - Navigate to project Settings > Domains.
  - Enter the custom domain and click "Add".
  - Take snapshot of DNS configuration instructions.
  - Report required DNS records (A record, CNAME) to user.
  - Use `ask_user` (input_type "freetext"): "DNS records have been provided. Type 'done' when you've updated your DNS settings."
- Verify domain connection status.

### 10. Final Confirmation
- Take snapshot of the deployed project dashboard.
- Report full details to user:
  - Deployment URL (*.vercel.app)
  - Custom domain (if configured)
  - Build status and duration
  - Framework and settings used
  - Vercel dashboard link for management
  - Git integration status (auto-deploys on push)
- Mention that future pushes to the main branch will auto-deploy.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Vercel. Do NOT ask user for credentials.
- Vercel Hobby plan: free, supports custom domains, HTTPS, serverless functions, edge functions.
- Vercel auto-detects framework from package.json — usually correct for popular frameworks.
- GitHub integration enables auto-deploy on push and preview deployments for PRs.
- Environment variables are encrypted and scoped to environments (Production, Preview, Development).
- Build timeout is 45 minutes on Hobby plan.
- Serverless function timeout: 10s (Hobby), 60s (Pro).
- Custom domains need DNS configuration — provide A and CNAME records to user.
- Vercel provides free SSL certificates for all domains.
- Use `confirm_action` for deployment review. No Razorpay payment needed for Vercel Hobby.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator GitHub/Google account. Do NOT ask user for credentials.
