---
name: audible-audiobook
description: Buy an audiobook on Audible India — search, preview narration, purchase with credits or money.
triggers:
  - audible
  - buy audiobook
  - audible audiobook
  - audible india
  - listen to audiobook
  - audiobook purchase
  - audible book
  - buy audiobook online
  - audible credit
  - amazon audible
siteUrl: https://www.audible.in
requiresAuth: true
params:
  - name: book
    required: true
    hint: Audiobook title or topic (e.g. "Sapiens", "best thriller audiobooks", "self-help books")
  - name: author
    required: false
    hint: Author name if known (e.g. "Yuval Noah Harari", "Michelle Obama")
  - name: narrator
    required: false
    hint: Preferred narrator if any (e.g. "Stephen Fry", "narrator with Indian accent")
  - name: payment_type
    required: false
    hint: Payment method (e.g. "use credit", "buy with money", "subscribe first")
---

# Audible India Audiobook Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Audiobook Requirements
- Confirm what book or topic the user wants to listen to.
- Get: book title or topic, author (if known), narrator preference, credit vs cash purchase.
- Use `ask_user` for missing critical info (book title or topic at minimum).
- Ask: "Do you have an Audible subscription/credits, or would you like to buy outright?"

### 2. Open Audible India
- Open a NEW tab and navigate to `https://www.audible.in`.
- Take snapshot. Verify logged in (account name or "Hi, [Name]" in header).
- If NOT logged in, login transparently using Amazon credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check credit balance: look for "X Credits available" in account area.

### 3. Search for Audiobook
- Use the search bar to find the book or topic.
- Apply filters: Category, Rating (4+ stars), Length, Language, Price/Included in membership.
- Take snapshot. Extract top 3-5 results with: title, author, narrator, rating, number of reviews, length, price (or "1 Credit"), member price.
- Use `ask_user` (input_type "choice") to let user pick:
  "Sapiens by Yuval Harari — Narrated by Derek Perkins — 4.8★ (25K reviews) — 15h 17m — 1 Credit or ₹499"

### 4. Review Audiobook Details
- Click the selected audiobook. Take snapshot.
- Summarize: description, narrator bio, sample available, length, publication date, ratings breakdown, "Listeners also enjoyed" suggestions.
- Check if a free sample clip is available. Mention: "A 5-minute sample is available — would you like to listen before buying?"
- If user wants the sample, play it and ask for feedback.
- If user wants to compare, go back and show another option.

### 5. Select Purchase Method
- Determine purchase method. Present via `ask_user` (input_type "choice"):
  - "Use 1 Credit (you have X credits remaining)" — if credits available
  - "Buy for ₹[price] (member price)" — if subscribed
  - "Buy for ₹[price] (non-member price)" — if not subscribed
  - "Start Audible membership — ₹199/month, includes 1 credit/month + free trial"
- If user has no subscription and wants value, recommend the membership trial.

### 6. Review & Confirm Purchase
- Click "Buy with 1 Credit" or "Add to Cart" as appropriate. Take snapshot.
- Use `confirm_action`:
  - Audiobook title, author, narrator
  - Length (hours and minutes)
  - Rating and number of reviews
  - Purchase method: credit or cash
  - Price: "1 Credit" or "₹[amount]"
  - Membership status and credits remaining after purchase
  - Whispersync with Kindle (if ebook owned): mention discount
- Do NOT proceed unless user confirms.

### 7. Payment
- If using credit: proceed directly (no monetary payment needed, but still confirm).
- If paying with money:
  - Use `collect_payment`:
    - summary: JSON with title, author, narrator, length, purchase_method, price
    - amount_inr: total amount
    - description: "Audible audiobook purchase"
  - WAIT for payment confirmation.
- If subscribing first:
  - Complete subscription sign-up, then use credit for the audiobook.

### 8. Complete & Confirm
- Complete the purchase on Audible. Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation / library page.
- Report: audiobook title, author, narrator, length, purchase method, price paid (or "1 Credit used"), credits remaining.
- Mention: "Your audiobook is now in your Audible library! Listen on the Audible app (iOS/Android) or Alexa devices. Downloads available for offline listening."
- If Whispersync available: "You can switch between reading on Kindle and listening on Audible — it syncs your position automatically."

## Site Notes

- Audible India (audible.in) is Amazon's audiobook platform — largest audiobook library globally.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in via Amazon. Do NOT ask user for credentials.
- If session expired, login transparently with Amazon credentials. OTP goes to operator's phone/email.
- Audible membership: ₹199/month includes 1 credit/month. Each credit = any audiobook regardless of price. Credits are the best value.
- Non-member prices are 2-3x higher than credit value — always recommend membership if user plans to buy regularly.
- Free trial typically includes 1-2 free audiobooks — always check and mention for new users.
- Audible has a generous return/exchange policy — audiobooks can be returned within 365 days if unsatisfied.
- Whispersync for Voice pairs Kindle ebook + Audible audiobook — discounted companion audiobooks for owned ebooks.
- "Audible Plus" catalog has thousands of free audiobooks/podcasts included with membership — mention if relevant.
- Sample clips (5 minutes) are free — recommend listening before buying to check narrator quality.
- Audiobook length varies from 1 hour (short) to 40+ hours (epic) — mention length so user knows the commitment.
- Popular Indian language audiobooks are available in Hindi, Tamil, Marathi, etc. — ask if user has a language preference.
- Use `confirm_action` for purchase review, `collect_payment` for cash purchases. WAIT for user response at each step.
