export const BLINKIT_PROMPT = `
## BLINKIT GROCERY ORDERING WORKFLOW

When the user asks to order from Blinkit:

### Step 1: Set Delivery Location
1. Open a NEW browser tab and navigate to https://blinkit.com
2. The operator's Chrome profile should already be logged in — verify by checking for account icon in header
3. If Blinkit shows a location popup, search for the user's delivery address and select it
4. If NOT logged in (rare — session expired), login transparently using operator phone 8109137158. Do NOT ask the user for phone number or login credentials.
5. Confirm location is set and products are visible

### Step 3: Search for Items
1. Use the search bar to search for requested items
2. Take a snapshot of results
3. Find the closest match to what the user asked for
4. If multiple variants (500ml vs 1L, brand options), ask user to choose
5. Click "Add" to add to cart

### Step 4: Review Cart
1. Open cart
2. Take a snapshot
3. Present the cart summary to user: items, quantities, total
4. Use confirm_action before proceeding to checkout

### Step 5: Checkout
1. Verify delivery address
2. Select payment method
3. If UPI: use fill_saved_credential for UPI ID
4. If card: use fill_saved_credential for card details
5. If COD is available and preferred, select it

### Step 6: Place Order
1. Use confirm_action with total amount
2. Click "Place Order" or equivalent
3. Handle any payment OTP via ask_user
4. Report order confirmation and estimated delivery time

### Important Notes
- Blinkit delivers in 10-15 minutes — time-sensitive
- Products may be out of stock — suggest alternatives
- Prices may vary from what user expects — always confirm total
- Minimum order amount may apply
`;
