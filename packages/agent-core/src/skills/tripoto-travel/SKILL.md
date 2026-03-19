---
name: tripoto-travel
description: Find travel itineraries on Tripoto — community travel plans, trip ideas, guided packages, blog-based destination research.
triggers:
  - tripoto
  - tripoto travel
  - tripoto itinerary
  - trip plan tripoto
  - tripoto trip
  - travel plan on tripoto
  - tripoto destination
  - tripoto package
siteUrl: https://www.tripoto.com
requiresAuth: true
params:
  - name: destination
    required: true
    hint: Destination (e.g. "Ladakh", "Goa", "Thailand", "Meghalaya")
  - name: duration
    required: false
    hint: Trip duration (e.g. "3 days", "1 week", "5 nights")
  - name: travelMonth
    required: false
    hint: Travel month (e.g. "April 2026", "monsoon", "winter")
  - name: tripType
    required: false
    hint: Trip type (e.g. "solo", "couple", "family", "friends", "adventure", "backpacking")
  - name: budget
    required: false
    hint: Budget preference (e.g. "budget", "mid-range", "luxury", "under 20000")
  - name: interests
    required: false
    hint: Interests (e.g. "trekking", "beaches", "culture", "food", "photography")
---

# Tripoto Travel Itineraries & Packages

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Travel Requirements
- Confirm destination. If missing, use `ask_user`.
- Ask about trip type: solo, couple, family, friends group, backpacking, adventure.
- Note duration preference, travel month, budget level.
- Ask about interests: trekking, beaches, culture, food, nightlife, photography, wildlife.
- Note if user wants a community itinerary (free) or a bookable package (paid).

### 2. Open Tripoto & Verify Login
- Open a NEW tab and navigate to `https://www.tripoto.com`.
- Take snapshot. Dismiss any popups (app install, newsletter signup, login prompts).
- Verify logged in (profile avatar or name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Search Destination
- Use the search bar to search for the destination.
- Take snapshot of search results.
- If Tripoto shows both "Itineraries" and "Packages", note both sections.
- Navigate to the destination page for comprehensive results.

### 4. Browse Community Itineraries
- Find top-rated community itineraries for the destination.
- Filter by: trip type (solo/couple/family), duration, budget, season.
- Extract top 4-5 itineraries with: title, author, duration, places covered, likes/saves count, brief summary.
- Use `ask_user` (input_type "choice") to present options. Format:
  "5-Day Ladakh Road Trip by @traveller — Leh-Nubra-Pangong — 12K saves — Budget Rs 15,000"
- Add "Show Tripoto packages instead" and "Show more itineraries" as options.

### 5. Present Itinerary Details or Packages
- **If community itinerary selected**: Open the itinerary, take snapshot. Present day-by-day plan with places, activities, estimated costs, tips from the author. Use `ask_user` to ask if user wants to save this plan or explore bookable packages.
- **If bookable package selected**: Browse Tripoto's curated packages. Extract: package name, duration, inclusions (stays, meals, transfers, activities), price per person, highlights. Present top 3-4 packages via `ask_user` (input_type "choice").

### 6. Customize & Finalize Plan
- If community itinerary: help user adapt it -- suggest modifications for their dates/budget/preferences.
- If bookable package: click to view full details. Take snapshot.
- Present complete plan including: accommodation suggestions, transport, must-visit places, estimated daily budget.
- Use `ask_user` to confirm the plan or request modifications.

### 7. Book Package (if bookable)
- Proceed to booking for Tripoto packages. Take snapshot.
- Use `confirm_action` to present booking summary:
  - Package name, destination
  - Duration (nights/days)
  - Dates selected
  - Inclusions: stays, meals, transfers, activities, guide
  - Exclusions: items NOT included
  - Number of travellers
  - Price per person, total amount, taxes
  - Cancellation policy
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Fill Details & Payment (if bookable)
- Fill traveller details: name, email, phone, number of travellers.
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with package, destination, dates, travellers, inclusions, total
  - amount_inr: total amount (number)
  - description: "Tripoto travel package"
- STOP and WAIT for payment confirmation.

### 9. Complete & Confirm
- Complete payment (UPI/card/netbanking).
- Handle OTP via `ask_user` if needed.
- Take snapshot of confirmation page.
- Report: booking reference, package name, destination, dates, travellers, total paid.
- If community itinerary (no booking): summarize the final plan and suggest user save it on Tripoto.
- Mention: "Check Tripoto app for offline access to your itinerary."

## Site Notes

- Tripoto is India's largest travel community with millions of user-generated itineraries and bookable packages.
- Operator Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Tripoto has two modes: free community itineraries (blog-style) and paid bookable packages -- clarify what user wants.
- Community itineraries are user-generated and may be outdated -- cross-check key details (prices, timings, accessibility).
- Tripoto packages are curated by travel experts with fixed pricing and verified stays.
- The site shows app-install prompts, newsletter popups, and social login modals -- dismiss all immediately.
- Tripoto "Credits" system rewards content creation -- not relevant for booking, ignore.
- For budget travellers, community itineraries often include hostel/budget stay recommendations.
- Tripoto covers offbeat Indian destinations (Northeast, Himachal, Rajasthan) exceptionally well.
- Weekend getaway itineraries (2-3 days) are very popular -- filter by duration for short trips.
- Session can expire on idle -- if redirected to login, stop and inform user.
- Use `confirm_action` for package booking review, `collect_payment` for payment. WAIT for user response.
