---
name: koo-post
description: Create and publish posts on Koo — Indian multilingual social media platform. Write, attach media, share.
triggers:
  - koo post
  - post on koo
  - koo app
  - koo social media
  - create koo post
  - share on koo
  - write koo
  - koo tweet
  - indian social media post
  - publish on koo
siteUrl: https://www.kooapp.com
requiresAuth: true
params:
  - name: content
    required: false
    hint: Text content for the post (e.g. "Excited about the new product launch!")
  - name: language
    required: false
    hint: Post language (e.g. "English", "Hindi", "Tamil", "Kannada")
  - name: media
    required: false
    hint: Whether to attach image or video (e.g. "no media", "with image", "with video")
---

# Koo Post Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to post on Koo:
  - **Text post** — Simple text-based Koo (up to 400 characters).
  - **Text + Media** — Post with image or video attachment.
  - **Multi-language post** — Koo supports posting in multiple Indian languages simultaneously.
- Ask user for post content via `ask_user` if not provided:
  - "What would you like to post on Koo? (up to 400 characters)"
- Ask preferred language via `ask_user` (input_type "choice"):
  - English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, etc.
- Koo has a unique "multi-language Koo" feature — ask if user wants the post auto-translated to other languages.
- Clarify if any hashtags or mentions should be included.

### 2. Open Koo & Verify Login
- Open a NEW tab and navigate to `https://www.kooapp.com`.
- Take snapshot. Check if logged in (profile avatar or "Create Koo" button visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify the logged-in profile is the correct account.

### 3. Create New Post
- Click the "Create Koo" or compose button.
- Take snapshot of the compose/editor screen.
- Enter the post text content as provided by the user.
- Apply selected language if the editor supports language selection.
- If user wants media attachment, check if the web interface supports file upload.
  - If image/video upload is needed and not feasible via web, inform user of limitation.
- Add any hashtags or mentions specified by the user.
- Take snapshot of the composed post before publishing.

### 4. Multi-Language Translation
- If user opted for multi-language Koo:
  - Use Koo's built-in translation feature to add translations.
  - Select target languages for the post.
  - Take snapshot showing translation preview.
  - Use `ask_user` to confirm translations look correct.

### 5. Review & Confirm
- Use `confirm_action` with post summary:
  - Post text (full content)
  - Language(s)
  - Hashtags included
  - Media attachments (if any)
  - Multi-language translations (if any)
  - Posting as: account name/handle
- Do NOT publish unless user confirms.

### 6. Publish & Confirm
- Click the "Post" or "Koo" button to publish.
- Take snapshot of the published post on the feed.
- Report to user: post published successfully, link to post (if available), language(s) posted in.
- Mention: "Your Koo is now live. You can edit or delete it from your profile anytime."
- Share the direct URL of the published Koo if visible.

## Site Notes

- Koo is India's multilingual microblogging platform — positioned as the Indian alternative to Twitter/X.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Koo supports posts in 10+ Indian languages with auto-translation — a unique differentiator.
- Character limit is 400 characters per Koo (more generous than Twitter's original 280).
- The web version (kooapp.com) may have fewer features than the mobile app — media upload may be limited.
- Koo uses phone number + OTP for login — the operator's number must be registered on Koo.
- Hashtags on Koo work similarly to Twitter — recommend relevant trending hashtags for visibility.
- Koo has a "Talk to Type" feature on mobile — not available on web, so type content directly.
- Posts can be deleted or edited after publishing — reassure user that mistakes can be corrected.
- Koo's engagement features include Re-Koo (retweet), Comment, and Like — inform user about reach.
- Use `confirm_action` before publishing. Always WAIT for user confirmation before posting.
