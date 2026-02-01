# Criton.AI Pricing Analysis & Recommendation

## Current State
- **Current Price:** $295/month flat rate
- **Features:** Unlimited calls, 24/7 AI answering, appointment booking
- **Trial:** 15 days free

## Cost Structure (Your Costs)

### ElevenLabs Costs
Based on typical ElevenLabs conversational AI pricing:
- **Per-minute cost:** ~$0.05-$0.08/min (depends on plan)
- **Average call duration:** 2-4 minutes
- **Cost per call:** ~$0.10-$0.32

### Twilio Costs
- **Incoming calls:** ~$0.0085/min
- **Phone number:** ~$1-2/month

### Your Margin Per Minute
| Your Cost | Charge to Customer | Gross Margin |
|-----------|-------------------|--------------|
| $0.06/min | $0.12/min overage | 50% |
| $0.06/min | $0.15/min overage | 60% |
| $0.06/min | $0.18/min overage | 67% |

---

## Proposed Pricing Tiers

### Option A: Three-Tier Hybrid Model (Recommended)

| Plan | Monthly | Included Minutes | Overage Rate | Target Customer |
|------|---------|------------------|--------------|-----------------|
| **Starter** | $79 | 200 min | $0.15/min | Solopreneurs, testing |
| **Professional** | $149 | 500 min | $0.12/min | Small businesses |
| **Business** | $299 | 1,500 min | $0.10/min | Busy practices |

**Annual Discount:** 15% off (2 months free)
- Starter Annual: $806/year ($67/mo effective)
- Professional Annual: $1,520/year ($127/mo effective)
- Business Annual: $3,048/year ($254/mo effective)

### Option B: Two-Tier Simplified Model

| Plan | Monthly | Included Minutes | Overage Rate |
|------|---------|------------------|--------------|
| **Standard** | $149 | 500 min | $0.12/min |
| **Unlimited** | $399 | Unlimited | N/A |

---

## Financial Projections

### Assumptions
- **Average call duration:** 3 minutes
- **Your cost per minute:** $0.06 (ElevenLabs + Twilio)
- **Customer mix:** 50% Starter, 35% Pro, 15% Business
- **Overage rate:** 20% of customers go over included minutes
- **Average overage:** 50 minutes when they do

### Revenue Per Customer (Monthly)

**Current Model ($295 flat):**
| Scenario | Revenue | Your Cost | Gross Profit |
|----------|---------|-----------|--------------|
| Light user (100 min) | $295 | $6 | $289 (98%) |
| Medium user (400 min) | $295 | $24 | $271 (92%) |
| Heavy user (1,000 min) | $295 | $60 | $235 (80%) |
| Very heavy (2,000 min) | $295 | $120 | $175 (59%) |

*Problem: Light users subsidize heavy users, and $295 is a barrier to entry.*

**Proposed Hybrid Model:**
| Plan | Base | Avg Usage | Overage | Total Rev | Your Cost | Gross Profit |
|------|------|-----------|---------|-----------|-----------|--------------|
| Starter (200 min, uses 150) | $79 | 150 min | $0 | $79 | $9 | $70 (89%) |
| Starter (200 min, uses 300) | $79 | 300 min | $15 | $94 | $18 | $76 (81%) |
| Pro (500 min, uses 400) | $149 | 400 min | $0 | $149 | $24 | $125 (84%) |
| Pro (500 min, uses 700) | $149 | 700 min | $24 | $173 | $42 | $131 (76%) |
| Business (1500 min, uses 1200) | $299 | 1200 min | $0 | $299 | $72 | $227 (76%) |
| Business (1500 min, uses 2000) | $299 | 2000 min | $50 | $349 | $120 | $229 (66%) |

### Projected Monthly Revenue (by customer count)

| Customers | Current ($295 flat) | Proposed Hybrid (blended) |
|-----------|---------------------|---------------------------|
| 10 | $2,950 | $1,490 - $1,740 |
| 25 | $7,375 | $3,725 - $4,350 |
| 50 | $14,750 | $7,450 - $8,700 |
| 100 | $29,500 | $14,900 - $17,400 |
| 250 | $73,750 | $37,250 - $43,500 |

*Note: Hybrid model shows lower per-customer revenue BUT...*

### Customer Acquisition Impact

**The real question: How many MORE customers can you get at $79 vs $295?**

| Price Point | Conversion Rate (est.) | Customers at 1000 trials | Monthly Revenue |
|-------------|------------------------|--------------------------|-----------------|
| $295 flat | 3-5% | 30-50 | $8,850 - $14,750 |
| $79 entry | 8-12% | 80-120 | $6,320 - $14,280* |

*Assumes 60% Starter, 30% Pro, 10% Business mix

**Break-even Analysis:**
- You need 2.7x more customers at $79 to match $295 revenue
- BUT: lower entry point typically yields 2-4x better conversion
- AND: customers upgrade over time as usage grows

### 12-Month Customer Growth Projection

**Scenario: 100 trials/month, aggressive growth**

| Month | Current Model (5% conv) | Hybrid Model (10% conv) |
|-------|-------------------------|-------------------------|
| 1 | 5 customers, $1,475 MRR | 10 customers, $1,090 MRR |
| 3 | 15 customers, $4,425 MRR | 30 customers, $3,570 MRR |
| 6 | 30 customers, $8,850 MRR | 60 customers, $7,740 MRR |
| 12 | 60 customers, $17,700 MRR | 120 customers, $16,680 MRR |

*Note: Hybrid catches up around month 10-12, then accelerates past due to higher volume + upgrades + overages*

---

## Competitive Positioning

| Competitor | Entry Price | Your Hybrid | Advantage |
|------------|-------------|-------------|-----------|
| My AI Front Desk | $79/mo | $79/mo | ✓ Matched |
| Dialzara | $29/mo | $79/mo | They're cheaper, but less features |
| Smith.ai | $95/mo | $79/mo | ✓ You're cheaper |
| Answering AI | $99/mo | $79/mo | ✓ You're cheaper |

---

## Implementation Checklist

### Stripe Setup
- [ ] Create new Price objects for each tier
- [ ] Set up metered billing for overage minutes
- [ ] Configure usage records API
- [ ] Update webhook handlers for usage-based billing

### Backend Changes
- [ ] Track minutes used per billing period
- [ ] Implement usage alerts (80%, 100% of included minutes)
- [ ] Add overage calculation to billing cycle
- [ ] Create usage dashboard API endpoints

### Frontend Changes
- [ ] Update pricing page with new tiers
- [ ] Add usage meter to dashboard
- [ ] Create upgrade prompts when approaching limits
- [ ] Update subscription management page

### Database
- [ ] Add `included_minutes` to subscriptions
- [ ] Add `minutes_used` tracking table
- [ ] Add `plan_tier` enum field

---

## Recommendation

**Go with Option A (Three-Tier Hybrid):**

1. **$79 Starter** captures price-sensitive solopreneurs who would never pay $295
2. **$149 Professional** becomes your "most popular" anchor
3. **$299 Business** preserves high-value customers who want peace of mind
4. **Overage billing** captures value from heavy users without punishing light ones
5. **Annual discounts** improve cash flow and reduce churn

**Expected Outcomes:**
- 2-3x more trial conversions
- Better alignment between customer value and revenue
- Natural upsell path as customers grow
- Competitive positioning against all major players

---

## Next Steps

1. Validate assumptions with any existing customer data
2. Design the pricing page mockup
3. Plan Stripe metered billing implementation
4. Set up usage tracking infrastructure
5. A/B test if possible (grandfather existing customers)
