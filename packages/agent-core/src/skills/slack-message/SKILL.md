---
name: slack-message
description: Send Slack messages, create channels, and manage team communication — DMs, channels, threads.
triggers:
  - slack
  - send slack message
  - slack message
  - create slack channel
  - post on slack
  - message on slack
  - slack channel
  - team message
  - send message to team
  - slack notification
siteUrl: https://app.slack.com
requiresAuth: true
params:
  - name: action
    required: true
    hint: What to do — "send_message", "create_channel", "post_announcement"
  - name: recipient
    required: false
    hint: Channel name or person name/email (e.g. "#general", "@john", "john@company.com")
  - name: message
    required: false
    hint: Message content to send
  - name: channel_name
    required: false
    hint: Name for new channel (lowercase, no spaces — e.g. "product-launch")
  - name: channel_purpose
    required: false
    hint: Purpose/description for new channel
---

# Slack Messaging & Channel Management

Chrome profile: rsinghtomar3011@gmail.com (Slack workspace signed in).

## Steps

### 1. Gather Requirements
- Confirm you have: action type.
- If action is "send_message":
  - If recipient missing, use `ask_user` (input_type "freetext"): "Who should I send this to? (channel name like #general or person name)"
  - If message missing, use `ask_user` (input_type "freetext"): "What message should I send?"
- If action is "create_channel":
  - If channel_name missing, use `ask_user` (input_type "freetext"): "What should the channel be called? (lowercase, hyphens instead of spaces)"
  - If channel_purpose missing, use `ask_user` (input_type "freetext"): "What's the purpose of this channel?"
- If action is "post_announcement":
  - If recipient missing, default to "#general".
  - If message missing, use `ask_user` (input_type "freetext"): "What's the announcement?"

### 2. Open Slack
- Open a NEW tab and navigate to `https://app.slack.com`.
- Take a snapshot to see the workspace or sign-in page.
- Slack may redirect to a workspace URL like `https://app.slack.com/client/TXXXXXX/CXXXXXX`.
- Dismiss any "What's new" modals, update banners, or onboarding tours.

### 3. Verify Authentication
- Check if you see the Slack workspace sidebar with channels and DMs.
- If signed in: verify the correct workspace is active (check workspace name in top-left).
- If NOT signed in: click "Sign in with Google" → select rsinghtomar3011@gmail.com.
- If multiple workspaces, use `ask_user` (input_type "choice") to select the right one.
- If CAPTCHA appears, use `ask_user`: "Please complete Slack sign-in in the browser. Type 'done' when finished."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**

### 4a. Send Message (if action is send_message or post_announcement)
- Navigate to the recipient channel or DM:
  - For channels: click the channel name in the sidebar, or use Cmd+K and type the channel name.
  - For DMs: click "Direct messages" in sidebar, find the person, or use Cmd+K.
- Click the message input box at the bottom of the conversation.
- Type the message content. For formatted messages, use Slack markdown (bold, bullets, etc.).
- Take a snapshot showing the composed message.
- Use `confirm_action`: "Send this message?" with recipient, message preview, and channel/DM info.
- If confirmed, press Enter or click the Send button to send.
- Take a snapshot to verify the message was sent (it should appear in the conversation).

### 4b. Create Channel (if action is create_channel)
- Click the "+" next to "Channels" in the sidebar, or use the "Create channel" option.
- Enter the channel name (lowercase, hyphens for spaces).
- Add the channel purpose/description.
- Set visibility: use `ask_user` (input_type "choice"): "Public channel (anyone can join) or Private channel (invite only)?"
- Click "Create" to finalize.
- Take a snapshot of the new channel.
- If members to invite, type their names/emails in the invite dialog.
- Use `confirm_action`: "Channel created" with channel name, purpose, visibility, and members.

### 5. Collect Service Fee
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with action, recipient_or_channel, message_preview, workspace_name
  - amount_inr: service fee amount (number)
  - description: "Slack communication service"
- STOP and WAIT for payment confirmation. If cancelled, action already completed.

### 6. Final Confirmation
- Take a final snapshot of the result.
- Extract and report: action performed, recipient/channel, message sent or channel created, workspace name.
- Report full details to user.
- If any step failed, report the error and suggest next steps.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) has Slack access. Do NOT ask user for credentials.
- Slack session uses workspace-specific cookies — may need to re-authenticate per workspace.
- Slack web app is a heavy React SPA — wait for elements to fully load (sidebar, message input).
- Cmd+K (or Ctrl+K) opens the quick switcher — fastest way to find channels and people.
- Message input is a contenteditable div — use Playwright type() not fill().
- Channel names must be lowercase, max 80 chars, only letters/numbers/hyphens/underscores.
- Sending a message is instant — Enter key sends, Shift+Enter for new line.
- Slack may show "Connect your calendar" or "Install app" prompts — dismiss them.
- Thread replies: click "Reply in thread" on a message to open the thread pane.
- Free tier: 90 days of message history, 10 app integrations.
- Workspace URL varies — Slack redirects to the active workspace automatically.
