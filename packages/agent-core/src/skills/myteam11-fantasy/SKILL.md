---
name: myteam11-fantasy
description: Create fantasy sports team on MyTeam11 — select match, pick players, set captain/vice-captain, join contest.
triggers:
  - myteam11
  - my team 11
  - myteam11 fantasy
  - myteam11 cricket
  - myteam11 team
  - create team myteam11
  - myteam11 ipl
  - fantasy cricket myteam11
  - myteam11 contest
  - myteam fantasy
siteUrl: https://www.myteam11.com
requiresAuth: true
params:
  - name: match
    required: true
    hint: Match to create team for (e.g. "CSK vs MI", "IND vs ENG", "RCB vs PBKS")
  - name: sport
    required: false
    hint: Sport (e.g. "cricket", "football", "basketball", "kabaddi"). Default cricket.
  - name: contestType
    required: false
    hint: Contest type (e.g. "mega", "head to head", "practice", "free")
  - name: budget
    required: false
    hint: Entry fee budget (e.g. "free", "₹25", "₹100")
---

# MyTeam11 Fantasy Team Creation

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Determine: match (teams), sport type, contest preference, entry fee budget.
- If user says "make a myteam11 team", ask which match and sport.
- Use `ask_user` for missing info: "Which match do you want to play? E.g. CSK vs MI?"
- Ask if user wants to pick players manually or wants a recommended team.
- Clarify contest preference: free practice, small entry, or big prize pool.

### 2. Open MyTeam11 & Verify Login
- Open a NEW tab and navigate to `https://www.myteam11.com`.
- Take snapshot. Verify logged in (check for profile icon, username, or wallet balance).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**
- Note wallet balance for the user.

### 3. Select Match
- Browse upcoming matches on MyTeam11 dashboard.
- Take snapshot. Locate the user's requested match.
- If multiple matches available for same teams (different formats), present via `ask_user` (input_type "choice"):
  "CSK vs MI — T20, IPL — Today 7:30 PM", "IND vs AUS — ODI — Tomorrow 1:30 PM"
- Click the selected match to enter team creation.

### 4. Create Team — Pick Players
- Team creation page shows players from both teams with credit values.
- Take snapshot. Total budget: 100 credits. Must pick 11 players.
- For cricket: constraints are 1-4 WK, 3-6 BAT, 1-4 AR, 3-6 BOWL.
- Present player options by role via `ask_user`:
  "Wicketkeepers: Dhoni (9cr), Samson (8.5cr) | Batsmen: Kohli (10cr), Rohit (9.5cr) | ..."
- Let user pick manually or say "pick best team for me".
- If auto-pick requested, select based on form, matchup stats, and credit optimization.
- Validate: 11 players, within budget, role constraints satisfied.

### 5. Set Captain & Vice-Captain
- Captain earns 2x points, Vice-Captain earns 1.5x points.
- Suggest top picks based on recent performance via `ask_user` (input_type "choice"):
  "Captain: Kohli, Jadeja, Bumrah | Vice-Captain: Dhoni, Hardik, Rashid"
- Set selections. Take snapshot of completed team.

### 6. Review Team & Confirm
- Use `confirm_action`:
  - Match: teams, format (T20/ODI/Test), date, time
  - Full team: 11 players listed with roles and credit values
  - Captain and Vice-Captain
  - Credits used out of 100
  - Contest type and entry fee
- Do NOT proceed unless user confirms.

### 7. Join Contest & Payment
- Browse available contests on MyTeam11 for this match.
- Present top contests via `ask_user` (input_type "choice"):
  "Mega Contest — ₹49 entry — ₹10 Lakh pool", "H2H — ₹25 — Winner takes ₹45", "Free Practice"
- If entry fee exceeds wallet balance:
  - Use `collect_payment`:
    - summary: JSON with match, team, contest, entry_fee
    - amount_inr: entry fee or wallet top-up amount
    - description: "MyTeam11 contest entry fee"
  - WAIT for payment confirmation.
- If wallet covers the fee, confirm and deduct.

### 8. Complete & Confirm
- Join the contest with the created team.
- Take snapshot of confirmation screen.
- Report: team summary, match details, contest name, entry fee, prize pool, contest start time.
- Remind: "You can edit your team until the match deadline. Check back after toss for playing XI updates."
- Mention: "MyTeam11 allows multiple teams per match — you can create another team if you want."

## Site Notes

- MyTeam11 is a popular Indian fantasy sports platform — cricket, football, kabaddi, basketball, volleyball.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) must be signed in on Chrome Debug.
- Do NOT ask user for login credentials — session is pre-authenticated via Chrome Debug profile.
- Session may expire after 30 days — if login wall appears, ask user to re-login manually in Chrome Debug.
- MyTeam11 offers a referral bonus and welcome bonus — check if any bonus credits are available in wallet.
- Team editing deadline is typically 15-30 minutes before match start (varies by contest).
- Free practice contests are available for every match — great for beginners.
- MyTeam11 allows creating multiple teams for the same match — user can join different contests with different teams.
- Withdrawals require PAN card verification — inform user if they win and want to withdraw.
- MyTeam11 is legal in most Indian states but restricted in some (Assam, Odisha, Telangana, Sikkim, Nagaland).
- Use `confirm_action` for team review, `collect_payment` for wallet top-up. WAIT for user response at each step.
