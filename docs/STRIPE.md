# Stripe Integration Guide

This guide covers the complete Stripe payment integration in TONRIS, including setup, configuration, and webhook handling.

## Overview

TONRIS uses Stripe for subscription billing with the following features:
- **Monthly subscription**: $295/month
- **15-day free trial**: Automatic trial for new signups
- **Subscription management**: Via Stripe Customer Portal
- **Webhook integration**: Real-time subscription status updates

## Architecture

### Backend Components

1. **Stripe Service** (`backend/src/modules/billing/stripe.service.js`)
   - Direct Stripe API interactions
   - Customer creation
   - Checkout session management
   - Portal session creation
   - Webhook event verification

2. **Billing Service** (`backend/src/modules/billing/billing.service.js`)
   - Business logic layer
   - Subscription lifecycle management
   - Tenant status synchronization
   - Trial period handling

3. **Subscription Model** (`backend/src/modules/billing/subscription.model.js`)
   - Database schema for subscriptions
   - Subscription status tracking
   - Trial period management

4. **Webhook Handler** (`backend/src/modules/billing/webhook.handler.js`)
   - Processes Stripe webhook events
   - Updates subscription status
   - Handles payment failures

5. **Billing Routes** (`backend/src/modules/billing/billing.routes.js`)
   - API endpoints for billing operations
   - Rate limiting configuration

### Frontend Components

1. **BillingPage** (`frontend/src/pages/BillingPage.vue`)
   - Subscription status display
   - Payment method management
   - Stripe Checkout integration
   - Customer Portal access

2. **SignUpPage** (`frontend/src/pages/SignUpPage.vue`)
   - Free trial registration
   - No credit card required for trial

## Setup Instructions

### 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to https://stripe.com
   - Sign up for an account
   - Complete business verification (for production)

2. **Get API Keys**
   - Navigate to Dashboard → Developers → API keys
   - Copy your **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for production)
   - Copy your **Publishable key** (starts with `pk_test_` for test mode, `pk_live_` for production)

### 2. Create Stripe Products

1. **Navigate to Products**
   - Go to Dashboard → Products
   - Click "Add Product"

2. **Create Monthly Plan**
   - **Name**: "TONRIS Professional - Monthly"
   - **Description**: "Monthly subscription to TONRIS AI Assistant"
   - **Pricing**: 
     - Model: Recurring
     - Price: $295.00
     - Billing period: Monthly
   - Click "Save product"
   - Copy the **Price ID** (starts with `price_`)

### 3. Backend Environment Configuration

Add the following to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id_here
```

**Note**: For development, use test mode keys (starting with `sk_test_` and `pk_test_`). For production, use live keys (starting with `sk_live_` and `pk_live_`).

### 4. Frontend Environment Configuration

Add the following to your `frontend/.env`:

```env
# Stripe Publishable Key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important**: The publishable key is safe to include in your frontend code. Never include the secret key in frontend code.

### 5. Webhook Configuration

Webhooks allow Stripe to notify your application about subscription events in real-time.

#### For Development (Local Testing)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   
   This will output a webhook signing secret (starts with `whsec_`). Add it to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx_from_stripe_cli
   ```

4. **Keep the CLI running** while testing locally

#### For Production

1. **Navigate to Webhooks**
   - Go to Dashboard → Developers → Webhooks
   - Click "Add endpoint"

2. **Configure Endpoint**
   - **Endpoint URL**: `https://api.yourdomain.com/api/webhooks/stripe`
   - **Description**: "TONRIS Subscription Webhooks"
   - **Events to send**: Select the following events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

3. **Get Webhook Secret**
   - After creating the endpoint, click on it
   - Click "Reveal" under "Signing secret"
   - Copy the webhook secret (starts with `whsec_`)
   - Add to your production `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
     ```

4. **Test the Webhook**
   - Click "Send test webhook" in Stripe Dashboard
   - Select an event type (e.g., `customer.subscription.created`)
   - Verify the webhook is received in your application logs

### 6. Verify Installation

1. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Check Stripe Connection**
   - The server should start without errors
   - Check logs for "TONRIS Backend server running"

3. **Test API Endpoints**
   ```bash
   # Get available plans (no auth required)
   curl http://localhost:3000/api/billing/plans
   
   # Should return plan information including monthly price
   ```

## User Flow

### 1. Sign Up (Free Trial)

1. User visits `/signup` page
2. User enters business and account information
3. User submits the form
4. Backend creates:
   - Tenant record
   - User account
   - Subscription record with `trialing` status
   - Trial period of 15 days
5. User is redirected to dashboard with trial active

**No credit card required for trial!**

### 2. During Trial

1. User sees trial status in dashboard
2. User can access all features
3. Banner shows remaining trial days
4. User can add payment method at any time

### 3. Trial Expiration

1. When trial ends, subscription status changes to `inactive`
2. User sees banner: "Your trial has ended"
3. User is prompted to add payment method
4. User clicks "Subscribe Now"

### 4. Checkout Flow

1. User clicks "Subscribe Now" on billing page
2. Frontend calls `POST /api/billing/create-checkout-session`
3. Backend creates Stripe Checkout session
4. User is redirected to Stripe Checkout page
5. User enters payment details
6. On success:
   - Stripe sends `checkout.session.completed` webhook
   - Backend processes webhook and activates subscription
   - User is redirected back to billing page
7. On cancel:
   - User is redirected back to billing page with error message

### 5. Active Subscription

1. User subscription status is `active`
2. Tenant status is `active`
3. User has full access to all features
4. Subscription automatically renews monthly

### 6. Manage Subscription

1. User clicks "Manage in Stripe" on billing page
2. Frontend calls `POST /api/billing/portal-session`
3. Backend creates Stripe Customer Portal session
4. User is redirected to Stripe Customer Portal
5. User can:
   - Update payment method
   - View invoices
   - Cancel subscription
   - Download receipts

## API Endpoints

### Public Endpoints

#### Get Available Plans
```http
GET /api/billing/plans
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "monthly",
        "name": "Monthly Plan",
        "price": 29500,
        "priceFormatted": "$295.00",
        "interval": "month",
        "intervalLabel": "per month"
      }
    ],
    "trialDays": 15
  }
}
```

### Protected Endpoints (Require Authentication)

#### Get Current Subscription
```http
GET /api/billing/subscription
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "tenantId": "uuid",
      "status": "trialing",
      "billingInterval": "month",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "trialStart": "2024-01-01T00:00:00.000Z",
      "trialEnd": "2024-01-16T00:00:00.000Z",
      "isActive": true,
      "hasAccess": true
    },
    "plans": {
      "monthly": {
        "price": 29500,
        "interval": "month",
        "priceFormatted": "$295.00"
      }
    },
    "trialDays": 15
  }
}
```

#### Create Checkout Session
```http
POST /api/billing/create-checkout-session
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
Content-Type: application/json

{
  "billingInterval": "month",
  "successUrl": "https://yourdomain.com/app/billing?success=true",
  "cancelUrl": "https://yourdomain.com/app/billing?cancelled=true"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
  }
}
```

#### Create Portal Session
```http
POST /api/billing/portal-session
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
Content-Type: application/json

{
  "returnUrl": "https://yourdomain.com/app/billing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/p/session/xxx"
  }
}
```

#### Cancel Subscription
```http
POST /api/billing/cancel
Authorization: Bearer <token>
X-Tenant-ID: <tenant-id>
Content-Type: application/json

{
  "immediate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "status": "active",
      "cancelAtPeriodEnd": true
    }
  },
  "message": "Subscription will be cancelled at the end of the billing period"
}
```

### Webhook Endpoint

#### Stripe Webhook
```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=xxx,v1=xxx
```

This endpoint receives raw webhook events from Stripe. The signature is automatically verified.

## Webhook Events

The application handles the following Stripe webhook events:

### checkout.session.completed
Triggered when a customer completes the checkout process.
- Creates or updates subscription record
- Associates subscription with tenant

### customer.subscription.created
Triggered when a new subscription is created.
- Updates subscription record with Stripe subscription ID
- Sets subscription status

### customer.subscription.updated
Triggered when subscription details change (status, billing cycle, etc.).
- Updates subscription status
- Updates billing period dates
- Syncs tenant status

### customer.subscription.deleted
Triggered when a subscription is cancelled/deleted.
- Sets subscription status to `canceled`
- May suspend tenant access

### invoice.paid
Triggered when an invoice payment succeeds.
- Logs successful payment
- Subscription status updated via `customer.subscription.updated` event

### invoice.payment_failed
Triggered when an invoice payment fails.
- Logs payment failure
- Subscription may transition to `past_due`
- User notified to update payment method

## Subscription States

| Status | Description | Has Access |
|--------|-------------|------------|
| `trialing` | Free trial period | ✅ Yes |
| `active` | Paid and active | ✅ Yes |
| `past_due` | Payment failed, grace period | ✅ Yes (limited) |
| `incomplete` | Payment incomplete | ❌ No |
| `incomplete_expired` | Payment never completed | ❌ No |
| `canceled` | Subscription cancelled | ❌ No |
| `unpaid` | Payment failed, no retry | ❌ No |
| `inactive` | Trial expired, no payment | ❌ No |

## Testing

### Test with Stripe Test Mode

Use these test card numbers in Stripe Checkout:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0027 6000 3184 | Requires 3D Secure authentication |

**Expiry Date**: Any future date
**CVC**: Any 3 digits
**ZIP**: Any 5 digits

### Test Webhooks Locally

1. Start Stripe CLI forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Trigger test events:
   ```bash
   # Test subscription creation
   stripe trigger customer.subscription.created
   
   # Test subscription update
   stripe trigger customer.subscription.updated
   
   # Test payment success
   stripe trigger invoice.paid
   
   # Test payment failure
   stripe trigger invoice.payment_failed
   ```

3. Check your application logs to verify webhook processing

### Integration Test Flow

1. **Sign Up**
   - Create a new account
   - Verify trial subscription is created
   - Check subscription status is `trialing`

2. **Add Payment (During Trial)**
   - Navigate to billing page
   - Click "Subscribe Now" or "Manage in Stripe"
   - Complete Stripe Checkout with test card
   - Verify subscription status updates to `active`

3. **Customer Portal**
   - Click "Manage in Stripe"
   - Verify redirect to Stripe Customer Portal
   - Test updating payment method
   - Test viewing invoices

4. **Webhook Testing**
   - Use Stripe CLI to trigger events
   - Verify subscription status updates correctly
   - Check tenant status syncs properly

## Monitoring

### Key Metrics to Monitor

1. **Subscription Status Distribution**
   - Active subscriptions
   - Trial subscriptions
   - Cancelled subscriptions
   - Failed payments

2. **Webhook Processing**
   - Webhook delivery success rate
   - Webhook processing errors
   - Webhook retry attempts

3. **Payment Failures**
   - Failed payment count
   - Failed payment reasons
   - Recovery rate

### Stripe Dashboard

Monitor your subscriptions in the Stripe Dashboard:
- **Subscriptions**: View all active subscriptions
- **Customers**: View customer details and subscription history
- **Payments**: View payment history and failed payments
- **Webhooks**: View webhook delivery logs and retry history

### Application Logs

Check application logs for:
- Subscription creation: `"Created new subscription with X-day trial"`
- Webhook processing: `"Processing webhook event: {type}"`
- Payment events: `"Invoice paid"` or `"Invoice payment failed"`
- Errors: Any billing-related errors

## Troubleshooting

### Issue: Webhook Signature Verification Failed

**Symptoms**: 400 error on webhook endpoint, "Invalid signature" in logs

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` is correct in `.env`
2. For local development, ensure Stripe CLI is running
3. For production, verify webhook endpoint is created with correct URL
4. Check that raw body is preserved (middleware configuration)

### Issue: Checkout Session Not Creating

**Symptoms**: Error when clicking "Subscribe Now"

**Solution**:
1. Verify `STRIPE_SECRET_KEY` is set in backend `.env`
2. Verify `STRIPE_MONTHLY_PRICE_ID` is correct
3. Check that tenant has a Stripe customer ID
4. Review backend logs for detailed error message

### Issue: Subscription Not Updating After Payment

**Symptoms**: Payment completes but subscription stays in trial/inactive

**Solution**:
1. Check webhook delivery in Stripe Dashboard
2. Verify webhook endpoint is accessible (not blocked by firewall)
3. Check webhook signature verification is passing
4. Review webhook processing logs for errors
5. Ensure subscription has tenantId in metadata

### Issue: Customer Portal Not Opening

**Symptoms**: Error when clicking "Manage in Stripe"

**Solution**:
1. Verify tenant has a Stripe customer ID
2. Check `STRIPE_SECRET_KEY` is correct
3. Ensure subscription exists for the tenant
4. Review backend logs for API errors

## Security Considerations

1. **Secret Key Protection**
   - Never expose `STRIPE_SECRET_KEY` in frontend code
   - Use environment variables for all secrets
   - Restrict `.env` file permissions (`chmod 600`)

2. **Webhook Verification**
   - Always verify webhook signatures
   - Never process unverified webhooks
   - Use raw body for signature verification

3. **Frontend Security**
   - Only use publishable key in frontend
   - Validate all user input
   - Use HTTPS in production

4. **Rate Limiting**
   - Checkout creation: 10 requests per 15 minutes per user
   - Portal creation: 10 requests per 15 minutes per user
   - Standard billing endpoints: 100 requests per 15 minutes per user

## Production Checklist

Before deploying to production:

- [ ] Switch to Stripe live mode API keys
- [ ] Update `STRIPE_SECRET_KEY` with live key
- [ ] Update `VITE_STRIPE_PUBLISHABLE_KEY` with live key
- [ ] Create production webhook endpoint in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Verify all webhook events are selected
- [ ] Test complete checkout flow with real card
- [ ] Test webhook delivery in production
- [ ] Set up Stripe webhook monitoring/alerts
- [ ] Configure Stripe email receipts
- [ ] Enable Stripe fraud protection
- [ ] Review Stripe billing settings
- [ ] Set up invoice payment failure notifications
- [ ] Complete Stripe account verification
- [ ] Review and accept Stripe terms of service

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **Stripe Testing Guide**: https://stripe.com/docs/testing
- **Stripe Dashboard**: https://dashboard.stripe.com

## Summary

The Stripe integration in TONRIS provides:
- ✅ Seamless subscription management
- ✅ 15-day free trial with no credit card required
- ✅ Secure payment processing via Stripe Checkout
- ✅ Self-service subscription management via Customer Portal
- ✅ Real-time webhook updates
- ✅ Automatic tenant status synchronization
- ✅ PCI compliance through Stripe

The integration is production-ready and follows Stripe best practices for security and reliability.
