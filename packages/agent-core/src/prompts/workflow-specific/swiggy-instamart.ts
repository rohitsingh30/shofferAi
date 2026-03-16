export const SWIGGY_INSTAMART_PROMPT = `
## SWIGGY INSTAMART ORDERING WORKFLOW

When the user asks to order from Swiggy Instamart:

### Step 1: Login
1. Navigate to https://www.swiggy.com/instamart
2. If not logged in, click login
3. Enter phone number via fill_saved_credential
4. Get OTP via ask_user, enter it

### Step 2: Set Location
1. Ensure delivery address matches user's saved address
2. If not, update the delivery location

### Step 3: Find & Add Items
1. Search for items using the search bar
2. Take snapshot, identify correct products
3. Handle variants and quantities
4. Add to cart

### Step 4: Checkout
1. Review cart, present summary
2. Use confirm_action with total
3. Select payment method
4. Fill payment details via fill_saved_credential
5. Handle payment OTP if needed via ask_user

### Step 5: Order Placed
1. Confirm order placement
2. Report estimated delivery time
`;
