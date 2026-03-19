---
name: sportskeeda-news
description: Get sports updates, live scores, schedules, and news on Sportskeeda — cricket, football, IPL, FIFA, NBA results.
triggers:
  - sportskeeda
  - sports news
  - live cricket score
  - ipl score
  - football scores
  - match schedule
  - sports update
  - cricket news
  - ipl schedule
  - live score update
  - match results today
siteUrl: https://www.sportskeeda.com
requiresAuth: false
params:
  - name: query
    required: true
    hint: What to look up (e.g. "IPL points table", "CSK vs MI score", "Premier League standings", "today's cricket scores")
  - name: sport
    required: false
    hint: Sport (e.g. "cricket", "football", "NBA", "WWE", "tennis", "F1")
  - name: league
    required: false
    hint: League or tournament (e.g. "IPL", "Premier League", "Champions League", "NBA", "WTC")
---

# Sportskeeda Sports Updates & Live Scores

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Understand Request
- Determine: what info the user needs — live score, match schedule, points table, news, player stats, results.
- If user says "what's the score", ask which match or sport.
- Use `ask_user` for missing info: "Which match or sport? E.g. IPL CSK vs MI, Premier League, NBA?"
- Clarify if user wants: live score, upcoming schedule, recent results, points table, or general news.

### 2. Open Sportskeeda
- Open a NEW tab and navigate to `https://www.sportskeeda.com`.
- Take snapshot. No login required for reading news and scores, but verify page loaded correctly.
- If logged in, that's fine. If not logged in, proceed anyway — Sportskeeda is freely accessible.
- **Note**: Sportskeeda does not require authentication for browsing scores and news.

### 3. Navigate to Relevant Section
- Based on the sport and query, navigate to the correct section:
  - Cricket: `/cricket` or `/cricket/ipl` for IPL-specific content
  - Football: `/football` for Premier League, La Liga, Champions League, ISL
  - NBA: `/basketball` or `/nba`
  - WWE: `/wwe`
  - Tennis, F1, etc.: respective sport sections
- Take snapshot of the section page.

### 4. Get Live Scores (if requested)
- Navigate to the live scores section or scorecard page.
- Take snapshot. Extract: match status, teams, current score, overs/time, key stats.
- For cricket: batting team score, wickets, overs, current batsmen, current bowler, recent overs.
- For football: score, minute, goalscorers, possession, shots.
- Present live score summary to user via message.
- If user wants continuous updates, inform them to check back or follow on the app.

### 5. Get Schedule / Upcoming Matches (if requested)
- Navigate to the schedule or fixtures section for the relevant league/tournament.
- Take snapshot. Extract upcoming matches: teams, date, time, venue.
- Present top 5-10 upcoming matches via `ask_user` (input_type "choice") if user wants details on a specific match.
- Include: match date, time (IST), venue, broadcast info (TV channel, streaming platform).

### 6. Get Points Table / Standings (if requested)
- Navigate to points table or standings page for the league.
- Take snapshot. Extract: team rankings, points, wins, losses, NRR (cricket) / GD (football).
- Present the full standings table to user.
- Highlight the user's preferred team position if known.

### 7. Get News / Analysis (if requested)
- Browse top news articles or search for specific news.
- Take snapshot. Extract top 5 headlines: title, summary, date, author.
- Present headlines to user. If user wants to read an article, click and summarize key points.
- For player stats or records, navigate to the player profile page and extract relevant data.

### 8. Compile & Report
- Take final snapshot of the most relevant page.
- Compile all requested information into a clear summary:
  - Live scores with key stats
  - Schedule with dates, times, venues
  - Points table / standings
  - Top news headlines and summaries
- Report findings to user in a well-formatted message.
- Suggest: "Want me to check anything else? Upcoming fixtures, player stats, or book match tickets on BookMyShow?"

## Site Notes

- Sportskeeda is one of India's top sports news and scores platforms — cricket, football, NBA, WWE, tennis, and more.
- Chrome profile `Profile 3` (rsinghtomar3011@gmail.com) is used but authentication is NOT required for Sportskeeda.
- Do NOT ask user for login credentials — Sportskeeda content is freely accessible without login.
- Session/login is irrelevant for this skill — if any login popup appears, dismiss it and continue browsing.
- Sportskeeda may show cookie consent or notification popups — dismiss them to access content.
- Live scores update every few seconds on the page — take a fresh snapshot for the latest data.
- IPL season (March-May) has the most cricket traffic — schedules, scores, and fantasy tips are prominent.
- Sportskeeda also has fantasy cricket tips — can cross-reference with Dream11/MyTeam11 skills.
- Ad popups and interstitials are common — close them before taking snapshots for clean data extraction.
- All times on Sportskeeda are in IST (Indian Standard Time) — no timezone conversion needed for Indian users.
- For booking match tickets after checking schedule, suggest the bookmyshow-sports skill.
- Use `ask_user` only when clarification is needed. This is primarily an information retrieval skill, not a transactional one.
