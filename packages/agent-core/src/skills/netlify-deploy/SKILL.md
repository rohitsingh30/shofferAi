---
name: netlify-deploy
description: Deploy website on Netlify — import from GitHub, configure build settings, set up custom domain, enable HTTPS.
triggers:
  - netlify
  - deploy netlify
  - netlify deploy
  - deploy website
  - netlify site
  - host on netlify
  - static site deploy
  - netlify github
  - deploy frontend
  - netlify custom domain
  - deploy to netlify
  - netlify hosting
siteUrl: https://app.netlify.com
requiresAuth: true
params:
  - name: repo_url
    required: true
    hint: GitHub repository URL (e.g. "https://github.com/user/my-site") or "drag and drop"
  - name: build_command
    required: false
    hint: Build command (e.g. "npm run build", "next build", auto-detected if not specified)
  - name: publish_dir
    required: false
    hint: Publish directory (e.g. "dist", "build", "out", ".next", auto-detected if not specified)
  - name: custom_domain
    required: false
    hint: Custom domain to configure (e.g. "mysite.com")
  - name: branch
    required: false
    hint: Git branch to deploy from (default "main")
---

# Netlify Website Deployment

Chrome profile: rsinghtomar3011@gmail.com. Operator Netlify account.

## Steps

### 1. Gather Requirements
- Confirm you have: repository URL or deployment method.
- If repo URL is missing, use `ask_user` (input_type "choice"): "How would you like to deploy?" — "Import from GitHub", "Import from GitLab", "Import from Bitbucket", "Drag and drop files".
- If importing from GitHub, get the repository URL.
- Ask about framework if not obvious from repo: Next.js, React (CRA), Vue, Gatsby, Hugo, plain HTML.
- Build command and publish directory will be auto-detected for known frameworks.
- Default branch to "main" if not specified.
- Ask about custom domain if not mentioned.

### 2. Open Netlify in New Tab
- Open a NEW tab and navigate to `https://app.netlify.com`.
- Take a snapshot to see the dashboard.
- Dismiss any promotional banners, "Try Netlify Functions" modals, or onboarding tooltips.
- Verify the Netlify team dashboard is loaded with the sites list.

### 3. Verify Login
- Look for the team name, avatar, or account email in the top navigation.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Log in", then "Log in with GitHub" (or appropriate provider).
- Follow OAuth flow with operator GitHub account (rsinghtomar3011@gmail.com).
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the GitHub 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Start New Site Deployment
- Click "Add new site" dropdown, then "Import an existing project".
- Select Git provider: "Deploy with GitHub" (most common).
- If GitHub OAuth permission is needed, authorize Netlify to access repositories.
- Take snapshot of the repository selection page.
- Search for or browse to the target repository.
- If repository is not listed, click "Configure the Netlify app on GitHub" to grant access.
- Select the repository.

### 5. Configure Build Settings
- Take snapshot of the build configuration page.
- Netlify auto-detects framework and suggests build settings.
- Verify or set:
  - **Branch to deploy**: main (or specified branch)
  - **Build command**: e.g. "npm run build", "next build" (auto-detected for known frameworks)
  - **Publish directory**: e.g. "dist", "build", ".next" (auto-detected)
- If auto-detection fails, use `ask_user` (input_type "freetext"): "What is the build command for your project?"
- Configure environment variables if needed:
  - Click "Advanced" > "New variable"
  - Use `ask_user` for each environment variable key-value pair.
- Take snapshot of final build configuration.

### 6. Review & Confirm Deployment
- Review all build settings before deploying.
- Use `confirm_action` to present:
  - Repository name and branch
  - Build command and publish directory
  - Environment variables (names only, not values)
  - Netlify subdomain (auto-generated)
  - Estimated build time
  - Plan (Free tier: 100GB bandwidth, 300 build minutes/month)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Deploy Site
- Click "Deploy site" (or "Deploy <site-name>") button.
- Wait for the build to start. Take snapshot of the deploy log.
- Monitor build progress — Netlify shows real-time logs.
- If build fails:
  - Extract error message from build log.
  - Report error to user with suggested fixes.
  - Offer to update build settings and retry.
- If build succeeds:
  - Extract the Netlify URL (e.g. amazing-jones-12345.netlify.app).
  - Take snapshot of the deployed site.

### 8. Custom Domain Setup (if requested)
- If user wants a custom domain:
  - Go to Site Settings > Domain management > "Add custom domain".
  - Enter the custom domain name.
  - Netlify will check DNS and provide instructions.
  - Use `ask_user` (input_type "choice"): "DNS configuration:" — "Use Netlify DNS (recommended)", "Add CNAME record at your current DNS provider".
  - If using Netlify DNS: provide nameserver records to set at registrar.
  - If using external DNS: provide CNAME record value (e.g. amazing-jones-12345.netlify.app).
  - HTTPS is automatically provisioned via Let's Encrypt after DNS is configured.

### 9. Deployment Confirmation
- Take final snapshot of the site overview page.
- Extract: site URL, deploy status, build time, last deploy date.
- Report full details to user:
  - Live site URL (Netlify subdomain)
  - Custom domain status (if configured)
  - HTTPS status
  - Auto-deploy status (pushes to branch will auto-deploy)
  - Build minutes used
  - How to trigger manual redeploy
- If deployment failed at any point, report error details and next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Netlify Free tier is generous: 100GB bandwidth, 300 build minutes/month, 1 concurrent build — sufficient for most sites.
- GitHub OAuth is required for repository import — Netlify app must be installed on the GitHub account/org.
- Build settings are auto-detected for: Next.js, Gatsby, React CRA, Vue CLI, Hugo, Jekyll, Astro.
- Next.js sites use @netlify/plugin-nextjs — usually auto-configured.
- Environment variables set in Netlify UI override .env files — useful for secrets.
- Deploy previews are created for every pull request — great for review.
- Netlify Functions (serverless) are available in the "netlify/functions" directory — mention if user has API needs.
- HTTPS is free and automatic via Let's Encrypt — no configuration needed after DNS.
- Build cache persists between deploys — subsequent builds are faster.
- Site name can be changed in Site Settings > General > Site name (affects the .netlify.app subdomain).
- Rollback to any previous deploy is instant via the Deploys tab.
