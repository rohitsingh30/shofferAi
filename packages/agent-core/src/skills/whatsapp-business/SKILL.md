---
name: whatsapp-business
description: Set up WhatsApp Business profile — create business catalog, configure auto-replies, set business hours and greeting messages.
triggers:
  - whatsapp business setup
  - setup whatsapp business
  - whatsapp business profile
  - whatsapp business catalog
  - whatsapp business auto reply
  - whatsapp business account
  - create whatsapp business
  - whatsapp business greeting
  - whatsapp business hours
  - configure whatsapp business
siteUrl: https://business.facebook.com
requiresAuth: true
params:
  - name: business_name
    required: true
    hint: Business name (e.g. "Rohit's Electronics", "Fresh Bakes Bakery")
  - name: business_category
    required: false
    hint: Business category (e.g. "Retail", "Restaurant", "Services", "Education")
  - name: phone_number
    required: false
    hint: WhatsApp Business phone number (if different from current)
  - name: setup_items
    required: false
    hint: What to set up (e.g. "profile", "catalog", "auto-replies", "all")
---

# WhatsApp Business Profile Setup

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what the user wants to set up. WhatsApp Business features:
  - **Business Profile** — Name, description, address, email, website, hours.
  - **Product Catalog** — List of products/services with images, prices, descriptions.
  - **Auto-Replies** — Away message, greeting message, quick replies.
  - **Business Hours** — Operating hours configuration.
  - **Labels** — Organize chats with custom labels.
- Use `ask_user` to determine scope of setup (input_type "choice"):
  - "Full setup — Profile + Catalog + Auto-replies + Hours"
  - "Profile only — Business name, description, contact info"
  - "Catalog only — Add products/services"
  - "Auto-replies only — Greeting, away message, quick replies"
- Gather business details: name, category, address, description, website, email.
- If catalog setup needed, ask for product list (names, prices, descriptions).

### 2. Open WhatsApp Business Manager & Verify Login
- Open a NEW tab and navigate to `https://business.facebook.com` or `https://web.whatsapp.com`.
- Take snapshot. Check if logged in to Meta Business Suite / WhatsApp Web.
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Navigate to WhatsApp Business settings within Meta Business Suite.

### 3. Set Up Business Profile
- Navigate to WhatsApp Business profile settings.
- Fill in or update the following fields:
  - **Business name**: As provided by user.
  - **Category**: Select from available categories.
  - **Description**: Write a compelling 256-character business description.
  - **Address**: Physical address (if applicable).
  - **Email**: Business contact email.
  - **Website**: Business URL (if any).
- Take snapshot of the completed profile.
- Use `ask_user` to confirm profile details look correct.

### 4. Configure Catalog (If Requested)
- Navigate to the Catalog section in WhatsApp Business settings.
- For each product/service the user wants to add:
  - Enter product name, price (INR), description.
  - Upload product image if web interface supports it.
  - Set product link (if applicable).
- Take snapshot of catalog after adding items.
- Use `ask_user` to confirm catalog entries are correct.

### 5. Set Up Auto-Replies (If Requested)
- Navigate to Messaging settings:
  - **Greeting Message**: Auto-sent when someone messages for the first time.
    - Draft a professional greeting based on business type. Show user for approval.
  - **Away Message**: Auto-sent outside business hours.
    - Draft an away message with expected response time. Show user for approval.
  - **Quick Replies**: Keyboard shortcuts for common responses.
    - Suggest 3-5 quick replies based on business type (e.g. "Thank you for your order!", "Our hours are...").
- Configure business hours (days and times the business is open).
- Take snapshot of messaging settings.

### 6. Review & Confirm
- Use `confirm_action` with full setup summary:
  - Business name and category
  - Profile description
  - Contact info (address, email, website)
  - Number of catalog items added
  - Greeting message text
  - Away message text
  - Quick replies configured
  - Business hours set
- Do NOT finalize unless user confirms.

### 7. Save & Confirm
- Save all settings and configurations.
- Take snapshot of the completed WhatsApp Business profile.
- Report to user: setup complete, what was configured, how to access settings later.
- Mention: "Your WhatsApp Business profile is now live. Customers will see your business info, catalog, and receive auto-replies."
- Mention: "You can update catalog and messages anytime from WhatsApp Business app or Meta Business Suite."

## Site Notes

- WhatsApp Business setup is managed via Meta Business Suite (business.facebook.com) on web.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in to Meta/Facebook. Do NOT ask user for credentials.
- WhatsApp Business has two versions: the free app and the API (for larger businesses). This skill covers the free app/web setup.
- Catalog supports up to 500 items — sufficient for most small businesses in India.
- Auto-replies are limited in the free version — greeting message, away message, and quick replies only. Advanced chatbots require the API.
- Business hours affect when away messages are triggered — set accurately to avoid confusing customers.
- WhatsApp Business phone number must be different from personal WhatsApp — inform user if they need a separate number.
- Profile verification (green checkmark) requires a separate application process through Meta — not covered in this setup.
- Session on Meta Business Suite may expire frequently — QR code scan may be needed for WhatsApp Web.
- India is WhatsApp's largest market — most customers expect WhatsApp Business presence from local businesses.
- Use `confirm_action` for review before finalizing. Always WAIT for user confirmation.
