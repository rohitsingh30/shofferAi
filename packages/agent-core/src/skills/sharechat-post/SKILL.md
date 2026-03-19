---
name: sharechat-post
description: Create and publish posts on ShareChat — India's regional language social media platform. Text, image, video posts.
triggers:
  - sharechat post
  - post on sharechat
  - sharechat app
  - sharechat social media
  - create sharechat post
  - share on sharechat
  - regional social media post
  - sharechat content
  - write sharechat post
  - sharechat upload
siteUrl: https://sharechat.com
requiresAuth: true
params:
  - name: content
    required: false
    hint: Text content or caption for the post
  - name: language
    required: false
    hint: Post language (e.g. "Hindi", "Tamil", "Telugu", "Bengali", "Marathi")
  - name: post_type
    required: false
    hint: Type of post (e.g. "text", "image with caption", "video", "meme")
  - name: tags
    required: false
    hint: Tags or topics for the post (e.g. "funny", "motivation", "news")
---

# ShareChat Post Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine the type of post the user wants to create:
  - **Text post** — Status update or thought in regional language.
  - **Image + Caption** — Photo with text caption.
  - **Video post** — Short video content.
  - **Meme / Sticker** — ShareChat's popular meme templates.
- Ask for post content via `ask_user` if not provided:
  - "What would you like to post on ShareChat? Tell me the content or caption."
- Ask preferred language via `ask_user` (input_type "choice"):
  - Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, etc.
- Ask about tags/topics — ShareChat organizes content by tags (funny, motivation, love, news, cricket).
- Clarify if the post should be public or visible to followers only.

### 2. Open ShareChat & Verify Login
- Open a NEW tab and navigate to `https://sharechat.com`.
- Take snapshot. Check if logged in (profile icon or compose button visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Verify the correct account is active.

### 3. Set Language & Navigate to Compose
- Ensure the app language matches user's preferred language.
- If language needs changing, navigate to settings and update.
- Click the compose/create button to start a new post.
- Take snapshot of the compose screen.

### 4. Create Post Content
- Enter the text content or caption provided by the user.
- If image or video post:
  - Check if the web interface supports file upload.
  - If media upload is available, guide through the upload process.
  - If web upload is limited, inform user of the limitation.
- Select appropriate tags/topics for the post.
- Add relevant hashtags based on content and language.
- If ShareChat offers filters or editing tools, mention them to user.
- Take snapshot of the composed post before publishing.

### 5. Review & Confirm
- Use `confirm_action` with post summary:
  - Post content (full text/caption)
  - Language
  - Post type (text / image / video)
  - Tags/topics selected
  - Visibility (public / followers only)
  - Posting as: account name
- Do NOT publish unless user confirms.

### 6. Publish & Confirm
- Click the "Post" or "Share" button to publish.
- Take snapshot of the published post on the feed.
- Report to user: post published successfully, language, tags, link to post (if available).
- Mention: "Your post is now live on ShareChat. It will appear in feeds of users following your selected tags."
- Share the direct URL if visible.

## Site Notes

- ShareChat is India's largest regional-language social media platform with 180M+ monthly active users.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- ShareChat's web version (sharechat.com) may have limited functionality compared to the mobile app — media upload and creation tools may be restricted.
- Login is phone-number-based with OTP — the operator's phone number must be registered on ShareChat.
- Content is heavily organized by language and tags — choosing the right tags increases visibility dramatically.
- ShareChat is popular for memes, motivational quotes, festival greetings, and cricket content in regional languages.
- The platform auto-suggests trending tags — use these for better engagement.
- ShareChat also owns Moj (short video platform) — if user wants short-form video, Moj may be better suited.
- Posts can be shared to WhatsApp, Facebook, and other platforms directly from ShareChat — inform user about cross-posting.
- Session expiry varies — phone-number-based login typically persists for weeks.
- Use `confirm_action` before publishing. Always WAIT for user confirmation before posting.
