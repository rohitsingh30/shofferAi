---
name: aws-console
description: Manage AWS services via the console — launch EC2 instances, manage S3 buckets, configure Lambda functions, monitor billing.
triggers:
  - aws console
  - aws ec2
  - aws s3
  - aws lambda
  - launch ec2
  - create s3 bucket
  - aws services
  - manage aws
  - aws instance
  - cloud server aws
  - aws billing
  - aws dashboard
siteUrl: https://console.aws.amazon.com
requiresAuth: true
params:
  - name: service
    required: true
    hint: AWS service to manage (e.g. "EC2", "S3", "Lambda", "RDS", "CloudFront")
  - name: action
    required: true
    hint: Action to perform (e.g. "launch instance", "create bucket", "deploy function", "check billing")
  - name: region
    required: false
    hint: AWS region (e.g. "ap-south-1", "us-east-1", default ap-south-1)
  - name: instance_type
    required: false
    hint: EC2 instance type (e.g. "t2.micro", "t3.medium")
  - name: bucket_name
    required: false
    hint: S3 bucket name for create/manage operations
---

# AWS Console Management

Chrome profile: rsinghtomar3011@gmail.com. Operator AWS account.

## Steps

### 1. Gather Requirements
- Confirm you have: target AWS service, action to perform.
- If service is missing, use `ask_user` (input_type "choice"): "Which AWS service?" — EC2, S3, Lambda, RDS, CloudFront, Billing, Other.
- If action is unclear, use `ask_user` (input_type "freetext"): "What would you like to do? (e.g. launch a new EC2 instance, create an S3 bucket)"
- Default region to ap-south-1 (Mumbai) if not specified.
- For EC2 launches, gather: instance type, AMI preference (Amazon Linux, Ubuntu), key pair, security group.
- For S3, gather: bucket name, access level (private/public).
- For Lambda, gather: runtime, function name, trigger type.

### 2. Open AWS Console in New Tab
- Open a NEW tab and navigate to `https://console.aws.amazon.com`.
- Take a snapshot to see the landing/dashboard page.
- Dismiss any promotional banners, "What's New" popups, or notification modals.
- Verify the AWS Management Console dashboard is visible.
- If redirected to a region selector, select the target region.

### 3. Verify Login
- Look for the account name/ID in the top-right navigation bar.
- If signed in: verify correct account and proceed.
- If NOT signed in: Click "Sign in", attempt login with operator credentials.
- If MFA/2FA prompt appears, use `ask_user` (input_type "otp"): "Please enter the AWS MFA code from your authenticator app."
- **If you see a login page or wrong account, STOP and tell the user: "Session expired, please re-login in Chrome Debug."**
- Take snapshot to confirm logged-in state and current region.

### 4. Navigate to Target Service
- Use the search bar at the top to search for the target service (e.g. "EC2", "S3").
- Click on the service from search results.
- Take snapshot of the service dashboard.
- Verify you are in the correct region (shown in top-right region selector).
- If wrong region, click region dropdown and switch to the target region.

### 5. Execute Service Action
- **EC2 — Launch Instance:**
  - Click "Launch Instance". Fill: Name, AMI (Amazon Linux 2023 default), instance type, key pair, security group.
  - Use `ask_user` (input_type "choice") for AMI selection: Amazon Linux 2023, Ubuntu 22.04, Windows Server 2022.
  - Use `ask_user` (input_type "choice") for instance type: t2.micro (free tier), t3.micro, t3.small, t3.medium.
  - Configure storage (default 8 GB gp3). Review and Launch.
- **S3 — Create Bucket:**
  - Click "Create bucket". Fill: bucket name, region, ACL settings, versioning, encryption.
  - Default to private access, server-side encryption enabled.
- **Lambda — Create Function:**
  - Click "Create function". Fill: function name, runtime, architecture.
  - Use `ask_user` (input_type "choice") for runtime: Python 3.12, Node.js 20.x, Java 21.
- **Billing — Check Usage:**
  - Navigate to Billing Dashboard. Extract current month charges, service breakdown.
  - Report cost summary to user.

### 6. Review Configuration & Confirm
- Take snapshot of the complete configuration summary.
- Use `confirm_action` to present the full details:
  - Service and action being performed
  - Configuration details (instance type, region, storage, etc.)
  - Estimated cost (monthly/hourly)
  - Any warnings (e.g. "This will incur charges")
- Do NOT proceed unless user confirms. If cancelled, ask what to change.

### 7. Payment (if applicable)
- For services with upfront costs (Reserved Instances, domain registration):
  - Use `collect_payment` to collect via Razorpay:
    - summary: JSON with service, configuration, pricing breakdown, estimated monthly cost
    - amount_inr: total amount (number)
    - description: "AWS service provisioning"
  - STOP and WAIT for payment confirmation. If cancelled, ask what to change.
- For on-demand services (EC2, Lambda): note that billing is usage-based, no upfront payment needed.

### 8. Execute & Confirm
- Click "Launch", "Create", or the final action button.
- Wait for the resource to be created/launched (may take 30-60 seconds for EC2).
- Take snapshot of the confirmation/success page.
- Extract: resource ID, ARN, public IP (EC2), endpoint URL, status.
- Report full details to user including how to access the resource.
- If creation failed, report the error message and suggest fixes.

## Site Notes

- Chrome Profile 3 (rsinghtomar3011@gmail.com) should be logged in. Do NOT ask user for credentials.
- AWS Console is region-specific — always verify region before creating resources. Default: ap-south-1 (Mumbai).
- MFA is likely enabled — be ready to handle authenticator app codes via `ask_user`.
- Free tier: t2.micro (750 hrs/month), 5GB S3, 1M Lambda requests — mention when relevant.
- AWS Console UI changes frequently — use search bar navigation instead of direct URLs for services.
- Session timeout is typically 12 hours — may need re-login for long operations.
- EC2 launch wizard has multiple steps — do not skip security group and key pair configuration.
- S3 bucket names must be globally unique — if taken, suggest alternatives.
- Always check billing dashboard after creating paid resources to confirm expected charges.
- Use `confirm_action` before any resource creation that incurs cost. Do NOT auto-proceed.
- Lambda cold starts can delay initial test — warn user about this.
