---
name: trello-board
description: Create and set up Trello boards with lists, cards, labels, and members — project management made easy.
triggers:
  - trello
  - create trello board
  - trello board
  - project board
  - kanban board
  - create board
  - trello cards
  - task board
  - project management board
  - set up trello
siteUrl: https://trello.com
requiresAuth: true
params:
  - name: board_name
    required: true
    hint: Name for the board (e.g. "Product Launch Q3", "Wedding Planning")
  - name: lists
    required: false
    hint: List names (e.g. "To Do, In Progress, Done" or "Backlog, Sprint, Review, Done")
  - name: cards
    required: false
    hint: Initial cards to create (e.g. "Design mockups, Write copy, Set up analytics")
  - name: members
    required: false
    hint: Email addresses of team members to invite
  - name: template
    required: false
    hint: Template preference (e.g. "kanban", "project management", "sprint board")
---

# Trello Board Setup

Chrome profile: rsinghtomar3011@gmail.com (Atlassian account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: board name.
- If board_name is missing, use `ask_user` (input_type "freetext"): "What should the board be called?"
- If lists not specified, use `ask_user` (input_type "choice"): "What list structure? To Do / In Progress / Done | Backlog / Sprint / Review / Done | Custom"
- If user picks "Custom", use `ask_user` (input_type "freetext"): "Enter your list names, separated by commas."
- Default to "To Do, In Progress, Done" if user skips.

### 2. Open Trello
- Open a NEW tab and navigate to `https://trello.com`.
- Take a snapshot to see the landing page or dashboard.
- Dismiss any onboarding tours, banners, or "Try Premium" popups if they appear.

### 3. Verify Authentication
- Check if you see the Trello dashboard (boards visible) or a sign-in page.
- If signed in: proceed to board creation.
- If NOT signed in: click "Log in" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Trello sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Board
- Click the "+" or "Create" button in the header → select "Create board".
- If a template was requested, browse templates first: click "Start with a template" and search.
- Enter the board name in the title field.
- Select a background color or image (use blue as default).
- Set visibility to "Workspace" (default) unless user specifies otherwise.
- Click "Create" to finalize.
- Take a snapshot to confirm the board is created.

### 5. Set Up Lists
- Trello creates default lists ("To Do", "Doing", "Done"). Rename or replace as needed.
- For each list the user wants:
  - If list already exists with wrong name: click the list title, clear, type new name, press Enter.
  - If list doesn't exist: click "+ Add another list", type name, click "Add list".
  - Delete unwanted default lists: click list menu (three dots) → "Archive this list".
- Take a snapshot showing all lists.

### 6. Add Cards
- If cards were specified, for each card:
  - Click "+ Add a card" at the bottom of the appropriate list.
  - Type the card title and press Enter or click "Add card".
  - If card needs a description or due date, click the card to open it and fill details.
- If no cards specified, use `ask_user` (input_type "freetext"): "Want me to add any initial cards? List them or say 'skip'."
- Take a snapshot after adding cards.

### 7. Invite Members
- If members were specified:
  - Click "Share" or "Invite" button at the top-right of the board.
  - Enter each email address and click "Share board".
  - Set permission to "Member" (default).
- Use `confirm_action`: "Board setup complete" with board name, lists, cards count, members invited, and board URL.

### 8. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with board_name, lists, cards_count, members_invited, board_url
  - amount_inr: service fee amount (number)
  - description: "Trello board setup and configuration"
- STOP and WAIT for payment confirmation. If cancelled, board remains accessible.

### 9. Final Confirmation
- Take a final snapshot of the completed board.
- Extract and report: board name, URL (from address bar), number of lists, number of cards, members invited.
- Report full details to user with the direct board link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Trello access via Atlassian. Do NOT ask user for credentials.
- Trello session persists via Atlassian cookies — rarely expires. If expired, use Google SSO to re-login.
- Default lists on new board are "To Do", "Doing", "Done" — rename rather than delete-and-recreate.
- "Create board" button is in the header "+" menu or on the workspace home page.
- Adding cards: press Enter after typing to quickly add multiple cards in succession.
- Board URL format: `https://trello.com/b/{boardId}/{board-slug}` — copy from address bar.
- Free tier limits: 10 boards per workspace, unlimited cards.
- Trello may show "Upgrade to Premium" banners — dismiss them.
- Labels can be added via card menu — useful for categorization but optional.
- Power-Ups (integrations) are in board menu — skip unless user requests.
- Trello uses React — always wait for elements to render before clicking.
