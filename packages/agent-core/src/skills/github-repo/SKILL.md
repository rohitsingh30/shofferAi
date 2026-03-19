---
name: github-repo
description: Create a GitHub repository — initialize with README, license, .gitignore, configure settings, and invite collaborators.
triggers:
  - github
  - create repo
  - create repository
  - github repo
  - new repository
  - github project
  - git repo
  - make a repo
siteUrl: https://github.com
requiresAuth: true
params:
  - name: repo_name
    required: true
    hint: Repository name (e.g. "my-awesome-project", "startup-api")
  - name: description
    required: false
    hint: Short description of the repository
  - name: visibility
    required: false
    hint: "public" or "private" (default private)
  - name: language
    required: false
    hint: Primary programming language for .gitignore template (e.g. "Node", "Python", "Go")
---

# GitHub Repository Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator GitHub account.

## Steps

### 1. Gather Requirements
- Confirm you have: repository name.
- If repo name is missing, use `ask_user` (input_type "freetext"): "What should the repository be named? (use lowercase-with-dashes)"
- If description is missing, use `ask_user` (input_type "freetext"): "Provide a short description for the repository."
- If visibility not specified, use `ask_user` (input_type "choice"): "Public (anyone can see)", "Private (only you and collaborators)".
- Ask about primary language for .gitignore if not specified.

### 2. Open GitHub in New Tab
- Open a NEW tab and navigate to `https://github.com`.
- Take a snapshot to see the landing page or dashboard.
- Dismiss any notification banners, tips, or promotional dialogs.
- Verify the GitHub dashboard or homepage is visible.

### 3. Verify Login
- Look for the profile avatar and username in the top-right corner.
- If signed in: proceed to repo creation.
- If NOT signed in: Click "Sign in", enter credentials or use Google SSO.
- If 2FA/CAPTCHA appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state and correct account.

### 4. Create New Repository
- Navigate to `https://github.com/new` to open the new repository form.
- Take snapshot of the create repository page.
- Fill in repository details:
  - **Repository name**: Enter the specified name.
  - **Description**: Enter description if provided.
  - **Visibility**: Select Public or Private (default Private).
  - **Initialize with README**: Check "Add a README file".
  - **.gitignore template**: Select appropriate template based on language (Node, Python, Go, Java, etc.).
  - **License**: Use `ask_user` (input_type "choice") if not specified: "MIT License", "Apache 2.0", "GPL 3.0", "BSD 3-Clause", "No License", "Other".
- Take snapshot of the filled form before creating.

### 5. Review & Create
- Use `confirm_action` to present repository configuration:
  - Repository name and owner
  - Description
  - Visibility (Public/Private)
  - README, .gitignore template, license
- Do NOT proceed unless user confirms. If changes needed, modify the form.
- Click "Create repository" button.
- Wait for the repository page to load.
- Take snapshot of the newly created repository.

### 6. Configure Repository Settings
- If user requested specific settings, navigate to Settings tab:
  - **Branch protection**: Settings > Branches > Add rule if needed.
  - **Collaborators**: Settings > Collaborators > Invite by email/username.
  - **Features**: Enable/disable Issues, Wiki, Projects, Discussions.
  - **Pages**: Enable GitHub Pages if requested (Settings > Pages).
- For collaborators, use `ask_user` (input_type "freetext"): "Enter GitHub usernames or emails to invite as collaborators (or type 'skip')."
- Take snapshot after configuring settings.

### 7. Set Up README Content
- If user provided specific README content or structure:
  - Click the pencil icon on README.md to edit.
  - Add project title, description, installation instructions, usage, etc.
  - Click "Commit changes" to save.
- If user wants a detailed README, use `ask_user` (input_type "freetext"): "What sections should the README include?"
- Take snapshot of the updated README.

### 8. Final Confirmation
- Take snapshot of the completed repository page.
- Report full details to user:
  - Repository URL (e.g. `https://github.com/username/repo-name`)
  - Clone URL (HTTPS and SSH)
  - Visibility status
  - Initialized files (README, .gitignore, LICENSE)
  - Collaborators invited (if any)
  - Settings configured
- Provide the git clone command for easy setup:
  - `git clone https://github.com/username/repo-name.git`

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to GitHub. Do NOT ask user for credentials.
- GitHub Free: unlimited public and private repos, up to 3 collaborators on private repos.
- Repository names must be unique within the account, lowercase, and can contain hyphens.
- GitHub auto-generates .gitignore templates for 300+ languages and frameworks.
- Common licenses: MIT (permissive), Apache 2.0 (permissive + patent), GPL 3.0 (copyleft).
- Branch protection rules require GitHub Pro for private repos.
- GitHub Pages is free for public repos, requires Pro for private repos.
- The new repo form is at `https://github.com/new` — navigate directly.
- Use `confirm_action` for repo creation review. No payment needed for GitHub Free.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator account. Do NOT ask user for credentials.
