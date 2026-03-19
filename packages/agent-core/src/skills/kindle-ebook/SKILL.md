---
name: kindle-ebook
description: Buy an ebook on Amazon Kindle store — search books, preview, purchase and deliver to Kindle device.
triggers:
  - kindle
  - buy ebook
  - kindle book
  - buy kindle book
  - amazon kindle
  - ebook purchase
  - buy book online
  - kindle store
  - digital book
  - read on kindle
siteUrl: https://www.amazon.in/kindle-dbs/storefront
requiresAuth: true
params:
  - name: book
    required: true
    hint: Book title or topic (e.g. "Atomic Habits", "best sci-fi novels", "Python programming book")
  - name: author
    required: false
    hint: Author name if known (e.g. "James Clear", "Yuval Noah Harari")
  - name: budget
    required: false
    hint: Budget preference (e.g. "under ₹200", "any price", "free Kindle books")
  - name: device
    required: false
    hint: Kindle device to deliver to (e.g. "My Kindle Paperwhite", "Kindle app on phone")
---

# Amazon Kindle Ebook Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Book Requirements
- Confirm what book or topic the user wants.
- Get: book title or topic, author (if known), budget, preferred format (Kindle edition).
- Use `ask_user` for missing critical info (book title or topic at minimum).
- If user said "recommend a book on [topic]", will browse bestsellers and top-rated.

### 2. Open Amazon Kindle Store
- Open a NEW tab and navigate to `https://www.amazon.in/kindle-dbs/storefront`.
- Take snapshot. Verify logged in (account name in header or "Hello, [Name]").
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search for Ebook
- Use the search bar, ensure "Kindle Store" department is selected.
- Search for the book title, author, or topic.
- Apply filters: Kindle Edition, Customer Review (4+ stars), Price range (if budget specified).
- Take snapshot. Extract top 3-5 results with: title, author, rating, number of reviews, Kindle price, Kindle Unlimited availability.
- Use `ask_user` (input_type "choice") to let user pick:
  "Atomic Habits by James Clear — 4.7★ (150K reviews) — ₹179 Kindle — #1 Bestseller"

### 4. Review Book Details
- Click the selected book. Take snapshot.
- Summarize: description/synopsis, page count, publication date, ratings breakdown, sample availability.
- Check if available on Kindle Unlimited (free with subscription).
- Check if a free sample is available — mention to user: "A free sample is available if you'd like to preview first."
- If user wants to compare, go back and show another option.

### 5. Select Format & Delivery Device
- Ensure "Kindle Edition" is selected (not paperback/hardcover).
- If multiple Kindle devices are registered, present via `ask_user` (input_type "choice"):
  "Rohit's Kindle Paperwhite", "Kindle for Android", "Kindle for PC"
- Verify the price shown is for Kindle edition.

### 6. Review & Confirm Purchase
- Click "Buy now with 1-Click" preparation area. Take snapshot.
- Use `confirm_action`:
  - Book title and author
  - Format: Kindle Edition
  - Rating and number of reviews
  - Kindle price (vs paperback price for comparison)
  - Delivery to: [device name]
  - Kindle Unlimited available: Yes/No
  - Whispersync (if audiobook companion available): mention it
- Do NOT proceed unless user confirms.

### 7. Payment
- Use `collect_payment`:
  - summary: JSON with book_title, author, format, kindle_price, delivery_device
  - amount_inr: Kindle price
  - description: "Amazon Kindle ebook purchase"
- WAIT for payment confirmation.

### 8. Complete & Confirm
- Complete the purchase on Amazon. Handle OTP via `ask_user` if needed.
- Take snapshot of purchase confirmation / "Thank you" page.
- Report: book title, author, price paid, delivered to device, download status.
- Mention: "Your ebook has been delivered to your [device]. It should appear in your library within a few minutes. If using the Kindle app, sync your library to see it."
- If Whispersync available: "An Audible audiobook companion is available at a discounted price — would you like that too?"

## Site Notes

- Amazon Kindle Store is the largest ebook marketplace — millions of titles available.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator's phone/email.
- Kindle books are often 50-70% cheaper than physical books — mention the savings.
- "1-Click" buying is common on Amazon — be careful not to accidentally purchase. Always confirm first.
- Kindle Unlimited (₹169/month) gives free access to 2M+ books — if user reads a lot, suggest it.
- Free Kindle books exist (classics, promotional) — search "free Kindle books" if user has no budget.
- Amazon frequently has Kindle deals (Great Indian Festival, daily deals) — check for discounts.
- Whispersync lets users switch between reading and listening — mention if audiobook is available.
- Book samples (first few chapters) are free — suggest if user is unsure about purchasing.
- Kindle books are tied to Amazon account, not device — accessible on all registered devices and apps.
- Refund is possible within 7 days if book was purchased by mistake.
- Use `confirm_action` for purchase review, `collect_payment` for checkout. WAIT for user response at each step.
