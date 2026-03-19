---
name: envato-templates
description: Buy themes, templates, and digital assets on Envato/ThemeForest — WordPress themes, HTML templates, plugins, graphics, and code.
triggers:
  - envato
  - themeforest
  - buy wordpress theme
  - html template
  - envato template
  - themeforest theme
  - codecanyon plugin
  - buy website template
siteUrl: https://themeforest.net
requiresAuth: true
params:
  - name: asset_type
    required: true
    hint: Type of asset (e.g. "WordPress theme", "HTML template", "plugin", "graphic template", "video template")
  - name: category
    required: false
    hint: Specific category (e.g. "business", "e-commerce", "portfolio", "blog", "landing page")
  - name: budget
    required: false
    hint: Budget range in USD (e.g. "under $50", "$30-60", "under $100")
  - name: features
    required: false
    hint: Required features (e.g. "WooCommerce compatible", "responsive", "page builder included", "dark mode")
---

# Envato / ThemeForest Template Purchase

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Requirements
- BEFORE opening the browser, check what the user provided.
- If user did not specify asset type, use `ask_user` (input_type "choice"): "What type of digital asset do you need?" with options "WordPress Theme", "HTML Template", "WordPress Plugin", "Shopify Theme", "Presentation Template", "Graphic Template", "Video Template", "Code Script".
- If category not specified, use `ask_user` (input_type "choice"): "What category?" with options "Business / Corporate", "E-commerce / Shop", "Portfolio / Creative", "Blog / Magazine", "Landing Page", "Admin Dashboard", "Multipurpose", "Other".
- If features not specified, use `ask_user` (input_type "freetext"): "Any specific features you need? (e.g. WooCommerce support, page builder, dark mode, RTL support, one-click demo import)"
- If budget not specified, use `ask_user` (input_type "freetext"): "What's your budget for this template/theme? (Most WordPress themes are $30-80)"

### 2. Open ThemeForest in New Tab
- Open a NEW tab and navigate to the appropriate Envato marketplace:
  - WordPress/HTML themes: `https://themeforest.net`
  - Plugins/code: `https://codecanyon.net`
  - Graphics: `https://graphicriver.net`
  - Video: `https://videohive.net`
- Take a snapshot to see the marketplace homepage.
- Dismiss any promotional banners, cookie consent, seasonal sales popups, or Envato Elements upsells.
- Verify the search bar and category navigation are visible.

### 3. Verify Login
- Look for a profile avatar, username, or account dropdown in the top-right.
- If signed in: proceed to search.
- If NOT signed in: Click "Sign In", attempt login with rsinghtomar3011@gmail.com.
- If 2FA or email verification appears, use `ask_user`: "Envato needs verification. Please share the code sent to your email."
- **If session expired or wrong account, STOP and tell user: "Session expired, please re-login to Envato in Chrome Debug."**
- Take snapshot to confirm logged-in state.

### 4. Search & Filter Templates
- Use the search bar to enter the asset type and category.
- Apply filters based on requirements:
  - Category: WordPress, HTML, Shopify, etc.
  - Price range: set min/max.
  - Rating: 4 stars and above.
  - Sales: sort by "Best Sellers" or "Best Rated".
  - Compatibility: WordPress version, WooCommerce, Elementor, etc.
  - Last updated: prefer recently updated themes (within 6 months).
  - Tags: specific features (responsive, retina, dark mode, RTL).
- Take snapshot of the filtered search results.

### 5. Present Template Options
- Scan results. Extract top 5-7 templates with:
  - Template name and thumbnail
  - Author name and rating (Power Elite, Elite, etc.)
  - Price
  - Total sales count
  - Average rating and number of reviews
  - Last updated date
  - Key features (page builder, demo sites, responsive)
- Use `ask_user` (input_type "choice") to let user pick a template.
- If none are suitable, offer to adjust filters or search terms.

### 6. Review Template Details
- Click on the selected template to open the item page.
- Take snapshot of the template detail page.
- Review and present to user:
  - Full feature list
  - Number of demo sites available
  - Browser and device compatibility
  - Included page builder (Elementor, WPBakery, Gutenberg)
  - Documentation and support included (6 months by default)
  - Live preview link (mention user can browse it)
- Check recent reviews and comments for common issues.
- Use `ask_user` (input_type "choice"): "Would you like to:" with options "Buy this template", "View live preview first", "See more options".
- If user wants to preview, navigate to the demo and take snapshots of key pages.

### 7. Select License & Confirm
- Present license options via `ask_user` (input_type "choice"):
  - **Regular License**: for one end product, free or paid for end user — price
  - **Extended License**: for SaaS or paid products, multiple end users — price
- Review cart/checkout page.
- Take snapshot of the order summary.
- Use `confirm_action` to present:
  - Template name and author
  - License type selected
  - Price (item price + buyer fee)
  - Support included (6 months standard, 12 months extended)
  - What you get: theme files, documentation, updates, support
  - Total amount payable
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 8. Payment & Download
- Use `collect_payment` to collect via Razorpay:
  - summary: JSON with template name, author, license type, price, buyer fee, total USD and INR
  - amount_inr: total amount converted to INR (number)
  - description: "Envato/ThemeForest template purchase"
- STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- Complete payment on Envato using available payment method (card, PayPal).
- Handle payment OTP via `ask_user` if needed.
- After payment, click "Download" to get the template files.
- Take snapshot of the download/purchase confirmation.

### 9. Delivery Confirmation
- Take snapshot of the download page.
- Report to user:
  - Template name and version downloaded
  - License type and purchase code
  - Author and support expiry date
  - Download link location
  - "Files are in your Envato downloads. The ZIP contains the theme, documentation, and child theme. Use the purchase code when activating the theme in WordPress."
  - Recommend: "Install the theme via WordPress Admin > Appearance > Themes > Add New > Upload Theme."

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- Envato prices are in USD — convert to INR for `collect_payment` using approximate market rate.
- Regular License is for most use cases; Extended License is only needed for SaaS/paid products — clarify with user.
- ThemeForest themes include 6 months of author support by default — extended support (12 months) costs extra.
- Check "Last Updated" date — themes not updated in 12+ months may have compatibility issues with latest WordPress.
- Envato Elements is a separate subscription service — do not confuse with ThemeForest marketplace purchases.
- Envato may show Elements subscription upsells — dismiss unless user specifically wants a subscription.
- Session can expire — if login page appears, STOP and inform user.
- Envato uses standard HTML/React — use Playwright fill/type methods.
- Use `confirm_action` for order review, `collect_payment` for actual payment. WAIT for user response. Do NOT auto-proceed.
- Purchase code is unique per purchase — needed for theme activation and support requests.
- Nulled/pirated themes are a security risk — always purchase through official Envato marketplace.
- Some themes require specific PHP version or hosting specs — mention if stated in requirements.
