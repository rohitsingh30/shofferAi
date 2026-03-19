---
name: canva-design
description: Create designs on Canva — browse templates, customize text and images, download or share the final design.
triggers:
  - canva
  - create design
  - design on canva
  - make a poster
  - create logo
  - social media post
  - design template
  - create banner
  - make flyer
siteUrl: https://www.canva.com
requiresAuth: true
params:
  - name: design_type
    required: true
    hint: Type of design (e.g. "Instagram post", "logo", "poster", "presentation", "business card", "banner")
  - name: description
    required: true
    hint: What the design should contain or look like
  - name: output_format
    required: false
    hint: Download format (PNG, JPG, PDF, SVG) or share link
---

# Canva Design Creation

Chrome profile: rsinghtomar3011@gmail.com. Operator Canva account.

## Steps

### 1. Gather Requirements
- Confirm you have: design type and description of what user wants.
- If design type is missing, use `ask_user` (input_type "choice"): "Instagram Post", "Facebook Post", "Logo", "Poster", "Presentation", "Business Card", "YouTube Thumbnail", "Banner", "Flyer", "Resume", "Other".
- If description is vague, use `ask_user` (input_type "freetext"): "Describe what you want in the design — text, colors, style, any specific elements?"
- Ask about preferred output format if not specified. Default to PNG.

### 2. Open Canva in New Tab
- Open a NEW tab and navigate to `https://www.canva.com`.
- Take a snapshot to see the landing page.
- Dismiss any promotional popups, onboarding tooltips, or upgrade banners.
- Verify the main dashboard or homepage is visible.

### 3. Verify Login
- Look for a profile avatar, user name, or account icon in the top-right header.
- If signed in: proceed to template search.
- If NOT signed in: Click "Log in", then "Continue with Google", select rsinghtomar3011@gmail.com.
- If CAPTCHA or verification appears, use `ask_user`: "Please complete sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search Templates
- Click "Create a design" or use the search bar to search for the design type.
- Alternatively navigate to the appropriate category (e.g. "Social Media", "Marketing", "Business").
- Take snapshot of available templates.
- Filter templates based on user's description (style, color, theme).
- Extract 3-5 best matching templates.
- Use `ask_user` (input_type "choice") to present template options:
  - Template name/style description
  - "Start from blank canvas" option
  - "Show more templates" option

### 5. Customize Design
- Click the selected template to open the editor.
- Take snapshot of the template in the editor.
- Modify text elements based on user's description:
  - Click on text elements and replace with user's content.
  - Adjust font, size, color if specified.
- Modify images if needed:
  - Replace placeholder images using "Uploads" or "Photos" from Canva's library.
  - Adjust positioning and sizing.
- Modify colors if user specified a color scheme.
- Take snapshot after each major change.
- Use `ask_user` (input_type "choice") to confirm: "Does this look good?", "Change text", "Change colors", "Change image", "Change template".

### 6. Review Design
- Take a full snapshot of the completed design.
- Use `confirm_action` to present the design for review:
  - Design type and dimensions
  - Key text content
  - Color scheme used
  - Template name
- Ask user to approve or request changes.
- If changes requested, go back to step 5 and iterate.

### 7. Download or Share
- Once user approves, click "Share" button in the top-right.
- Use `ask_user` (input_type "choice"): "Download (PNG)", "Download (JPG)", "Download (PDF)", "Download (SVG)", "Get shareable link", "Share to social media".
- If download: click "Download", select format and quality, click "Download".
- If share link: click "Share", copy the link, report to user.
- Take snapshot of download/share confirmation.

### 8. Final Confirmation
- Take snapshot showing the download completed or link generated.
- Report to user:
  - Design type and name
  - Output format
  - Download location or share link
  - Canva project link for future editing
- If any step failed, report error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Canva Free has limited features — some templates, elements, and fonts are Pro-only (marked with crown icon).
- If user selects a Pro template/element, inform them and suggest free alternatives.
- Canva editor is a complex SPA — use Playwright click/type carefully, elements may take time to load.
- Text editing: double-click text element to enter edit mode, then select all and type new text.
- Canva auto-saves designs — user can always access them later from their dashboard.
- Download without paying is available for free elements only. Pro elements show watermark.
- SVG download may not be available on free plan.
- Use `confirm_action` for design review (before finalizing), no payment collection needed for free designs.
- When using confirm_action, WAIT for user response. Do NOT auto-proceed.
- If session expired, re-login with operator Google account. Do NOT ask user for credentials.
