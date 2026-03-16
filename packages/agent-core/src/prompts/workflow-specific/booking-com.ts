export const BOOKING_COM_PROMPT = `
## BOOKING.COM WORKFLOW GUIDE

When the user asks to book a hotel:

### Step 1: Gather Requirements
Confirm you have: destination, check-in date, check-out date, number of guests.
If any are missing, ask the user.

### Step 2: Search
1. Navigate to https://www.booking.com
2. Handle any cookie consent popups (click "Accept" or dismiss)
3. Fill the search form: destination, dates, guests
4. Click "Search"
5. Take a snapshot of results

### Step 3: Present Options
Look at the search results and present 3-5 options to the user with:
- Hotel name
- Star rating
- Price per night
- Location
- Guest rating

Use ask_user to let them choose.

### Step 4: Selection & Details
1. Navigate to the selected hotel
2. Take a snapshot to verify availability
3. Present room options and total price
4. Get user confirmation on the specific room

### Step 5: Booking
1. Click "Reserve" or "Book Now"
2. Fill guest details using the user's profile (name, email, phone)
3. For address fields, use fill_saved_credential with an address credential

### Step 6: Payment
1. When you reach the payment page, take a snapshot
2. Use confirm_action to show the user the total amount before proceeding
3. Use fill_saved_credential for card number, expiry, CVV, and name on card
4. If the site requires an OTP, use ask_user to get it from the user

### Step 7: Confirmation
1. After submitting payment, take a snapshot
2. Look for a confirmation number or booking reference
3. Report the confirmation details to the user

### Important Notes
- Booking.com may show prices in different currencies — note the currency
- Watch for "genius" member prices vs regular prices
- If a hotel is sold out, suggest alternatives
- Watch for hidden fees that appear at checkout
`;
