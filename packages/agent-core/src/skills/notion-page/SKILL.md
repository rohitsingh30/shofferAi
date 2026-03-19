---
name: notion-page
description: Create a Notion page or database — use templates, add content blocks, customize layout, and share with collaborators.
triggers:
  - notion
  - create notion page
  - notion database
  - notion template
  - create page on notion
  - notion workspace
  - notion doc
  - organize in notion
siteUrl: https://www.notion.so
requiresAuth: true
params:
  - name: page_type
    required: true
    hint: Type of page (e.g. "blank page", "database", "project tracker", "meeting notes", "wiki")
  - name: title
    required: true
    hint: Page or database title
  - name: content
    required: false
    hint: Description of content to add (sections, text, properties)
  - name: share_with
    required: false
    hint: Email addresses to share with or "public" for web publishing
---

# Notion Page/Database Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator Notion account.

## Steps

### 1. Gather Requirements
- Confirm you have: page type and title.
- If page type is missing, use `ask_user` (input_type "choice"): "Blank Page", "Database / Table", "Project Tracker", "Meeting Notes", "Wiki", "To-Do List", "Content Calendar", "CRM", "Custom Template".
- If title is missing, use `ask_user` (input_type "freetext"): "What should the page be titled?"
- If content not described, use `ask_user` (input_type "freetext"): "Describe what content or structure you want on this page."
- Ask about sharing preferences if not specified.

### 2. Open Notion in New Tab
- Open a NEW tab and navigate to `https://www.notion.so`.
- Take a snapshot to see the landing page or workspace.
- Dismiss any onboarding modals, tips, or promotional banners.
- Verify the workspace sidebar is visible with existing pages.

### 3. Verify Login
- Look for the workspace name and user avatar in the sidebar.
- If signed in: proceed to page creation.
- If NOT signed in: Click "Log in", then "Continue with Google", select rsinghtomar3011@gmail.com.
- If CAPTCHA or verification appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state and correct workspace.

### 4. Create New Page
- Click "New page" in the sidebar or use the "+" button.
- If creating from template: click "Templates" in the new page menu, browse categories, select appropriate template.
- If creating a database: select "Table", "Board", "Calendar", "List", "Gallery", or "Timeline" view.
- Type the page title in the title field.
- Take snapshot of the new page created.

### 5. Add Content & Structure
- Based on user's requirements, add content blocks:
  - **Text**: Type directly, use `/` commands for formatting (heading, bullet, numbered list, toggle, callout, quote).
  - **Database**: Add properties (columns) — Name, Status, Date, Person, Tags, URL, etc. Add sample rows if specified.
  - **Sections**: Use headings (H1, H2, H3) to organize content.
  - **Special blocks**: Use `/` commands for divider, table of contents, code block, embed, image.
- For databases: configure views (Table, Board, Calendar) and filters as needed.
- Use `ask_user` (input_type "choice") if user needs to pick between layout options or property types.
- Take snapshot after adding major content sections.

### 6. Customize Appearance
- Set page icon: click the icon area, choose an emoji or upload custom icon.
- Set cover image: click "Add cover", select from Unsplash gallery or upload.
- Adjust font style if requested (Default, Serif, Mono) via page settings.
- Configure page width (standard or full width) if requested.
- Take snapshot of the styled page.

### 7. Review Page
- Scroll through the entire page to verify all content.
- Take a full snapshot of the completed page.
- Use `confirm_action` to present page summary:
  - Page title and type
  - Content sections or database structure
  - Number of blocks/rows added
  - Icon and cover image set
  - Current sharing status
- If user wants changes, go back and edit. If approved, proceed to sharing.

### 8. Share Page
- Click "Share" button in the top-right corner.
- Based on user's preference:
  - **Specific people**: Enter email addresses, set permission level (Full access, Can edit, Can view).
  - **Public link**: Toggle "Share to web", copy the public URL.
  - **Workspace**: Share with workspace members.
- Take snapshot of the share dialog with settings.
- Copy the page link.
- Report to user:
  - Page title and link
  - Sharing configuration
  - Public URL if web-published

### 9. Final Confirmation
- Take snapshot of the completed and shared page.
- Report full summary to user:
  - Page title and Notion link
  - Content structure overview
  - Sharing settings and who has access
  - How to edit later (direct link to page)
- Mention that Notion auto-saves all changes.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to Notion. Do NOT ask user for credentials.
- Notion Free plan: unlimited pages, up to 10 guests for sharing.
- Notion uses `/` slash commands extensively — type `/` to see all block types.
- The editor is a block-based system — each paragraph, heading, list item is a separate block.
- Database properties: Text, Number, Select, Multi-select, Date, Person, Files, Checkbox, URL, Email, Phone, Formula, Relation, Rollup, Created time, Last edited.
- Drag-and-drop blocks to reorder. Use `...` menu on blocks for more options.
- Notion is a complex SPA with many dynamic elements — wait for elements to load before interacting.
- Templates are available under "Templates" in the new page menu — useful for common structures.
- Pages can be nested (sub-pages) by dragging in the sidebar.
- Use `confirm_action` for page review. No payment needed for Notion Free.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator Google account. Do NOT ask user for credentials.
