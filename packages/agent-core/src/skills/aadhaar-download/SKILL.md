---
name: aadhaar-download
description: Download Aadhaar card from UIDAI — enter Aadhaar number, verify via OTP, download e-Aadhaar PDF.
triggers:
  - aadhaar download
  - download aadhaar
  - aadhaar card
  - e-aadhaar
  - aadhaar pdf
  - uidai aadhaar
  - get aadhaar copy
  - aadhaar print
siteUrl: https://myaadhaar.uidai.gov.in
requiresAuth: false
params:
  - name: aadhaar_number
    required: true
    hint: 12-digit Aadhaar number (e.g. "1234 5678 9012")
  - name: aadhaar_type
    required: false
    hint: Type of Aadhaar to download — "full" (with address) or "masked" (last 4 digits only). Default "masked".
---

# Aadhaar Card Download (UIDAI)

Chrome profile: rsinghtomar3011@gmail.com.

## Steps

### 1. Gather Aadhaar Details
- Confirm the 12-digit Aadhaar number from the user.
- If not provided, use `ask_user` (input_type "freetext"): "Please share your 12-digit Aadhaar number."
- Validate the number is exactly 12 digits.
- Ask if they want "masked Aadhaar" (default, last 4 digits visible) or "full Aadhaar" (all 12 digits visible).
- Confirm the registered mobile number is accessible for OTP verification.

### 2. Open UIDAI Portal in NEW Tab
- Open a NEW tab and navigate to `https://myaadhaar.uidai.gov.in/genricDownloadAadhaar`.
- Take snapshot. Verify the download Aadhaar page is loaded.
- Dismiss any popups, cookie banners, or survey prompts.
- If the page redirects to a different URL, navigate back to the download page.
- This is a government site — page loads may be slow; wait patiently.

### 3. Enter Aadhaar Number
- Locate the Aadhaar number input field.
- Enter the 12-digit Aadhaar number (without spaces).
- If a CAPTCHA/security code is present, attempt to read and enter it.
- If CAPTCHA is unreadable, use `ask_user`: "I need help reading the CAPTCHA. What text do you see in the image?"
- Select Aadhaar type: "Aadhaar" for full or "Masked Aadhaar" for masked version.
- Click "Send OTP" or "Generate OTP" button.
- Take snapshot to confirm OTP has been sent.

### 4. OTP Verification
- Use `ask_user` (input_type "freetext"): "An OTP has been sent to your registered mobile number ending in XXXX. Please share the OTP."
- Enter the OTP in the verification field.
- Click "Verify" or "Submit" button.
- If OTP is expired or invalid, inform user and request a resend.
- Take snapshot to confirm successful verification.

### 5. Download e-Aadhaar
- After OTP verification, the download link/button should appear.
- Click "Download Aadhaar" or "Download" button.
- Wait for the PDF to download completely.
- Take snapshot of the download confirmation.
- The PDF is password-protected — inform user about the password format.

### 6. Present Results to User
- Use `ask_user` to confirm download is complete.
- Report:
  - Download status: successful
  - File format: PDF (password-protected)
  - Password format: First 4 letters of name (UPPERCASE) + year of birth (e.g. "ROHI1990")
  - Aadhaar type downloaded (masked/full)
- Mention: "The e-Aadhaar PDF is equally valid as the physical Aadhaar card for all purposes."

### 7. Final Confirmation with Snapshot
- Take snapshot of the completed download page.
- Summarize:
  - Aadhaar number (masked for security)
  - Download type (masked/full)
  - PDF password hint
  - Validity: e-Aadhaar is valid everywhere physical Aadhaar is accepted
- Mention: "You can re-download anytime from myaadhaar.uidai.gov.in. Up to 3 downloads per day."

## Site Notes

- UIDAI (myaadhaar.uidai.gov.in) is the ONLY official source for Aadhaar download. Never use third-party sites.
- Chrome Profile 3 (rsinghtomar3011@gmail.com) is used for browsing. Do NOT ask user for credentials.
- OTP is sent to the mobile registered with Aadhaar — user MUST have access to that phone.
- e-Aadhaar PDF password: first 4 letters of name in CAPS + birth year (e.g. "ROHI1990").
- UIDAI limits downloads to 3 per day per Aadhaar number.
- Government site can be slow — especially during peak hours. Retry if timeouts occur.
- CAPTCHA is often required — may be distorted and hard to read; ask user for help.
- Masked Aadhaar shows only last 4 digits — recommended for sharing with third parties.
- The site may show maintenance windows — check the banner at the top of the page.
- e-Aadhaar is legally valid for KYC, address proof, and identity verification everywhere in India.
- Session may expire if idle for too long — re-enter details if the page resets.
- Use `ask_user` for OTP input and presenting results. WAIT for user response before proceeding.
