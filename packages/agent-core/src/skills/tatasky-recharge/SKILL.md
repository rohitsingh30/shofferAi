---
name: tatasky-recharge
description: Recharge Tata Play (Tata Sky) DTH. Browse channel packs, add-ons, and recharge.
triggers:
  - tata play recharge
  - tata sky recharge
  - recharge tata play
  - recharge tata sky
  - tata play dth
  - tata sky dth recharge
  - tata play channel pack
  - tata play plan
  - pay tata play bill
  - tata play binge recharge
siteUrl: https://www.tataplay.com
requiresAuth: true
params:
  - name: subscriber_id
    required: true
    hint: Tata Play subscriber ID or registered mobile number (e.g. "1234567890")
  - name: recharge_type
    required: false
    hint: Monthly recharge, channel pack, add-on, or Tata Play Binge (default monthly)
  - name: amount
    required: false
    hint: Preferred recharge amount or pack (e.g. "₹350", "Hindi pack", "sports add-on")
---

# Tata Play (Tata Sky) DTH Recharge

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Get the Tata Play subscriber ID or registered mobile number.
- Determine recharge type: monthly pack recharge, channel pack upgrade, add-on pack, or Tata Play Binge subscription.
- Ask if user wants to continue current pack, upgrade, or change channel selection.
- Check if user wants any specific channels or genre packs (sports, movies, kids, regional).
- Use `ask_user` for any missing details.

### 2. Open Tata Play & Verify Login
- Open a NEW tab and navigate to `https://www.tataplay.com/recharge`.
- Take snapshot. Verify logged in (subscriber name or account dashboard visible).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Enter Subscriber ID & Browse Packs
- Enter subscriber ID or registered mobile number.
- Wait for account details and pack options to load. Tata Play shows:
  - **Current Pack**: active channels and monthly charge
  - **Recommended Packs**: curated channel bundles
  - **Genre Packs**: Hindi, English, Sports, Movies, Kids, Regional, News
  - **Add-on Packs**: extra channel bundles on top of base pack
  - **Tata Play Binge**: OTT combo (Disney+ Hotstar, Amazon Prime, ZEE5, SonyLIV, etc.)
  - **Quick Recharge**: top-up current pack for 1/3/6/12 months
- Extract current pack details: monthly charge, active channels count, balance, expiry date.
- Show top pack/recharge options with: price, channels included, validity.
- Use `ask_user` (input_type "choice") to pick:
  - "₹XXX — [Pack Name] — XX channels — XX days — [includes OTT: ...]"
- Take snapshot after selection.

### 4. Review & Confirm
- Use `confirm_action` with recharge summary:
  - Subscriber ID
  - Current pack and balance
  - Selected recharge/pack details
  - Channels included or changed
  - Any Tata Play Binge add-on
  - Total amount to pay
- Do NOT proceed unless user confirms.

### 5. Payment
- Use `collect_payment`:
  - summary: JSON with subscriber_id, pack_name, channels, validity, total
  - amount_inr: total amount
  - description: "Tata Play DTH recharge"
- WAIT for payment confirmation from user.

### 6. Complete & Confirm
- Complete payment on Tata Play (UPI / card / net banking / wallets).
- Handle OTP via `ask_user` if needed.
- Take snapshot of recharge success page.
- Report to user: transaction ID, subscriber ID, pack recharged, channels count, validity, new expiry date, amount paid.

## Site Notes

- Tata Play (formerly Tata Sky) is India's leading DTH provider — website is well-designed and responsive.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in. Do NOT ask user for credentials.
- Channel packs and pricing change with TRAI regulations — always browse current packs, never hardcode.
- Tata Play Binge is a popular OTT aggregator add-on — bundles multiple streaming apps at a discount.
- Users can customize their pack channel-by-channel (a-la-carte) or pick pre-made bundles — ask preference.
- Regional channel packs vary by language (Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, etc.).
- Account balance shows remaining days of service — if low, recommend immediate recharge to avoid disconnection.
- Long-duration recharges (3/6/12 months) offer significant discounts — mention if applicable.
- The website may show promotional offers or combo deals — highlight these to the user.
- Use `confirm_action` for review, `collect_payment` for checkout. Always WAIT for user response.
