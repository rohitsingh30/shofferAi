---
name: tatvachinh-astrology
description: Book astrology consultation — kundli reading, horoscope matching, vastu consultation, or live session with verified astrologers.
triggers:
  - astrology consultation
  - book astrologer
  - kundli reading
  - horoscope matching
  - vastu consultation
  - astrology booking
  - talk to astrologer
  - online astrology
  - jyotish consultation
  - kundali matching
  - vedic astrology
  - pandit consultation online
siteUrl: https://www.astrotalk.com
requiresAuth: true
params:
  - name: consultation_type
    required: false
    hint: Type of consultation (e.g. "kundli reading", "horoscope matching", "vastu", "career", "marriage", "health")
  - name: mode
    required: false
    hint: Consultation mode (e.g. "chat", "call", "video call")
  - name: language
    required: false
    hint: Preferred language (e.g. "Hindi", "English", "Tamil", "Telugu")
  - name: budget
    required: false
    hint: Budget per minute or total (e.g. "₹10-20/min", "under ₹500 total")
---

# Astrology Consultation Booking

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine what type of astrology service the user wants via `ask_user` (input_type "choice"):
  - "Kundli / Birth Chart Reading — detailed life prediction"
  - "Horoscope Matching (Kundli Milan) — marriage compatibility"
  - "Vastu Consultation — home/office vastu analysis"
  - "Career & Finance — job, business, investment guidance"
  - "Relationship & Marriage — love life, marriage timing"
  - "Health & Wellness — health-related astrological guidance"
  - "Gemstone / Remedy Suggestion — personalized remedies"
- Ask preferred consultation mode via `ask_user` (input_type "choice"):
  - "Chat — text-based consultation"
  - "Call — voice call with astrologer"
  - "Video Call — face-to-face video session"
- Ask language preference if not specified.
- Ask budget preference if user has one.
- For kundli reading, collect birth details via `ask_user`:
  - Date of birth, time of birth, place of birth.
- For horoscope matching, collect both parties' birth details.

### 2. Open Astrology Platform & Verify Login
- Open a NEW tab and navigate to `https://www.astrotalk.com`.
- Take snapshot. Check if logged in (profile icon or user greeting in header).
- If NOT logged in, login transparently using operator credentials. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Dismiss any pop-ups, promotional banners, or free consultation offers.
- If AstroTalk is unavailable, try alternative platforms like AstroSage or Anytime Astro.

### 3. Browse & Select Astrologer
- Navigate to the relevant section based on consultation type and mode.
- Apply filters:
  - Language: as specified by user
  - Expertise: matching consultation type (Vedic, KP, Numerology, Vastu)
  - Price range: matching budget
  - Rating: 4+ stars preferred
  - Status: Online / Available Now
- Take snapshot of astrologer listings.
- Present top 3-5 astrologers to user via `ask_user` (input_type "choice") with:
  - Astrologer name and photo description
  - Expertise areas
  - Experience (years)
  - Rating and number of consultations
  - Price per minute (₹)
  - Languages spoken
  - Online/offline status
- Let user select an astrologer.

### 4. Configure Consultation
- Navigate to the selected astrologer's profile page.
- Take snapshot of the astrologer's profile with reviews and specializations.
- Show user the full details:
  - Astrologer bio and qualifications
  - Recent reviews (top 2-3)
  - Price per minute for selected mode
  - Estimated session duration and cost
  - Availability / wait time
- If astrologer is busy, offer to:
  - Wait in queue
  - Select another available astrologer
  - Schedule for later
- If scheduling for later, select date and time via `ask_user`.
- Enter birth details if required for the consultation type.
- Take snapshot with all details configured.

### 5. Confirm Consultation
- Use `confirm_action` with consultation summary:
  - Astrologer name
  - Consultation type
  - Mode: chat / call / video
  - Price: ₹X per minute
  - Estimated duration: X minutes
  - Estimated cost: ₹X,XXX
  - Language: selected language
  - Scheduled time (if applicable)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 6. Payment (Wallet Recharge)
- Use `collect_payment`:
  - summary: JSON with astrologer_name, consultation_type, mode, price_per_min, estimated_duration, estimated_cost, language
  - amount_inr: estimated total cost (wallet recharge amount)
  - description: "Astrology consultation"
- STOP and WAIT for payment confirmation.

### 7. Start Consultation & Confirm
- Recharge wallet on the platform with the confirmed amount.
- Handle OTP via `ask_user` if needed.
- Initiate the consultation (chat/call/video) with the selected astrologer.
- Take snapshot of consultation initiation / queue screen.
- Report to user: astrologer name, mode, session started/scheduled, wallet balance, how to end session.
- Mention: "The consultation will deduct from wallet balance per minute. You can end the session anytime."

## Site Notes

- AstroTalk is India's leading astrology consultation platform with 10,000+ verified astrologers.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Most platforms use a wallet/recharge model — user pays upfront and balance is deducted per minute during consultation.
- Prices range from ₹5/min to ₹100+/min depending on astrologer's experience and rating.
- First-time users may get a free or discounted consultation (5 min free) — check for offers.
- Birth time accuracy is critical for kundli readings — encourage user to provide exact time if possible.
- Astrologers are rated by users — prefer 4+ star rated with 1000+ consultations for quality.
- Sessions can be ended anytime — unused wallet balance is retained for future use.
- Chat history and call recordings are typically saved in the account for future reference.
- Use `confirm_action` for booking review, `collect_payment` for wallet recharge. Always WAIT for user response.
