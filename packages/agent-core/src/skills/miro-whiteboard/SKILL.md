---
name: miro-whiteboard
description: Create Miro whiteboards for brainstorming, diagrams, mind maps, and team collaboration — templates and sticky notes.
triggers:
  - miro
  - create miro board
  - miro whiteboard
  - whiteboard
  - brainstorming board
  - mind map
  - miro diagram
  - create whiteboard
  - collaborative board
  - miro template
siteUrl: https://miro.com
requiresAuth: true
params:
  - name: board_name
    required: true
    hint: Name for the whiteboard (e.g. "Sprint Retro", "Product Roadmap", "Mind Map")
  - name: template
    required: false
    hint: Template — "blank", "mind map", "kanban", "flowchart", "retrospective", "brainstorm", "user story map"
  - name: content_items
    required: false
    hint: Initial items to add (e.g. sticky notes, text, shapes — "Idea 1, Idea 2, Idea 3")
  - name: share_with
    required: false
    hint: Email addresses of collaborators to invite
  - name: purpose
    required: false
    hint: Purpose of the board (helps choose layout — e.g. "sprint planning", "user journey")
---

# Miro Whiteboard Creation

Chrome profile: rsinghtomar3011@gmail.com (Miro account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: board name.
- If board_name is missing, use `ask_user` (input_type "freetext"): "What should the whiteboard be called?"
- If template not specified, use `ask_user` (input_type "choice"): "What template? Blank / Mind Map / Kanban / Flowchart / Retrospective / Brainstorm / User Story Map"
- If purpose is provided but template is not, suggest a matching template.
- Default to "blank" template if user skips.

### 2. Open Miro
- Open a NEW tab and navigate to `https://miro.com/app/dashboard/`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any onboarding tours, "What's new" popups, or upgrade banners.

### 3. Verify Authentication
- Check if you see the Miro dashboard with boards and team workspace.
- If signed in: proceed to board creation.
- If NOT signed in: click "Log in" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Miro sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Board
- Click the "+ New board" button on the dashboard.
- Miro may show a template picker — select the user's requested template or "Blank board".
- If using a template: browse categories, find the matching template, click "Use template".
- Wait for the board editor/canvas to fully load.
- Take a snapshot to confirm the editor is open.

### 5. Set Board Name & Configure
- Click the board name at the top-left ("Untitled") and type the user's requested board name.
- If a template was loaded, take a snapshot to show the pre-built structure.
- If blank board, set up initial structure based on purpose:
  - Brainstorm: create a central topic sticky and radiating idea stickies.
  - Mind Map: use the mind map widget if available.
  - Retrospective: create columns "What went well", "What didn't", "Action items".
  - Flowchart: add start/end shapes and basic connectors.
- Take a snapshot showing the initial setup.

### 6. Add Content Items
- If content_items were specified, for each item:
  - For sticky notes: click the sticky note tool (or press N), click on canvas, type the text.
  - For text: press T for text tool, click and type.
  - For shapes: use shape tool from toolbar.
  - Arrange items logically on the canvas.
- If no content specified, use `ask_user` (input_type "freetext"): "Want me to add any sticky notes or content? List items or say 'skip'."
- Color-code stickies by category if multiple themes emerge.
- Take a snapshot after adding content.

### 7. Share & Collaborate
- If share_with was provided:
  - Click the "Share" button (top-right of the board).
  - Enter each email address in the invite field.
  - Use `ask_user` (input_type "choice"): "Permission level? Can view / Can comment / Can edit"
  - Click "Invite" to share.
- Use `confirm_action`: "Whiteboard ready" with board name, template, items added, sharing status, and board URL.

### 8. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with board_name, template_used, items_added, shared_with, board_url
  - amount_inr: service fee amount (number)
  - description: "Miro whiteboard creation and setup"
- STOP and WAIT for payment confirmation. If cancelled, board remains accessible.

### 9. Final Confirmation
- Take a final snapshot of the completed whiteboard.
- Extract and report: board name, URL (from address bar), template used, items added, sharing status.
- Report full details to user with the direct board link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Miro access. Do NOT ask user for credentials.
- Miro session persists via cookies — typically expires after 2 weeks. Re-login via Google SSO.
- Miro editor uses a canvas (mix of DOM and canvas rendering) — use toolbar buttons and shortcuts.
- Key shortcuts: N = Sticky note, T = Text, S = Shape, L = Line/connector, F = Frame.
- Board auto-saves continuously — no manual save needed.
- Free tier: 3 editable boards, unlimited viewers, core integrations.
- Dashboard URL: `https://miro.com/app/dashboard/` — boards listed here.
- Board URL format: `https://miro.com/app/board/{boardId}=/` — copy from address bar.
- Template picker appears on new board creation — browse or search templates there.
- Miro may prompt "Install Miro app" or "Try AI features" — dismiss these.
- Sticky notes support colors: yellow, blue, green, pink, orange — click the color picker.
