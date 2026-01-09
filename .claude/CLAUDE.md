# TONRIS / CRITON.AI - Project Context

## CRITICAL: Read Before Any Action

**Deployment Platform: RAILWAY (NOT Vercel, NOT Heroku)**

| Component | Platform | Deploy Command |
|-----------|----------|----------------|
| Backend | Railway | `cd /tmp/tonris/backend && railway up --detach` |
| Frontend | Railway | `cd /tmp/tonris/frontend && railway up --detach` |
| Database | Railway MySQL | DO NOT run destructive queries without confirmation |

---

## Stop & Verify Before:

1. **Any deployment** → Confirm it's Railway, not another platform
2. **Any database operation** → Confirm prod vs dev, confirm destructive actions with user
3. **Any DELETE/DROP/TRUNCATE** → ALWAYS ask user first
4. **Any file deletion** → Confirm with user

---

## Project Structure

```
/tmp/tonris/
├── backend/          # Node.js/Express API (Railway)
├── frontend/         # Vue 3 SPA (Railway)
├── docs/             # Documentation
│   └── CLAUDE_GUARDRAILS.md  # Detailed safety checklist
└── .claude/          # This file
```

---

## Key Services & APIs

- **Stripe** - Billing/subscriptions
- **Twilio** - Phone/SMS
- **ElevenLabs** - AI Voice agents (API key in Railway env vars)
- **MySQL** - Database on Railway

---

## Past Mistakes (Don't Repeat)

1. Deleted production data by running destructive SQL on wrong database
2. Tried deploying to Vercel when project uses Railway

---

## When Unsure

```bash
# Check which Railway project/service is linked
railway status

# Check database connection
railway run env | grep DB
```

**Ask the user if uncertain about any critical operation.**
