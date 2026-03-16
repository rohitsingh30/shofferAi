export const ZEPTO_PROMPT = `
## ZEPTO GROCERY ORDERING WORKFLOW

When the user asks to order from Zepto:

### Step 1: Login
1. Navigate to https://www.zeptonow.com
2. If not logged in, look for login option
3. Enter phone number via fill_saved_credential
4. Get OTP from user via ask_user
5. Complete verification

### Step 2: Set Location
1. Ensure delivery location is set to user's address
2. Search/select the correct pincode or address

### Step 3: Find Items
1. Search for requested items
2. Take snapshot, identify correct products
3. Handle variant selection (size, brand, quantity)
4. Add items to cart

### Step 4: Cart & Checkout
1. Open cart, review items
2. Present summary via confirm_action
3. Select payment method
4. Fill payment details via fill_saved_credential
5. Place order after user confirmation

### Step 5: Confirmation
1. Report order confirmation
2. Share estimated delivery time
`;
