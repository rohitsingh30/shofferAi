---
name: shutterstock-images
description: Search and purchase stock images on Shutterstock — find photos, vectors, illustrations, license and download high-resolution assets.
triggers:
  - shutterstock
  - buy stock images
  - stock photos
  - shutterstock images
  - download stock photo
  - licensed images
  - stock photography
  - shutterstock download
siteUrl: https://www.shutterstock.com
requiresAuth: true
params:
  - name: search_query
    required: true
    hint: What images to search for (e.g. "modern office workspace", "Indian family celebration", "technology abstract background")
  - name: image_type
    required: false
    hint: Type of image (e.g. "photo", "vector", "illustration", "editorial")
  - name: quantity
    required: false
    hint: How many images needed (e.g. "1", "5", "10 images pack")
  - name: usage
    required: false
    hint: How images will be used (e.g. "website", "social media", "print", "commercial project")
---

# Shutterstock Stock Image Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify a search query, use `ask_user` (input_type "freetext"): "What kind of images are you looking for? Describe the subject, mood, and style (e.g. 'happy Indian family at dinner table', 'minimalist tech background')."
- If image type not specified, use `ask_user` (input_type "choice"): "What type of image?" with options "Photo", "Vector/Illustration", "Editorial", "Any type".
- If quantity not specified, use `ask_user` (input_type "choice"): "How many images do you need?" with options "Just 1 image", "2-5 images", "5-10 images", "10+ images (subscription recommended)".
- If usage not specified, use `ask_user` (input_type "choice"): "How will you use these images?" with options "Website / Blog", "Social Media", "Print (brochure, poster)", "Commercial Project", "Personal Use".

### 2. Open Shutterstock in New Tab
- Open a NEW tab and navigate to `https://www.shutterstock.com`.
- Take a snapshot to see the homepage.
- Dismiss any promotional popups, cookie consent banners, free trial offers, or newsletter prompts.
- Verify the search bar is visible and ready for input.

### 3. Verify Login
- Look for a profile icon, username, or "My Account" in the top-right header.
- If signed in: check subscription status (if any active plan). Proceed to search.
- If NOT signed in: Click "Log In", attempt login with rsinghtomar3011@gmail.com.
- If 2FA or email verification appears, use `ask_user`: "Shutterstock needs verification. Please share the code sent to your email."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Shutterstock in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search & Filter Images
- Type the search query in the search bar and press Enter.
- Apply filters based on requirements:
  - Image type: Photos, Vectors, Illustrations, or Editorial.
  - Orientation: Horizontal, Vertical, Square (based on usage).
  - Color: filter by dominant color if user has preference.
  - People: With people, Without people, Number of people.
  - Sort by: "Relevance" or "Newest" or "Popular".
  - Safe search: ON (unless user specifies otherwise).
- Take snapshot of the search results page.
- If results are poor, try alternative search terms and inform user.

### 5. Present Image Options
- Scan results. Extract top 8-10 images with:
  - Image ID and thumbnail description
  - Image type (photo, vector, illustration)
  - Contributor name
  - Whether it is editorial-only (cannot be used commercially)
  - Resolution available (standard vs enhanced)
- Take snapshot showing the top results clearly.
- Describe the top images to user via `ask_user` (input_type "choice"):
  - Brief description of each image
  - Whether it is a photo, vector, or illustration
  - Any usage restrictions
  - "Show me more options" and "Refine search" options
- Allow user to select one or multiple images.

### 6. Select License & Download Options
- Click on each selected image to view the detail page.
- Take snapshot of the image detail page with licensing options.
- Present license options via `ask_user` (input_type "choice"):
  - **Standard License**: for web, social media, up to 500k prints — price
  - **Enhanced License**: for unlimited prints, merchandise, templates — price
  - Subscription vs on-demand pricing comparison
- If user needs multiple images, recommend a subscription plan:
  - Present plan options: 10 images/month, 50 images/month, 350 images/month, 750 images/month
  - Annual vs monthly pricing
- Add selected images to cart with chosen license type.
- Take snapshot of the cart.

### 7. Review Cart & Confirm
- Navigate to the cart/checkout page.
- Take snapshot of the complete order.
- Use `confirm_action` to present order summary:
  - Number of images selected
  - Description of each image
  - License type for each (Standard/Enhanced)
  - Individual prices and total
  - Usage rights summary
  - Download format (JPEG, TIFF, EPS for vectors)
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment & Download
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with images selected (IDs, descriptions), license types, individual prices, total USD and INR
  - amount_inr: total amount converted to INR (number)
  - description: "Shutterstock image purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Shutterstock using available payment method.
- Handle payment OTP via `ask_user` if needed.
- After payment, download the high-resolution images.
- Take snapshot of the download/purchase confirmation page.

### 9. Delivery Confirmation
- Take snapshot of the download history showing purchased images.
- Report to user:
  - Number of images purchased
  - Image descriptions and IDs
  - License type (Standard/Enhanced)
  - Total amount paid
  - Download links or confirmation that files are in Shutterstock library
  - License certificate location (for legal compliance)
  - "Images are available in your Shutterstock downloads. Each comes with a license certificate for commercial use."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Shutterstock prices are in USD — convert to INR for `collect_payment` using approximate market rate.
- Editorial images CANNOT be used for commercial purposes (ads, products) — only news, blogs, education. Warn user.
- Shutterstock offers subscriptions (monthly image packs) which are much cheaper per image than on-demand — recommend for bulk purchases.
- Enhanced license is needed for merchandise, templates for resale, or print runs over 500k — clarify usage.
- Shutterstock may show free trial or subscription upsells — present to user only if relevant, do not auto-subscribe.
- Session can expire — if login page appears, STOP and inform user.
- Shutterstock uses React — always use Playwright fill/type methods.
- Use `confirm_action` for cart review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Downloaded images come with a license certificate — remind user to save it for compliance.
- Similar images search (reverse image search) is available — offer it if user has a reference image.
- Shutterstock AI image generation is also available — mention if user wants custom/unique images.
- Vector files come in EPS format — user needs Illustrator or Inkscape to edit them.
