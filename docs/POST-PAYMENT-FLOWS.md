# Post-Payment Flows — Full-Stack Commerce Model

> **Status**: Draft PRD — March 2026  
> **Author**: Rohit + Copilot (CTO mode)  
> **Decision**: ShofferAI processes the full payment (product + service fee). We buy on the user's behalf using our stored payment method on the target site. Target site ships directly to the user's address.

---

## Table of Contents

1. [Business Model](#1-business-model)
2. [Order Lifecycle](#2-order-lifecycle)
3. [Data Model](#3-data-model)
4. [Post-Payment Checkout Flow](#4-post-payment-checkout-flow)
5. [Order Confirmation UX](#5-order-confirmation-ux)
6. [Delivery Tracking](#6-delivery-tracking)
7. [Invoices & Receipts](#7-invoices--receipts)
8. [Returns & Refunds](#8-returns--refunds)
9. [Failure Recovery](#9-failure-recovery)
10. [Webhooks](#10-webhooks)
11. [API Endpoints](#11-api-endpoints)
12. [UI Components](#12-ui-components)
13. [SSE Events](#13-sse-events)
14. [Agent Tools](#14-agent-tools)
15. [Implementation Phases](#15-implementation-phases)
16. [Open Questions](#16-open-questions)

---

## 1. Business Model

### How Money Flows

```
User pays ShofferAI (Razorpay)
  ├── Product cost:  ₹1,799  ──→  We pay Flipkart (our stored payment method)
  ├── Service fee:   ₹100    ──→  Our revenue
  └── Total charged: ₹1,899

Flipkart ships directly to user's address.
```

### Key Rules

| Rule | Detail |
|------|--------|
| **We charge everything** | Product price + service fee in a single Razorpay transaction |
| **We buy on their behalf** | Browser agent completes checkout on target site using our payment method |
| **Direct delivery** | Target site ships to user's address — we never touch the product |
| **Refund only after receipt** | We refund the user only after the target site refunds us. No fronting cash. |
| **Service fee is non-refundable** | We did the work. Configurable per-case for goodwill. |

### Revenue Model

- **Service fee**: ₹100–500 per task (configurable, can be percentage-based later)
- **No markup on product price**: We charge exactly what the target site charges
- **Tip model**: Optional service fee ("tip") chosen by user (None / ₹100 / ₹200 / ₹500 / Custom) — already implemented

---

## 2. Order Lifecycle

### State Machine

```
payment_received
    │
    ▼
placing_order ──────────────────→ checkout_failed (auto-refund)
    │                                    │
    ▼                                    ▼
order_placed                        refunded
    │
    ├──→ shipped
    │       │
    │       ├──→ out_for_delivery
    │       │       │
    │       │       ▼
    │       │    delivered ──→ (end)
    │       │
    │       └──→ return_requested
    │               │
    │               ▼
    │           return_initiated
    │               │
    │               ▼
    │           return_picked_up
    │               │
    │               ▼
    │           target_refund_received
    │               │
    │               ▼
    │           user_refunded ──→ (end)
    │
    └──→ cancelled (if cancelled before shipping)
              │
              ▼
          refunded ──→ (end)
```

### Status Descriptions

| Status | Description | Who triggers |
|--------|-------------|-------------|
| `payment_received` | User paid us, order record created | System (auto after payment capture) |
| `placing_order` | Browser agent is completing checkout on target site | System (agent in progress) |
| `checkout_failed` | Could not complete checkout (item OOS, payment rejected, etc.) | System (agent failure) |
| `order_placed` | Checkout completed, target site order confirmed | System (agent scraped confirmation) |
| `shipped` | Target site shows order shipped | System (polling) or User ("my order shipped") |
| `out_for_delivery` | Target site shows out for delivery | System (polling) or User |
| `delivered` | Target site shows delivered | System (polling) or User ("I received it") |
| `return_requested` | User wants to return | User ("return my earbuds") |
| `return_initiated` | Agent initiated return on target site | System (agent completed return flow) |
| `return_picked_up` | Return pickup completed | System (polling) or User |
| `target_refund_received` | Target site refunded our payment method | System (detected) or Admin (manual) |
| `user_refunded` | We refunded the user via Razorpay | System (Razorpay refund API) |
| `cancelled` | Order cancelled before shipping | User or System |
| `refunded` | Full refund processed to user | System |

---

## 3. Data Model

### New Models

#### Order

```prisma
model Order {
  id                  String      @id @default(cuid())
  orderNumber         String      @unique   // SHOF-20260321-A7K2
  taskId              String
  userId              String
  paymentId           String      @unique

  // Status
  status              String      @default("payment_received")
  statusMessage       String?     // Human-readable status detail
  statusUpdatedAt     DateTime    @default(now())

  // Target site
  targetSite          String      // "flipkart", "blinkit", "swiggy", "amazon"
  targetOrderId       String?     // Order ID on the target site
  targetOrderUrl      String?     // Direct link to order on target site
  targetTrackingUrl   String?     // Courier tracking URL
  targetInvoiceUrl    String?     // Invoice PDF URL on target site

  // Delivery
  deliveryAddress     Json?       // { name, line1, line2, city, state, pin, phone }
  estimatedDelivery   DateTime?   // Scraped from target site at purchase time
  actualDelivery      DateTime?   // When actually delivered

  // Items (denormalized from cart for quick access)
  items               Json        // [{ name, qty, priceCents, image, variant, url }]
  itemCount           Int         @default(1)

  // Amounts (duplicated from Payment for easy querying)
  productAmountCents  Int
  serviceFeeCents     Int         @default(0)
  totalCents          Int

  // Timestamps
  placedAt            DateTime?   // When checkout completed on target site
  shippedAt           DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  // Relations
  task                Task        @relation(fields: [taskId], references: [id])
  user                User        @relation(fields: [userId], references: [id])
  payment             Payment     @relation(fields: [paymentId], references: [id])
  refund              Refund?
  statusHistory       OrderStatusHistory[]
  invoice             Invoice?

  @@index([userId])
  @@index([taskId])
  @@index([status])
  @@index([orderNumber])
  @@index([targetSite, targetOrderId])
}
```

#### OrderStatusHistory

```prisma
model OrderStatusHistory {
  id          String   @id @default(cuid())
  orderId     String
  fromStatus  String
  toStatus    String
  message     String?  // e.g., "Checkout completed on Flipkart"
  metadata    Json?    // Any extra data (tracking number, courier name, etc.)
  createdAt   DateTime @default(now())

  order       Order    @relation(fields: [orderId], references: [id])

  @@index([orderId])
}
```

#### Refund

```prisma
model Refund {
  id                      String    @id @default(cuid())
  orderId                 String    @unique
  paymentId               String

  // Reason
  reason                  String    // "defective", "wrong_item", "not_delivered", "changed_mind", "checkout_failed"
  reasonDetails           String?   // Free-text from user

  // Status
  status                  String    @default("requested")
  // requested → return_initiated → return_picked_up →
  // target_refund_received → user_refunded → closed

  // Amounts
  productRefundCents      Int
  serviceFeeRefundCents   Int       @default(0)  // Usually 0
  totalRefundCents        Int

  // Target site return
  targetReturnId          String?
  targetReturnUrl         String?
  targetRefundStatus      String?   // "pending", "completed"
  targetRefundAt          DateTime?

  // Razorpay refund
  razorpayRefundId        String?
  userRefundAt            DateTime?

  // Timestamps
  requestedAt             DateTime  @default(now())
  resolvedAt              DateTime?
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  order                   Order     @relation(fields: [orderId], references: [id])

  @@index([status])
  @@index([paymentId])
}
```

#### Invoice

```prisma
model Invoice {
  id              String    @id @default(cuid())
  orderId         String    @unique
  invoiceNumber   String    @unique   // INV-20260321-XXXX

  // Breakdown (all in paise)
  productAmount   Int
  serviceFee      Int
  gstOnService    Int       // 18% GST on service fee
  totalAmount     Int

  // Billing
  billingName     String
  billingAddress  Json?
  gstin           String?   // User's GSTIN if provided
  panNumber       String?   // Our PAN for invoice header

  // File
  pdfUrl          String?   // GCS URL to generated PDF
  emailSentAt     DateTime?

  createdAt       DateTime  @default(now())

  order           Order     @relation(fields: [orderId], references: [id])
}
```

### Changes to Existing Models

```prisma
// Add to User model:
  orders            Order[]
  invoices are via Order

// Add to Task model:
  orders            Order[]

// Add to Payment model:
  order             Order?    // One-to-one back-reference
```

### Order Number Generation

```typescript
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = randomBytes(2).toString('hex').toUpperCase().slice(0, 4);
  return `SHOF-${date}-${suffix}`;
}
// Example: SHOF-20260321-A7K2
// Retry on unique constraint violation (extremely rare with 65K combinations per day)
```

---

## 4. Post-Payment Checkout Flow

### Current Flow (what exists today)

```
1. User says "buy wireless earbuds on flipkart"
2. Agent searches Flipkart → shows product carousel
3. User picks a product → agent adds to Flipkart cart
4. Payment panel opens → user pays via Razorpay
5. Payment verified → agent receives "confirmed"
6. Agent sends completion summary
7. ❌ Nothing happens on Flipkart — item just sits in cart
```

### New Flow (what we're building)

```
1–4. Same as above

5. Payment verified → Order record created (status: payment_received)
6. SSE: order_confirmed → Chat shows "Order #SHOF-20260321-A7K2 confirmed ✅"
7. Agent resumes → status: placing_order
8. Agent navigates to Flipkart cart → proceeds to checkout
9. Agent enters user's delivery address (collected earlier via ask_user)
10. Agent selects our stored payment method (credit card on Chrome Profile 3)
11. Agent completes checkout → scrapes:
    - Flipkart order ID
    - Estimated delivery date
    - Order confirmation URL
12. Order updated (status: order_placed, targetOrderId, estimatedDelivery)
13. SSE: order_placed → Chat shows "Placed on Flipkart! Order #OD12345. Delivery by Wed, Mar 25 🚚"
14. Agent sends final completion message

If step 8–11 fails:
  → Order.status = checkout_failed
  → Auto-refund via Razorpay API
  → SSE: order_failed → Chat shows "Couldn't complete checkout. Full refund initiated."
```

### Delivery Address Collection

The agent already collects delivery address via `ask_user` during the task flow (required for Flipkart checkout). We store it in the Order record.

```typescript
// During task flow, agent calls:
ask_user({
  question: "What's your delivery address?",
  inputType: "address",
  fields: ["name", "line1", "line2", "city", "state", "pin", "phone"]
});

// Response stored in Order.deliveryAddress as JSON
```

### Target Site Checkout Automation

The browser agent already knows how to navigate Flipkart (via Flipkart Shopping skill). Post-payment checkout extends this:

1. Navigate to Flipkart cart page
2. Click "Place Order" / "Proceed to Checkout"
3. Enter/select delivery address
4. Select payment method (our stored card)
5. Confirm order
6. Scrape confirmation page for order ID, delivery estimate
7. Take screenshot of confirmation as proof

This is a new skill section added to the Flipkart Shopping SKILL.md.

---

## 5. Order Confirmation UX

### In-Chat Confirmation

After payment capture, immediately show in chat:

```
┌─────────────────────────────────────┐
│  ✅ Order Confirmed                 │
│  Order #SHOF-20260321-A7K2          │
│                                     │
│  🎧 OnePlus Nord Buds 2r           │
│     Color: Deep Grey                │
│     Qty: 1 × ₹1,799                │
│                                     │
│  ─────────────────────────          │
│  Product:     ₹1,799                │
│  Service fee: ₹100                  │
│  Total paid:  ₹1,899                │
│  ─────────────────────────          │
│                                     │
│  📦 Placing your order on Flipkart… │
│                                     │
│  [View Order]                       │
└─────────────────────────────────────┘
```

After checkout completes on Flipkart:

```
┌─────────────────────────────────────┐
│  🛒 Order Placed on Flipkart!      │
│                                     │
│  Flipkart Order: #OD426218...      │
│  🚚 Estimated Delivery: Wed, Mar 25│
│                                     │
│  [Track on Flipkart]  [View Order] │
└─────────────────────────────────────┘
```

### Orders Page (`/dashboard/orders`)

A dedicated page listing all orders:

```
┌─────────────────────────────────────────────────┐
│  Your Orders                                    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ #SHOF-20260321-A7K2  ·  Flipkart       │    │
│  │ OnePlus Nord Buds 2r (Deep Grey)        │    │
│  │ ₹1,899  ·  🟢 Delivered Mar 25         │    │
│  │ [View Details]  [Track]  [Return]       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ #SHOF-20260320-B3F9  ·  Blinkit        │    │
│  │ 3 items  ·  ₹487                       │    │
│  │ 🟢 Delivered Mar 20  (10 min delivery) │    │
│  │ [View Details]                          │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Order Detail Page (`/dashboard/orders/[id]`)

```
┌──────────────────────────────────────────────────────┐
│  Order #SHOF-20260321-A7K2                           │
│  Placed Mar 21, 2026  ·  Flipkart                   │
│                                                      │
│  Status: 🟢 Delivered                                │
│  ──────────────────────────────────────               │
│  ● Payment received         Mar 21, 7:32 PM          │
│  ● Order placed on Flipkart Mar 21, 7:33 PM          │
│  ● Shipped                  Mar 22, 10:15 AM          │
│  ● Out for delivery         Mar 25, 8:30 AM          │
│  ● Delivered                Mar 25, 2:15 PM          │
│                                                      │
│  Items                                               │
│  ┌──────────────────────────────────────┐            │
│  │ 🎧 OnePlus Nord Buds 2r            │            │
│  │    Deep Grey  ·  Qty: 1  ·  ₹1,799 │            │
│  └──────────────────────────────────────┘            │
│                                                      │
│  Payment                                             │
│  Product:      ₹1,799                                │
│  Service fee:  ₹100                                  │
│  Total:        ₹1,899                                │
│  Paid via:     UPI (success@razorpay)                │
│                                                      │
│  Delivery Address                                    │
│  Rohit Singh                                         │
│  123 Main St, Apartment 4B                           │
│  Mumbai, Maharashtra 400001                          │
│  Phone: +91 81091 37158                              │
│                                                      │
│  [Track on Flipkart]  [Download Invoice]  [Return]  │
└──────────────────────────────────────────────────────┘
```

---

## 6. Delivery Tracking

### Approach: Passive First, Active Later

#### Passive Tracking (Phase 2)

At checkout completion, scrape from Flipkart:
- Order status page URL → `Order.targetOrderUrl`
- Tracking URL (if carrier link available) → `Order.targetTrackingUrl`
- Estimated delivery → `Order.estimatedDelivery`

User clicks "Track on Flipkart" → opens target site order page in new tab.

#### Active Tracking (Phase 5 — future)

Background polling service:
1. Every 4 hours, for orders in `order_placed` / `shipped` / `out_for_delivery` status
2. Browser agent opens Flipkart order page → scrapes current status
3. If status changed → update Order → send notification

**Cost**: Each poll = 1 Chrome session for ~30 seconds. For 100 active orders polling every 4 hours = 600 Chrome sessions/day.

**Optimization**: Only poll during business hours (8 AM–10 PM). Skip weekends for non-express orders. Stop polling 2 days after estimated delivery.

#### Notification Channels

| Channel | Phase | Details |
|---------|-------|---------|
| In-chat message | Phase 2 | SSE event `order_status` with new status |
| Orders page badge | Phase 2 | Show unread status changes |
| Email | Phase 3 | "Your order has shipped!" with tracking link |
| Push notification | Future | Mobile app push via Expo |

---

## 7. Invoices & Receipts

### What We Invoice

ShofferAI is a **service provider**, not a reseller. Our invoice covers:
- **Service fee**: The concierge fee for executing the task
- **GST on service fee**: 18% (if registered)
- **Product cost**: Listed as "pass-through" / "amount paid to merchant on your behalf" — not our revenue

### Invoice Format

```
┌──────────────────────────────────────────────┐
│  SHOFFERAI PRIVATE LIMITED                   │
│  Invoice #INV-20260321-A7K2                  │
│  Date: March 21, 2026                        │
│                                              │
│  Bill To:                                    │
│  Rohit Singh                                 │
│  Mumbai, Maharashtra 400001                  │
│                                              │
│  ────────────────────────────────────        │
│  Description              Amount             │
│  ────────────────────────────────────        │
│  Merchant purchase                           │
│  (Flipkart — OnePlus Nord Buds 2r)          │
│  Paid to merchant:        ₹1,799.00         │
│                                              │
│  Concierge service fee:   ₹100.00           │
│  GST (18% on service):    ₹18.00            │
│                                              │
│  ────────────────────────────────────        │
│  Total:                   ₹1,917.00         │
│  ────────────────────────────────────        │
│                                              │
│  Payment: UPI via Razorpay                   │
│  Transaction ID: pay_SU08ddOgkHYw9n         │
│                                              │
│  Thank you for using ShofferAI! 🙏           │
└──────────────────────────────────────────────┘
```

### Generation

- **When**: After `Order.status` reaches `order_placed` (checkout confirmed)
- **How**: Server-side PDF generation (e.g., `@react-pdf/renderer` or `puppeteer` → PDF)
- **Storage**: GCS bucket (`gs://shofferai-invoices/INV-20260321-A7K2.pdf`)
- **Access**: `GET /api/orders/[id]/invoice` → signed URL redirect

### Tax Notes

- If monthly service revenue < ₹20L: No GST registration required (threshold exemption)
- If registered: Charge 18% GST on service fee only, file GST returns
- Product pass-through is NOT our supply — Flipkart handles product GST
- Keep records of all transactions for 6 years (Income Tax Act)

---

## 8. Returns & Refunds

### Return Flow (User Perspective)

```
User: "I want to return the earbuds, they're defective"
   │
   ▼
Agent: "I'll help you return the OnePlus Nord Buds 2r from order #SHOF-20260321-A7K2.
        Reason: Defective. Let me initiate the return on Flipkart."
   │
   ▼
Agent opens Flipkart → Orders → Select order → Initiate Return
   → Selects reason: "Defective/Not working"
   → Confirms return request
   → Scrapes: return ID, pickup date
   │
   ▼
Agent: "Return initiated! 📦
        Return ID: RET-FK-12345
        Pickup scheduled: Thu, Mar 27
        Once Flipkart processes the return and refunds us,
        we'll refund ₹1,799 to your original payment method.
        Service fee (₹100) is non-refundable."
   │
   ▼
[Days pass — Flipkart picks up item and processes refund]
   │
   ▼
System detects Flipkart refund landed (via polling or admin trigger)
   │
   ▼
System calls Razorpay Refund API → refunds ₹1,799 to user
   │
   ▼
Agent: "Your refund of ₹1,799 has been processed! 💰
        It'll reflect in your account within 5-7 business days.
        Razorpay Refund ID: rfnd_XXXXXXXX"
```

### Refund Amount Calculation

```
Product paid to Flipkart:    ₹1,799  → Refundable (after Flipkart refunds us)
Service fee:                 ₹100    → Non-refundable (default)
GST on service fee:          ₹18     → Non-refundable (follows service fee)
──────────────────────────────────
Total refund to user:        ₹1,799
```

### Partial Returns

If user ordered 3 items and returns 1:
- Refund only the returned item's cost
- Service fee remains non-refundable
- Create Refund record with `productRefundCents` = returned item's price only

### Refund Triggers

| Trigger | Who | When |
|---------|-----|------|
| Checkout failure | System | Auto — within 10 min of payment if checkout fails |
| Item out of stock | System | Auto — agent detects during checkout |
| User cancellation | User | Before order ships on target site |
| User return | User | After delivery, within return window |
| Admin override | Admin | Manual — for edge cases |

### Detecting Target Site Refund

Two approaches:

1. **Manual/Admin** (Phase 4): Admin checks bank statement, marks refund received in admin dashboard → triggers Razorpay refund
2. **Automated** (Future): Poll target site order page → detect "Refund processed" status → auto-trigger

Start with manual, automate later.

---

## 9. Failure Recovery

### Failure Matrix

| Scenario | Detection | Recovery | Timeline |
|----------|-----------|----------|----------|
| Payment succeeds, checkout fails | Agent reports error | Auto-refund full amount | Immediate |
| Item OOS during checkout | Agent detects "out of stock" | Auto-refund + notify user | Immediate |
| Agent crashes mid-checkout | Timeout (10 min) | Retry once, then refund | 10 min |
| Wrong item ordered | User reports | Agent initiates return on target site | User-triggered |
| User closes browser during payment | Razorpay webhook | Create order normally | Async |
| Target site rejects our payment | Agent detects payment failure | Refund user + suggest retry | Immediate |
| Delivery address wrong | User reports before shipping | Agent updates on target site | User-triggered |
| Double order placed | Duplicate detection | Cancel duplicate + refund | Auto-detect |

### Auto-Refund Logic

```typescript
// In execute route, after agent checkout failure:
async function handleCheckoutFailure(orderId: string, reason: string) {
  // 1. Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'checkout_failed', statusMessage: reason }
  });

  // 2. Get payment details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true }
  });

  // 3. Razorpay refund
  const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
    amount: order.totalCents, // Full refund in paise
    notes: { orderId, reason }
  });

  // 4. Create Refund record
  await prisma.refund.create({
    data: {
      orderId,
      paymentId: order.payment.id,
      reason: 'checkout_failed',
      reasonDetails: reason,
      status: 'user_refunded',
      productRefundCents: order.productAmountCents,
      serviceFeeRefundCents: order.serviceFeeCents, // Full refund on checkout failure
      totalRefundCents: order.totalCents,
      razorpayRefundId: refund.id,
      userRefundAt: new Date(),
      resolvedAt: new Date(),
    }
  });

  // 5. Update payment status
  await prisma.payment.update({
    where: { id: order.payment.id },
    data: { status: 'refunded' }
  });

  // 6. Notify user via SSE
  send('order_failed', {
    orderId,
    orderNumber: order.orderNumber,
    reason,
    refundAmount: order.totalCents,
    message: `Couldn't complete your order. Full refund of ₹${(order.totalCents / 100).toFixed(0)} initiated.`
  });
}
```

### Checkout Timeout

If the browser agent doesn't complete checkout within **10 minutes** of payment capture:
1. Order.status → `checkout_failed`
2. Trigger auto-refund
3. Notify user

This prevents money being stuck indefinitely if the agent hangs.

---

## 10. Webhooks

### Razorpay Webhook Endpoint

`POST /api/payments/webhook`

```typescript
// Events to handle:
{
  "payment.captured":   // Backup for verify endpoint (user closed browser)
  "payment.failed":     // Payment attempt failed
  "refund.processed":   // Refund completed on Razorpay side
}
```

### Webhook Flow

```
Razorpay server
    │
    ▼
POST /api/payments/webhook
    │
    ├── Verify webhook signature (X-Razorpay-Signature header)
    │
    ├── payment.captured:
    │   ├── Check if Payment record exists and status == 'pending'
    │   ├── Update Payment.status = 'captured'
    │   ├── Create Order record (if not already created by verify endpoint)
    │   └── Resume agent (if waiting)
    │
    ├── payment.failed:
    │   ├── Update Payment.status = 'failed'
    │   └── Notify user (if SSE stream still open)
    │
    └── refund.processed:
        ├── Update Refund.razorpayRefundId
        └── Update Refund.status = 'user_refunded'
```

### Idempotency

- Check if already processed before acting (compare Payment.status)
- Razorpay may send the same event multiple times
- Use `razorpayPaymentId` as idempotency key

---

## 11. API Endpoints

### Orders

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/orders` | List user's orders (paginated, filterable by status) |
| `GET` | `/api/orders/[id]` | Order details with status timeline |
| `GET` | `/api/orders/[id]/invoice` | Download invoice PDF (signed GCS URL) |
| `POST` | `/api/orders/[id]/cancel` | Cancel order (if not yet shipped) |
| `POST` | `/api/orders/[id]/return` | Initiate return (triggers browser agent) |

### Payments (existing + new)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order (existing) |
| `POST` | `/api/payments/verify` | Verify payment + create Order (updated) |
| `POST` | `/api/payments/webhook` | Razorpay webhook handler (new) |

### Admin (future)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/orders` | All orders (admin view) |
| `POST` | `/api/admin/refunds/[id]/process` | Mark target refund received + trigger Razorpay refund |
| `GET` | `/api/admin/revenue` | Revenue dashboard data |

---

## 12. UI Components

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `OrderConfirmation` | Chat message | Shows order confirmed card after payment |
| `OrderPlaced` | Chat message | Shows target site order details + tracking |
| `OrderFailed` | Chat message | Shows failure + refund info |
| `OrdersList` | `/dashboard/orders` | List of all orders |
| `OrderDetail` | `/dashboard/orders/[id]` | Full order details + timeline |
| `OrderStatusBadge` | Shared | Color-coded status pill |
| `OrderTimeline` | Order detail | Visual status progression |
| `ReturnDialog` | Order detail | Return reason selection + confirmation |

### Navigation

Add "Orders" to sidebar navigation (between "History" and "Profile & Cards"):
```
New Chat
History
Orders          ← NEW
Profile & Cards
Telemetry
```

---

## 13. SSE Events

### New Events

| Event | Payload | When |
|-------|---------|------|
| `order_confirmed` | `{ orderId, orderNumber, items, productAmountCents, serviceFeeCents, totalCents, estimatedDelivery? }` | Payment captured, order created |
| `order_placed` | `{ orderId, orderNumber, targetSite, targetOrderId, targetOrderUrl, targetTrackingUrl?, estimatedDelivery }` | Checkout completed on target site |
| `order_failed` | `{ orderId, orderNumber, reason, refundAmountCents, message }` | Checkout failed, refund initiated |
| `order_status` | `{ orderId, orderNumber, status, message, targetTrackingUrl? }` | Any status change (shipped, delivered, etc.) |
| `refund_initiated` | `{ orderId, refundId, amountCents, reason }` | Refund process started |
| `refund_completed` | `{ orderId, refundId, amountCents, razorpayRefundId }` | User refunded |

---

## 14. Agent Tools

### New Internal Tools

| Tool | Description | When |
|------|-------------|------|
| `create_order` | Creates Order record after payment capture | Called by execute route, not LLM |
| `update_order_status` | Updates order status + sends SSE event | Called by agent after target site actions |
| `initiate_refund` | Calls Razorpay refund API | Called by system or admin |

### Skill Extensions

#### Flipkart Shopping Skill — Post-Payment Checkout Section

Add to `SKILL.md`:
```markdown
## Post-Payment Checkout
After user pays via Razorpay, complete the purchase on Flipkart:
1. Navigate to Flipkart cart
2. Click "Place Order"
3. Enter delivery address: {address from ask_user}
4. Select payment method: Use saved card ending in XXXX
5. Confirm order
6. Scrape from confirmation page:
   - Order ID (e.g., OD426218...)
   - Estimated delivery date
   - Order details URL
7. Report: update_order_status(orderId, "order_placed", { targetOrderId, estimatedDelivery })
```

#### Return Skill (New)

```markdown
## Return & Refund
When user requests a return:
1. Ask for order number or identify from conversation
2. Ask for return reason
3. Navigate to Flipkart → My Orders → Find order
4. Click "Return" → Select reason → Confirm
5. Scrape return ID and pickup date
6. Report to user with expected refund timeline
```

---

## 15. Implementation Phases

### Phase 1: Order Model + Post-Payment Checkout ← START HERE
- [ ] Prisma schema: Order, OrderStatusHistory models + migration
- [ ] Order number generation utility
- [ ] Update `/api/payments/verify` to create Order after payment capture
- [ ] New SSE events: `order_confirmed`, `order_placed`, `order_failed`
- [ ] `OrderConfirmation` chat component
- [ ] `OrderPlaced` chat component
- [ ] Auto-refund on checkout failure (10 min timeout)
- [ ] Update Flipkart Shopping skill with post-payment checkout instructions
- [ ] `/dashboard/orders` page (basic list)
- [ ] E2E test: payment → order created → checkout on Flipkart → order placed

### Phase 2: Delivery Tracking + Orders UI
- [ ] Scrape tracking URL from Flipkart at checkout time
- [ ] `/dashboard/orders/[id]` detail page with timeline
- [ ] `OrderStatusBadge` component
- [ ] Add "Orders" to sidebar navigation
- [ ] Passive tracking: "Track on Flipkart" link
- [ ] `order_status` SSE event for status changes

### Phase 3: Invoices & Receipts
- [ ] Prisma schema: Invoice model + migration
- [ ] Invoice number generation
- [ ] PDF generation (server-side)
- [ ] GCS upload for PDF storage
- [ ] `/api/orders/[id]/invoice` endpoint
- [ ] "Download Invoice" button on order detail page
- [ ] Auto-generate invoice after `order_placed`

### Phase 4: Returns & Refunds
- [ ] Prisma schema: Refund model + migration
- [ ] Return skill (SKILL.md for each target site)
- [ ] `/api/orders/[id]/return` endpoint
- [ ] Return dialog UI component
- [ ] Admin endpoint to mark target refund received
- [ ] Razorpay refund API integration
- [ ] `refund_initiated` and `refund_completed` SSE events
- [ ] Refund status on order detail page

### Phase 5: Webhooks + Active Tracking + Notifications
- [ ] Razorpay webhook endpoint (`/api/payments/webhook`)
- [ ] Webhook signature verification
- [ ] Active delivery polling (background job with Chrome)
- [ ] Email notifications (order confirmed, shipped, delivered)
- [ ] Admin dashboard for order management
- [ ] Revenue reporting

---

## 16. Open Questions

1. **Payment method on target sites**: We use credit card on Chrome Profile 3. What if it gets declined? Do we have backup payment methods?

2. **Delivery address format**: Different sites have different address formats. Should we normalize to a common format and adapt per-site?

3. **Multi-item orders across sites**: User says "order earbuds from Flipkart and milk from Blinkit". Two separate orders? One combined payment?

4. **Order notifications**: Email requires an email service (Resend, SendGrid). Which to use? Or skip email and only do in-app notifications initially?

5. **GST registration**: At what revenue threshold should we register? Current service fees are small.

6. **Dispute handling**: What if user claims they didn't receive the item but Flipkart says delivered? Who eats the cost?

7. **Rate limiting**: How many orders per user per day? Any fraud prevention needed?

8. **International orders**: Support Amazon US / international sites eventually? Different currencies?

---

*Last updated: March 21, 2026*
