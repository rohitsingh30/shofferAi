---
name: dream11-fantasy
description: Create fantasy sports team on Dream11 — select match, pick players, set captain/vice-captain, join contest.
triggers:
  - dream11
  - dream 11
  - fantasy cricket
  - fantasy team
  - dream11 team
  - create fantasy team
  - dream11 ipl
  - fantasy football
  - dream11 contest
  - ipl fantasy team
  - dream11 cricket
siteUrl: https://www.dream11.com
requiresAuth: true
params:
  - name: match
    required: true
    hint: Match to create team for (e.g. "CSK vs MI", "IND vs AUS", "Man City vs Liverpool")
  - name: sport
    required: false
    hint: Sport (e.g. "cricket", "football", "basketball", "kabaddi"). Default cricket.
  - name: contestType
    required: false
    hint: Contest type (e.g. "mega contest", "head to head", "small league", "free contest")
  - name: budget
    required: false
    hint: Entry fee budget (e.g. "free", "under 50", "₹100", "₹500")
---

# Dream11 Fantasy Team Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: match (teams), sport type, contest preference (mega/H2H/small league/free), entry fee budget.
- If user says "make a dream11 team", ask which match: "Which match? E.g. CSK vs MI today?"
- Use `ask_user` for missing info.
- Ask if user has specific player preferences or wants AI-recommended team.
- Clarify budget: free contests, small entry (₹25-99), or big contests (₹100+).

### 2. Open Dream11 & Verify Login
- Open a NEW tab and navigate to `https://www.dream11.com`.
- Take snapshot. Verify logged in (check for username, wallet balance in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Check wallet balance — inform user of available balance.

### 3. Select Match
- Browse upcoming matches on Dream11 homepage or navigate to the specific sport section.
- Take snapshot. Find the user's requested match.
- If match not found, show upcoming matches for the sport and let user choose via `ask_user` (input_type "choice"):
  "CSK vs MI — Today 7:30 PM", "RCB vs KKR — Tomorrow 3:30 PM"
- Click the selected match.

### 4. Create Team — Pick Players
- Team creation screen shows available players from both teams with credits/points.
- Take snapshot. Total budget: 100 credits. Must pick 11 players within constraints.
- Constraints vary by sport. For cricket: 1-4 WK, 3-6 BAT, 1-4 AR, 3-6 BOWL.
- Present top player suggestions by role via `ask_user`:
  "WK: Dhoni (8.5cr), Kishan (8.0cr) | BAT: Kohli (10cr), Gill (9.5cr) | ..."
- Let user pick or say "auto-pick best team".
- If auto-pick, select players based on recent form, matchup, and credit balance.
- Ensure total credits used <= 100 and role constraints are met.

### 5. Set Captain & Vice-Captain
- Captain gets 2x points, Vice-Captain gets 1.5x points.
- Present top 3-4 candidates via `ask_user` (input_type "choice"):
  "Captain: Kohli (2x), Dhoni (2x), Jadeja (2x)"
- Set Captain and Vice-Captain as selected.
- Take snapshot of final team composition.

### 6. Review Team & Confirm
- Use `confirm_action`:
  - Match: teams, date, time
  - Team composition: all 11 players with roles, credits used
  - Captain and Vice-Captain
  - Total credits used out of 100
  - Contest type and entry fee
- Do NOT proceed unless user confirms.

### 7. Join Contest & Payment
- Browse available contests: Mega Contest, Head to Head, Small League, Practice/Free.
- Present top contests via `ask_user` (input_type "choice"):
  "Mega Contest — Entry ₹49 — Prize Pool ₹25 Lakhs — 5 Lakh spots"
- If entry fee required and wallet has insufficient balance:
  - Use `collect_payment`:
    - summary: JSON with match, team, contest, entry_fee
    - amount_inr: entry fee amount
    - description: "Dream11 contest entry fee"
  - WAIT for payment confirmation.
- If wallet has sufficient balance, deduct directly after user confirms.

### 8. Complete & Confirm
- Join the selected contest with the created team.
- Take snapshot of contest entry confirmation.
- Report: team name, match details, contest name, entry fee, potential winnings, contest start time.
- Remind: "You can edit your team until the match deadline (toss time). Check Dream11 for live score tracking."
- Mention: "Captain and Vice-Captain selection is crucial — consider changing closer to toss based on playing XI."

## Site Notes

- Dream11 is India's biggest fantasy sports platform — cricket, football, basketball, kabaddi, hockey.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- Dream11 is a skill-based game, not gambling — but real money is involved. Clarify entry fees clearly.
- Team editing deadline is typically at toss time — inform user they can modify team until then.
- Mega contests have huge prize pools but low win probability; H2H and small leagues have better odds.
- Free/practice contests available for every match — good for new users to start.
- Wallet balance includes winnings, deposits, and bonuses — bonuses may have usage restrictions.
- Playing XI announcement (at toss) is critical — always suggest user revisits team after toss.
- Dream11 is restricted in certain Indian states (Assam, Andhra Pradesh, Telangana, etc.) — cannot play from there.
- Use `confirm_action` for team review, `collect_payment` only if wallet top-up needed. WAIT for user response.
