---
name: firebase-setup
description: Set up a Firebase project — configure Authentication, Firestore database, Cloud Storage, Hosting, and Cloud Functions.
triggers:
  - firebase
  - firebase setup
  - firebase project
  - firebase auth
  - firestore
  - firebase hosting
  - firebase functions
  - setup firebase
  - firebase database
  - firebase storage
  - create firebase project
  - google firebase
siteUrl: https://console.firebase.google.com
requiresAuth: true
params:
  - name: project_name
    required: true
    hint: Name for the Firebase project (e.g. "my-app-prod")
  - name: features
    required: false
    hint: Features to enable (e.g. "auth + firestore", "hosting", "functions", "storage")
  - name: plan
    required: false
    hint: Billing plan (e.g. "Spark (free)", "Blaze (pay-as-you-go)", default Spark)
  - name: auth_providers
    required: false
    hint: Auth providers to enable (e.g. "email, google, phone", default "email + google")
---

# Firebase Project Setup

Chrome profile: rsinghtomar3011@gmail.com. Operator Google account linked to Firebase.

## Steps

### 1. Gather Requirements
- Confirm you have: project name.
- If project name is missing, use `ask_user` (input_type "freetext"): "What would you like to name your Firebase project? (e.g. my-app-prod)"
- Ask what features are needed:
  - Use `ask_user` (input_type "choice", multi-select): "Which Firebase features do you need?" — "Authentication", "Firestore (NoSQL database)", "Realtime Database", "Cloud Storage (file uploads)", "Hosting (static site)", "Cloud Functions (serverless backend)".
- Ask about billing plan if Cloud Functions are needed (requires Blaze plan).
- Clarify target platforms: Web, iOS, Android, or all.
- Default auth providers to Email/Password + Google Sign-In if not specified.

### 2. Open Firebase Console in New Tab
- Open a NEW tab and navigate to `https://console.firebase.google.com`.
- Take a snapshot to see the Firebase console.
- Dismiss any promotional banners, "What's New" popups, or Gemini AI suggestions.
- Verify the Firebase console is loaded with the projects list.

### 3. Verify Login
- Look for the Google account avatar and email in the top-right corner.
- If signed in: verify it is the correct Google account (rsinghtomar3011@gmail.com).
- If NOT signed in: Click "Sign in" and select the operator Google account.
- If account chooser appears, select rsinghtomar3011@gmail.com.
- If 2FA appears, use `ask_user` (input_type "otp"): "Please enter the Google 2FA code."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state with correct account.

### 4. Create New Project
- Click "Add project" (or "Create a project") on the Firebase console.
- **Step 1 — Project name**: Enter the provided project name. Firebase auto-generates a project ID.
  - Note the project ID (e.g. my-app-prod-abc12). It cannot be changed later.
- **Step 2 — Google Analytics**: Use `ask_user` (input_type "choice"): "Enable Google Analytics for this project?" — "Yes (recommended for production)", "No (skip for now)".
  - If yes, select or create a Google Analytics account.
- **Step 3 — Confirm**: Click "Create project".
- Wait for project creation (30-60 seconds). Take snapshot of the "Your new project is ready" screen.
- Click "Continue" to enter the project dashboard.

### 5. Configure Authentication
- Click "Authentication" in the left sidebar, then "Get started".
- Take snapshot of the Auth providers page.
- Enable auth providers:
  - **Email/Password**: Click "Email/Password" > Enable > Save. Enable "Email link" if passwordless needed.
  - **Google**: Click "Google" > Enable > Select support email (rsinghtomar3011@gmail.com) > Save.
  - **Phone**: Click "Phone" > Enable > Save. Note: requires Blaze plan for production SMS.
  - **GitHub**: Click "GitHub" > Enable > Enter Client ID and Secret from GitHub OAuth App.
    - Use `ask_user` if GitHub OAuth credentials needed.
  - **Anonymous**: Enable if guest access is needed.
- Configure authorized domains: add the app's production domain.
- Take snapshot of enabled providers.

### 6. Set Up Firestore Database
- Click "Firestore Database" in the sidebar, then "Create database".
- **Security rules**: Use `ask_user` (input_type "choice"):
  - "Start in test mode (open access for 30 days — good for development)"
  - "Start in production mode (locked down — requires security rules)"
- **Location**: Select database location. Use `ask_user` (input_type "choice"):
  - "asia-south1 (Mumbai)", "us-central (Iowa)", "us-east1 (South Carolina)", "europe-west1 (Belgium)", "asia-southeast1 (Singapore)".
  - **Warning: Location cannot be changed after creation.**
- Click "Create". Wait for provisioning.
- Navigate to the Firestore data tab. Take snapshot.
- If user has a data model, create initial collections and documents.
- Navigate to "Rules" tab and configure security rules based on app needs.

### 7. Configure Cloud Storage (if requested)
- Click "Storage" in the sidebar, then "Get started".
- Accept default security rules (or customize).
- Select storage location (should match Firestore location).
- Take snapshot of the storage bucket.
- Create folders for organization (e.g. /avatars, /uploads, /documents).
- Configure storage security rules for user-specific access.

### 8. Set Up Hosting (if requested)
- Click "Hosting" in the sidebar, then "Get started".
- Firebase shows CLI setup instructions.
- Extract the hosting setup commands for the user:
  - `npm install -g firebase-tools`
  - `firebase login`
  - `firebase init hosting`
  - `firebase deploy`
- Configure custom domain if requested: "Add custom domain" > enter domain > verify ownership via DNS TXT record.
- Take snapshot of hosting configuration.

### 9. Register Web App & Get Config
- Click the gear icon > "Project settings" > "General" tab.
- Scroll to "Your apps" section. Click the web icon (</>) to register a web app.
- Enter app nickname (e.g. "my-app-web").
- Firebase shows the configuration object with API keys.
- Take snapshot of the Firebase config.
- Extract:
  - apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
  - These are safe for client-side code (security is enforced by rules, not key secrecy).

### 10. Review & Confirm Setup
- Take final snapshot of the project overview dashboard.
- Use `confirm_action` to present complete setup summary:
  - Project name and ID
  - Features enabled (Auth, Firestore, Storage, Hosting, Functions)
  - Auth providers configured
  - Database location
  - Billing plan (Spark free or Blaze pay-as-you-go)
  - Firebase config keys
- Report full details to user:
  - Firebase project URL (console link)
  - Web app config object (for firebase.js initialization)
  - SDK installation: `npm install firebase`
  - Auth providers enabled
  - Firestore security rules summary
  - Storage bucket URL
  - Hosting URL (if set up): projectid.web.app
  - CLI commands for deployment
- Use `collect_payment` if Blaze plan is needed:
  - summary: JSON with project name, features, plan, estimated monthly cost
  - amount_inr: estimated monthly cost (number)
  - description: "Firebase Blaze plan setup"
- If setup failed at any point, report error and suggest fixes.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Firebase Spark (free) plan: 1GB Firestore storage, 10GB bandwidth, 50K reads/day, 20K writes/day — generous for small apps.
- Cloud Functions and outbound networking REQUIRE Blaze (pay-as-you-go) plan — cannot use on Spark.
- Firestore location is PERMANENT — choose carefully. asia-south1 (Mumbai) recommended for Indian users.
- Firebase config keys (apiKey, etc.) are meant to be public — security is enforced by Firestore/Storage rules, not key secrecy.
- Firestore security rules are critical — test mode expires in 30 days and opens database to everyone.
- Google Sign-In works immediately since the project is on the operator's Google account.
- Firebase console session lasts as long as the Google account session — rarely expires.
- Project ID is globally unique and permanent — choose a descriptive one.
- Hosting provides free SSL and CDN via Google's global infrastructure.
- Cloud Functions support Node.js (18, 20) and Python — configured via firebase.json.
- Realtime Database is legacy — recommend Firestore for new projects unless real-time sync is the primary use case.
