---
name: figma-design
description: Create Figma design files with frames, templates, and wireframes — UI/UX design and prototyping.
triggers:
  - figma
  - create figma file
  - figma design
  - design file
  - wireframe
  - create wireframe
  - ui design
  - prototype
  - figma template
  - design mockup
siteUrl: https://www.figma.com
requiresAuth: true
params:
  - name: file_name
    required: true
    hint: Name for the design file (e.g. "App Redesign", "Landing Page Wireframe")
  - name: design_type
    required: false
    hint: Type of design — "wireframe", "mockup", "prototype", "presentation", "brainstorm"
  - name: template
    required: false
    hint: Template to start from (e.g. "mobile app", "website", "dashboard", "blank")
  - name: frames
    required: false
    hint: Frame/page names to create (e.g. "Home, Login, Dashboard, Profile")
  - name: share_with
    required: false
    hint: Email addresses to share the file with
---

# Figma Design File Creation

Chrome profile: rsinghtomar3011@gmail.com (Figma account signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: file name.
- If file_name is missing, use `ask_user` (input_type "freetext"): "What should the design file be called?"
- If design_type is missing, use `ask_user` (input_type "choice"): "What type of design? Wireframe / Mockup / Prototype / Presentation / Blank canvas"
- If frames not specified, suggest defaults based on design_type:
  - Wireframe: "Home, About, Contact"
  - Mobile App: "Splash, Login, Home, Profile, Settings"
  - Dashboard: "Overview, Analytics, Settings"
- Use `ask_user` (input_type "freetext") to confirm frames or get custom ones.
- Default to blank canvas with one frame if user skips.

### 2. Open Figma
- Open a NEW tab and navigate to `https://www.figma.com`.
- Take a snapshot to see the dashboard or landing page.
- Dismiss any "What's new in Figma" modals, onboarding tours, or upgrade prompts.

### 3. Verify Authentication
- Check if you see the Figma dashboard with recent files and projects.
- If signed in: proceed to file creation.
- If NOT signed in: click "Log in" → "Continue with Google" → select rsinghtomar3011@gmail.com.
- If CAPTCHA or 2FA appears, use `ask_user`: "Please complete Figma sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4. Create New Design File
- From the dashboard, click "+ New design file" or "New file" button.
- If user requested a template: click "Explore community" or search templates within Figma, select and duplicate.
- Wait for the Figma editor/canvas to fully load.
- Take a snapshot to confirm the editor is open with a blank canvas.

### 5. Set Up File Name & Frames
- Click the file name at the top-center ("Untitled") and type the user's requested file name.
- For each frame the user wants:
  - Press F (shortcut for Frame tool) or select Frame from the toolbar.
  - Click and drag on the canvas to create a frame, or select a device preset from the right panel.
  - Double-click the frame name in the layers panel and rename it.
  - For wireframes: use device presets (iPhone 15, Desktop 1440px, etc.).
- Arrange frames side by side on the canvas for clean layout.
- Take a snapshot showing all frames created.

### 6. Add Basic Structure
- For each frame, add placeholder elements based on design_type:
  - Wireframe: rectangles for headers, content blocks, navigation bars.
  - Mockup: text layers, shape layers, basic layout guides.
  - Blank: leave empty, just the frames.
- Use `ask_user` (input_type "freetext"): "Frames are set up. Want me to add any specific elements or content?"
- Apply any changes the user requests.
- Take a snapshot after modifications.

### 7. Share & Confirm
- If share_with was provided:
  - Click the "Share" button (top-right of the editor).
  - Enter each email address in the invite field.
  - Use `ask_user` (input_type "choice"): "Permission level? Can view / Can edit"
  - Click "Send invite".
- Use `confirm_action`: "Design file ready" with file name, frames created, sharing status, and file URL.

### 8. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with file_name, design_type, frames_created, shared_with, file_url
  - amount_inr: service fee amount (number)
  - description: "Figma design file creation"
- STOP and WAIT for payment confirmation. If cancelled, file remains accessible.

### 9. Final Confirmation
- Take a final snapshot of the completed design file.
- Extract and report: file name, URL (from address bar), number of frames, sharing status.
- Report full details to user with the direct file link.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Figma access. Do NOT ask user for credentials.
- Figma session persists via cookies — expires after 2-4 weeks of inactivity. Re-login via Google SSO.
- Figma editor is a WebGL canvas — most elements are NOT in the DOM. Use keyboard shortcuts.
- Key shortcuts: F = Frame, R = Rectangle, T = Text, V = Move, Ctrl+D = Duplicate.
- File auto-saves continuously — no manual save needed.
- Figma free tier: 3 files, unlimited viewers, 3 pages per file.
- "Share" button is top-right; link sharing vs invite are separate options.
- File URL format: `https://www.figma.com/design/{fileId}/{file-name}` — copy from address bar.
- Layers panel is on the left; properties panel is on the right.
- Community templates can be duplicated into your drafts — search via "Explore community".
- Figma may show "FigJam" (whiteboard) option — ensure you create a "Design file" not FigJam.
