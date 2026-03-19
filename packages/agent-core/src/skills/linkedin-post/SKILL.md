---
name: linkedin-post
description: Create and publish a LinkedIn post — write content, add images or documents, set audience, and publish.
triggers:
  - linkedin post
  - post on linkedin
  - publish on linkedin
  - linkedin update
  - share on linkedin
  - write linkedin post
  - linkedin content
  - create linkedin post
siteUrl: https://www.linkedin.com
requiresAuth: true
params:
  - name: content
    required: true
    hint: Post content or key points to write about (e.g. "announcement about new product launch")
  - name: image
    required: false
    hint: Description of image to attach (if any)
  - name: audience
    required: false
    hint: Post visibility (Anyone, Connections only). Default is Anyone.
  - name: hashtags
    required: false
    hint: Hashtags to include (e.g. "#startup #AI #product")
---

# LinkedIn Post Creation & Publishing

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify content, use `ask_user` (input_type "freetext"): "What do you want to post on LinkedIn? (key points or full text)"
- If user gave key points instead of full text, draft a professional LinkedIn post and present it for review.
- Use `ask_user` (input_type "freetext") to show the draft: "Here's the draft post. Would you like to edit anything?\n\n[draft text]"
- If user wants hashtags but did not specify, suggest relevant ones based on the content.
- If user wants to attach an image, note it for later.

### 2. Open LinkedIn & Verify Login
- Open a NEW tab and navigate to `https://www.linkedin.com/feed/`.
- Take a snapshot. Check if logged in (profile photo in navbar, feed visible).
- If NOT logged in, click Sign In and use operator credentials transparently. Do NOT ask user for credentials.
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to LinkedIn in Chrome Debug."**
- Verify the correct profile is active by checking the profile name/photo.
- Take snapshot to confirm feed is visible and ready.

### 3. Open Post Composer
- Click "Start a post" box at the top of the feed (or the pencil/create icon).
- Wait for the post creation modal/dialog to appear.
- Take snapshot of the empty composer.

### 4. Write Post Content
- Click in the text area of the composer.
- Type the post content (the final approved version from Step 1).
- Include hashtags at the end if user specified them.
- If the post includes line breaks or formatting, ensure they are preserved.
- Take snapshot of the post with content filled in.

### 5. Add Media (if needed)
- If user wants to attach an image:
  - Click the image/photo icon in the composer toolbar.
  - Navigate to the file in the file picker dialog.
  - If file path is unclear, use `ask_user` (input_type "freetext"): "What is the image file name or path to attach?"
  - Wait for upload to complete.
  - Take snapshot to confirm image is attached.
- If user wants to attach a document (PDF, slides):
  - Click the document icon in the composer toolbar.
  - Upload the file similarly.
- If no media needed, skip this step.

### 6. Set Audience & Review
- Check the audience setting (usually shows "Anyone" by default).
- If user specified a different audience (Connections only), click the audience dropdown and change it.
- Take a final snapshot of the complete post.
- Use `confirm_action` to present post summary:
  - Post content (first 150 characters preview)
  - Media attached: image/document (if any)
  - Audience: Anyone / Connections only
  - Hashtags included
  - "Confirm you want to publish this post on LinkedIn?"
- Do NOT publish unless user confirms.
- If user wants to edit, make changes and re-confirm.

### 7. Publish & Confirm
- Click the "Post" button.
- Wait for the post to be published (modal closes, post appears in feed).
- Take snapshot of the published post in the feed.
- Report to user:
  - Post published successfully on LinkedIn
  - Content preview (first 50 words)
  - Media: attached (if any)
  - Audience: Anyone / Connections only
  - "Your post is now live on your LinkedIn profile"
  - "Posted from rsinghtomar3011@gmail.com LinkedIn account"

## Site Notes

- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in to LinkedIn. Do NOT ask user for credentials.
- LinkedIn may show notification popups, messaging sidebar, or premium prompts — dismiss them.
- The post composer is a modal/dialog — do not click outside it or it may close and lose content.
- LinkedIn supports rich text formatting (bold, italic) via keyboard shortcuts in the composer.
- Hashtags should be added at the end of the post, each preceded by #.
- LinkedIn posts have a character limit of ~3,000 characters — warn if content is too long.
- LinkedIn sessions last weeks but may expire — if login page appears, STOP and inform user.
- LinkedIn uses React — always use Playwright fill/type methods.
- Use `confirm_action` before publishing (no money involved). WAIT for user response. Do NOT auto-publish.
- If user wants to tag people (@mention), type @ followed by the person's name and select from dropdown.
- Images should be high quality (recommended 1200x627 px) for best engagement.
- Scheduling posts is only available with LinkedIn premium or third-party tools — inform user if requested.
