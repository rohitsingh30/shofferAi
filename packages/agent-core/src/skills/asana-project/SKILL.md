---
name: asana-project
description: Create Asana projects with tasks, sections, assignees, and due dates — team project management and tracking.
triggers:
  - asana
  - create asana project
  - asana project
  - asana tasks
  - project management
  - create project with tasks
  - task management
  - team project
  - set up asana
  - asana board
siteUrl: https://app.asana.com
requiresAuth: true
params:
  - name: project_name
    required: true
    hint: Name for the project (e.g. "Website Redesign", "Product Launch")
  - name: layout
    required: false
    hint: Project layout — "list", "board", "timeline", or "calendar" (default "list")
  - name: sections
    required: false
    hint: Section names (e.g. "Planning, Design, Development, Testing, Launch")
  - name: tasks
    required: false
    hint: Initial tasks to create (e.g. "Create wireframes, Write PRD, Design mockups")
  - name: team_members
    required: false
    hint: Email addresses of team members to add
---

# Asana Project Setup

Chrome profile: rsinghtomar3011@gmail.com (Asana account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: project name.
- If project_name is missing, use `ask_user` (input_type "freetext"): "What should the project be called?"
- If layout not specified, use `ask_user` (input_type "choice"): "What layout? List view / Board view / Timeline / Calendar"
- If sections not specified, suggest defaults based on layout:
  - List/Timeline: "To Do, In Progress, Done"
  - Board: "Backlog, To Do, In Progress, Review, Done"
- Use `ask_user` (input_type "freetext") to confirm sections or get custom ones.
- Default layout to "list" if user skips.

### 2. Open Asana
- Open a NEW tab and navigate to `https://app.asana.com`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any onboarding tooltips, "What's new" modals, or upgrade prompts.

### 3. Verify Authentication
- Check if you see the Asana sidebar with workspaces/projects or a sign-in page.
- If signed in: proceed to project creation.
- If NOT signed in: click "Log In" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Asana sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Project
- Click the "+" or "Create" button in the sidebar → select "Project".
- Choose "Blank project" or select a template if user requested one.
- Enter the project name in the title field.
- Select the requested layout (List, Board, Timeline, Calendar).
- Set privacy to "Public to workspace" unless user specifies otherwise.
- Click "Create project" to finalize.
- Take a snapshot to confirm the project is created and the editor is open.

### 5. Add Sections
- For each section the user wants:
  - Click "+ Add section" (in list view) or the section area header.
  - Type the section name and press Enter.
- Rename default sections if they exist and don't match user's request.
- Take a snapshot showing all sections.

### 6. Add Tasks
- If tasks were specified, for each task:
  - Click "+ Add task" under the appropriate section.
  - Type the task title and press Enter.
  - If the task needs a due date or description, click to open task detail pane and fill in.
- If no tasks specified, use `ask_user` (input_type "freetext"): "Want me to add initial tasks? List them or say 'skip'."
- Assign tasks to team_members if provided — click the assignee icon on each task.
- Take a snapshot after adding tasks.

### 7. Invite Team Members
- If team_members were specified:
  - Click the "Share" button at the top-right of the project.
  - Enter each email address and select permission level (Editor by default).
  - Click "Invite" or "Share".
- Use `confirm_action`: "Project setup complete" with project name, layout, sections, task count, members, and project URL.

### 8. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with project_name, layout, sections, tasks_count, members_invited, project_url
  - amount_inr: service fee amount (number)
  - description: "Asana project setup and configuration"
- STOP and WAIT for payment confirmation. If cancelled, project remains accessible.

### 9. Final Confirmation
- Take a final snapshot of the completed project.
- Extract and report: project name, URL (from address bar), layout, number of sections, number of tasks, members invited.
- Report full details to user with the direct project link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Asana access. Do NOT ask user for credentials.
- Asana session persists via cookies — occasionally expires after 2-4 weeks. Re-login via Google SSO.
- Asana is a React SPA — wait for elements to fully render before interacting.
- The "+" button in the top bar or sidebar opens the create menu — use it for new projects.
- Sections in list view appear as collapsible headers; in board view they appear as columns.
- Task detail pane opens on the right side — click task title to open it.
- Free tier: up to 10 team members, unlimited tasks and projects.
- Asana may show "Try Premium" or "Upgrade" banners — dismiss them.
- Project URL format: `https://app.asana.com/0/{projectId}/list` — copy from address bar.
- Keyboard shortcut: Tab+Q opens quick-add task dialog.
- Custom fields require Premium — skip if on free tier.
