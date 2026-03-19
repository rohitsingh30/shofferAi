---
name: supabase-setup
description: Set up a Supabase project — create database, configure authentication, storage buckets, API keys, Row Level Security.
triggers:
  - supabase
  - supabase setup
  - supabase project
  - supabase database
  - supabase auth
  - setup supabase
  - supabase storage
  - create supabase
  - supabase api
  - supabase postgres
  - backend supabase
  - supabase rls
siteUrl: https://supabase.com/dashboard
requiresAuth: true
params:
  - name: project_name
    required: true
    hint: Name for the Supabase project (e.g. "my-app-backend")
  - name: region
    required: false
    hint: Database region (e.g. "ap-south-1 Mumbai", "us-east-1", default ap-south-1)
  - name: features
    required: false
    hint: Features to configure (e.g. "database + auth", "storage", "edge functions", "realtime")
  - name: db_password
    required: false
    hint: Database password (auto-generated if not specified)
---

# Supabase Project Setup

Chrome profile: rsinghtomar3011@gmail.com. Operator Supabase account.

## Steps

### 1. Gather Requirements
- Confirm you have: project name.
- If project name is missing, use `ask_user` (input_type "freetext"): "What would you like to name your Supabase project? (e.g. my-app-backend)"
- Ask what features are needed:
  - Use `ask_user` (input_type "choice", multi-select): "Which features do you need?" — "Database (PostgreSQL)", "Authentication (email, OAuth, phone)", "Storage (file uploads)", "Edge Functions (serverless)", "Realtime (subscriptions)".
- Default region to ap-south-1 (Mumbai) for Indian users.
- Clarify the app type to recommend appropriate auth providers and database schema.
- Ask about expected scale to recommend Free vs Pro plan.

### 2. Open Supabase Dashboard in New Tab
- Open a NEW tab and navigate to `https://supabase.com/dashboard`.
- Take a snapshot to see the dashboard.
- Dismiss any promotional banners, feature announcements, or onboarding tours.
- Verify the Supabase dashboard is loaded with the organization/project list.

### 3. Verify Login
- Look for the account avatar, organization name, or email in the sidebar.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Sign In", then "Continue with GitHub" or "Continue with Google".
- Follow OAuth flow with operator account (rsinghtomar3011@gmail.com).
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Create New Project
- Click "+ New Project" button on the dashboard.
- Select the organization (or create one if needed).
- Fill in project details:
  - **Project name**: Enter the provided project name.
  - **Database password**: Generate a strong password or use user-provided one. Save it securely.
  - **Region**: Select target region. Use `ask_user` (input_type "choice") if not specified:
    - "South Asia (Mumbai)", "Southeast Asia (Singapore)", "US East (N. Virginia)", "US West (Oregon)", "Europe (Frankfurt)", "Europe (London)".
  - **Plan**: Use `ask_user` (input_type "choice"):
    - "Free (500MB database, 1GB storage, 50K auth users)"
    - "Pro $25/mo (8GB database, 100GB storage, unlimited auth users)"
- Take snapshot of the project creation form.

### 5. Configure Authentication
- After project is created (takes 1-2 minutes), navigate to "Authentication" in sidebar.
- Take snapshot of the Auth settings page.
- Configure auth providers based on user needs:
  - **Email/Password**: Enabled by default. Configure email templates if needed.
  - **Google OAuth**: Go to Providers > Google > Enable. Need Client ID and Secret.
    - Use `ask_user` (input_type "freetext"): "Provide Google OAuth Client ID (or skip for later):"
  - **GitHub OAuth**: Enable if needed, requires GitHub OAuth App credentials.
  - **Phone/OTP**: Enable if needed, requires Twilio credentials.
- Configure auth settings: site URL, redirect URLs, JWT expiry.
- Use `ask_user` for site URL: "What is your app's URL? (e.g. http://localhost:3000 for dev)"

### 6. Set Up Database Tables
- Navigate to "Table Editor" in the sidebar.
- Ask user about their data model:
  - Use `ask_user` (input_type "freetext"): "Describe the tables you need (e.g. 'users table with name, email; posts table with title, content, user_id')"
- Create tables via the Table Editor UI:
  - Click "+ New Table".
  - Add columns with types (text, int4, uuid, timestamp, boolean, jsonb).
  - Set primary keys, foreign keys, default values.
  - Enable Row Level Security (RLS) on each table.
- Alternatively, use the SQL Editor for complex schemas:
  - Navigate to "SQL Editor" and run CREATE TABLE statements.
- Take snapshot of created tables.

### 7. Configure Storage (if requested)
- Navigate to "Storage" in the sidebar.
- Click "New Bucket" to create a storage bucket.
- Use `ask_user` (input_type "freetext"): "What would you like to name the storage bucket? (e.g. avatars, documents, images)"
- Configure bucket settings:
  - Public or private access.
  - File size limit.
  - Allowed MIME types.
- Set up storage policies for access control.
- Take snapshot of storage configuration.

### 8. Review API Keys & Configuration
- Navigate to "Settings" > "API" in the sidebar.
- Take snapshot of the API settings page.
- Extract key information:
  - Project URL (e.g. https://abcdef.supabase.co)
  - anon/public API key
  - service_role key (keep secret)
  - Database connection string (direct and pooled)
  - JWT secret
- Use `confirm_action` to present project summary:
  - Project name and region
  - Database password (mention it was saved)
  - Auth providers configured
  - Tables created
  - Storage buckets created
  - API URL and keys (anon key only, not service_role)
  - Plan and cost

### 9. Project Confirmation & Next Steps
- Take final snapshot of the project dashboard overview.
- Report full details to user:
  - Supabase project URL
  - API keys (anon key — safe for client; service_role — server only)
  - Database connection strings (direct + pooled via Supavisor)
  - Auth configuration summary
  - Storage buckets and policies
  - Client library installation: `npm install @supabase/supabase-js`
  - Quick start code snippet for connecting
- Use `collect_payment` if Pro plan selected:
  - summary: JSON with project name, plan, region, features enabled
  - amount_inr: monthly cost in INR (number)
  - description: "Supabase Pro plan subscription"
- If setup failed at any point, report error and suggest fixes.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Supabase Free tier: 2 projects, 500MB database, 1GB storage, 50K monthly active users — generous for development.
- Project creation takes 1-2 minutes — wait for the dashboard to fully load before configuring.
- ap-south-1 (Mumbai) is the recommended region for Indian users — lowest latency.
- Row Level Security (RLS) is critical — ALWAYS enable on tables that store user data.
- The anon key is safe for client-side code. The service_role key must NEVER be exposed in frontend.
- Database password is shown only once during project creation — save it immediately.
- Supabase uses connection pooling via Supavisor — use the pooled connection string for serverless.
- Edge Functions are Deno-based — different from Node.js serverless functions.
- Realtime subscriptions require RLS policies or service_role key — configure carefully.
- Supabase session via GitHub/Google OAuth lasts several hours — may need re-login for long sessions.
- Database migrations can be managed via Supabase CLI (`supabase migration`) — mention for production workflows.
