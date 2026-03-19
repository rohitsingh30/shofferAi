---
name: olx-sell
description: Sell items on OLX — create listing with photos, price, description, manage buyer enquiries.
triggers:
  - olx
  - sell on olx
  - olx listing
  - post ad olx
  - sell old stuff
  - sell second hand
  - sell used items
  - olx sell phone
  - olx sell car
  - olx sell furniture
siteUrl: https://www.olx.in
requiresAuth: true
params:
  - name: item
    required: true
    hint: What to sell (e.g. "iPhone 13", "Honda City 2019", "sofa set", "Samsung TV 55 inch", "Royal Enfield Classic 350")
  - name: price
    required: false
    hint: Asking price (e.g. "15000", "negotiable around 8 lakh", "best offer")
  - name: location
    required: false
    hint: City/area for listing (e.g. "Bangalore", "Mumbai Andheri")
---

# OLX Sell Items

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- Confirm what the user wants to sell. OLX supports:
  - **Mobiles**: phones, tablets, accessories
  - **Electronics**: TV, laptop, camera, gaming, audio
  - **Vehicles**: cars, bikes, scooters, bicycles, commercial vehicles
  - **Furniture**: sofa, bed, dining table, wardrobe, office furniture
  - **Real Estate**: houses, apartments, PG, plots (for sale or rent)
  - **Fashion**: clothing, shoes, watches, accessories
  - **Books/Sports/Hobbies**: books, musical instruments, gym equipment
  - **Jobs/Services**: listings for services
- Get item details:
  - Brand, model, variant (for electronics/vehicles)
  - Age/year of purchase
  - Condition (excellent, good, fair, needs repair)
  - Reason for selling
  - Original price vs asking price
- If no price set, help user determine fair market price.
- If vague, use `ask_user` to collect complete item details.

### 2. Open OLX in a NEW Tab
- Open a NEW tab and navigate to `https://www.olx.in`.
- Take snapshot. Set city/location.
- Verify logged in (profile name visible in header).
- If NOT logged in, login transparently. Do NOT ask user for credentials.
- **If session expired, STOP and tell user: "Session expired, please re-login in Chrome Debug."**

### 3. Create New Listing
- Click "Sell" or "Post Free Ad" button.
- Select the appropriate category and sub-category.
- Take snapshot of the ad posting form.
- Fill in required fields:
  - **Title**: concise, keyword-rich (e.g. "iPhone 14 Pro 256GB Space Black - Excellent Condition")
  - **Description**: detailed write-up including:
    - Item condition and age
    - Key specs/features
    - Reason for selling
    - What's included (accessories, box, warranty)
    - "Price is [firm/negotiable]"
  - **Price**: user's asking price
  - **Location**: user's city and locality
  - **Phone number**: operator's (auto-filled from profile)
- For vehicles: fill additional fields (year, km driven, fuel type, transmission, number of owners).
- For electronics: fill brand, model, condition.

### 4. Add Photos
- OLX allows up to 12-20 photos per listing.
- Use `ask_user` to get photos from user:
  - "Please share photos of your [item]. Good photos increase response rate. Include: front, back, sides, any damage, accessories."
- Upload photos to the listing.
- Take snapshot of listing with photos.
- If user cannot share photos right now, proceed without and mention they can add later.

### 5. Review Listing
- Take snapshot of the complete listing preview.
- Use `confirm_action` to present listing summary:
  - Title
  - Category
  - Description (summarized)
  - Price
  - Location
  - Number of photos uploaded
  - Contact number shown
- Do NOT publish unless user confirms. If changes needed, edit accordingly.

### 6. Publish Listing
- Click "Post" or "Submit" to publish the ad.
- Take snapshot of the published listing.
- Handle any verification (OTP, captcha) via `ask_user` if needed.
- Note: OLX may have a review period before listing goes live.
- For premium listings (if user wants more visibility):
  - Use `collect_payment`:
    - summary: JSON with item, price, listing type (featured/urgent/premium)
    - amount_inr: premium listing fee
    - description: "OLX premium listing"
  - STOP and WAIT for payment confirmation.

### 7. Listing Confirmation
- Take snapshot of final published listing.
- Report: ad ID/URL, title, category, price, location, number of photos, listing status (live/under review).
- Mention tips: "Your ad is live. Buyers will contact via OLX chat or phone. Tips: respond quickly, meet in public places, verify payment before handing over item, don't share OTP with anyone."
- Warn: "Beware of scammers who ask for advance payment or shipping. Prefer local face-to-face transactions."

## Site Notes

- OLX is India's largest classifieds platform. Free to list, millions of daily visitors.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) must be logged in. Do NOT ask user for credentials.
- If session expired, login transparently. OTP goes to operator phone.
- Free listings get decent visibility. Featured/premium listings cost extra but get 10x more views.
- Good photos are critical — listings with clear photos get 5x more enquiries.
- Title optimization: include brand, model, key spec, condition. Buyers search by keywords.
- Pricing strategy: set price 10-15% higher than target to allow negotiation room.
- OLX chat is preferred — avoid sharing personal phone number in description.
- For vehicles: mention service history, insurance validity, number of owners, test drive availability.
- Scam awareness: never share OTP, never accept advance via UPI without verification, meet in public.
- OLX does not handle payments — all transactions are between buyer and seller directly.
- Relisting: if ad expires (usually 30-60 days), user can relist for free.
- Use `confirm_action` before publishing the listing. WAIT for user response at each step.
