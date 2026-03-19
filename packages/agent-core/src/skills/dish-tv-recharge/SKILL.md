---
name: dish-tv-recharge
description: Recharge Dish TV DTH. Browse channel packs, select plan, and pay online.
triggers:
  - dish tv recharge
  - recharge dish tv
  - dish tv dth
  - dish tv plan
  - dish tv channel pack
  - pay dish tv bill
  - d2h recharge
  - dish tv d2h
  - dish tv pack
  - recharge my dish tv
siteUrl: https://www.dishtv.in
requiresAuth: true
params:
  - name: subscriber_id
    required: true
    hint: Dish TV subscriber ID or registered mobile number (e.g. "01234567890")
  - name: recharge_type
    required: false
    hint: Monthly recharge, channel pack, or add-on (default monthly)
  - name: amount
    required: false
    hint: Preferred recharge amount or pack (e.g. "₹300", "Hindi pack", "sports pack")
---

# Dish TV DTH Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps


### Step 0: Collect recharge/bill details
Before opening the browser, call `ask_user` with `input_type: "layout"` and sections:
1. **number** (type: "text", required): Account number or mobile number
2. **plan** (type: "text", collapsed): Specific plan or amount (optional — can browse plans on site)

**CRITICAL**: Do NOT open the browser without the account/mobile number.
### 1. Gather Requirements
- Get the Dish TV subscriber ID (viewing card number) or registered mobile number.
- Determine recharge type: monthly pack recharge, channel pack change, add-on pack, or top-up.
- Ask if user wants to continue current pack, switch packs, or add extra channels.
- Check if user wants specific genre packs (sports, movies, kids, regional, HD upgrade).
- Use `ask_user` for any missing details.

### 2. Open Dish TV & Verify Login
- Open a NEW tab and navigate to `https://www.dishtv.in/recharge.aspx`.
- Take snapshot. Verify logged in (subscriber name or My Account dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Subscriber ID & Browse Packs
- Enter subscriber ID or registered mobile number.
- Wait for account details and pack listing to load. Dish TV shows:
  - **Current Pack**: active channels, monthly charge, expiry date
  - **Super Family**: popular Hindi entertainment + news combo packs
  - **Sports Packs**: Star Sports, Sony Sports, cricket packages
  - **HD Packs**: HD channel bundles
  - **Regional Packs**: Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati
  - **Kids Packs**: cartoon and children's channel bundles
  - **Quick Recharge**: top-up current pack by amount or duration
- Extract current account details: monthly charge, active channels, balance, last recharge date, expiry.
- Show top pack options with: price, channels, validity, HD/SD.
- Use `ask_user` (input_type "choice") to pick:
  - "₹XXX — [Pack Name] — XX channels — XX days — [HD/SD]"
- Take snapshot after selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge summary:
  - Subscriber ID
  - Current pack and balance/expiry
  - Selected recharge or new pack details
  - Number of channels included
  - Any promotional discount or offer
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with subscriber_id, pack_name, channels, validity, total
  - amount_inr: total amount
  - description: "Dish TV DTH recharge"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Dish TV (UPI / card / net banking / wallets).
- Handle OTP via `ask_user` if needed.
- Take snapshot of recharge success page.
- Report to user: transaction ID, subscriber ID, pack recharged, channels count, new expiry date, amount paid.

## Site Notes

- Dish TV is one of India's major DTH operators — also operates the D2H brand (merged).
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Dish TV and D2H were merged — both subscriber IDs work on the same portal now.
- Channel packs follow TRAI pricing regulations — always browse current packs on the site.
- Dish TV website can sometimes be slow — wait extra time for pages and payment gateway to load.
- Users can customize channels a-la-carte or pick pre-made genre packs — ask preference.
- HD channels cost more than SD — clarify if user wants HD or SD versions.
- Long-term recharges (3/6/12 months) may offer discounts — mention if available.
- If account is expired/disconnected, a higher recharge amount may be needed to reactivate — inform user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
