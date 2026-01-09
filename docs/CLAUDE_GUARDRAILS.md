# CLAUDE GUARDRAILS - READ BEFORE CRITICAL ACTIONS

**IMPORTANT: Claude must read this file before performing any deployments, database operations, or destructive actions.**

---

## DEPLOYMENT PLATFORM

| Component | Platform | Command |
|-----------|----------|---------|
| **Backend** | Railway | `cd /tmp/tonris/backend && railway up --detach` |
| **Frontend** | Railway | `cd /tmp/tonris/frontend && railway up --detach` |
| **Database** | Railway MySQL | Connected via Railway service |

**NOT VERCEL. NOT HEROKU. RAILWAY ONLY.**

---

## DANGEROUS OPERATIONS - STOP AND VERIFY

### Database Operations
- **NEVER** run destructive SQL (DELETE, DROP, TRUNCATE) without explicit user confirmation
- **NEVER** run `sequelize db:migrate:undo` or reset migrations in production
- **ALWAYS** check which database you're connected to before running queries
- **ALWAYS** ask: "Is this the production or development database?"

### Deployment
- **ALWAYS** verify the platform before deploying (Railway, not Vercel/Heroku)
- **ALWAYS** build and test locally before deploying
- **NEVER** deploy untested code to production

### File Operations
- **NEVER** delete files without explicit user confirmation
- **NEVER** overwrite .env files without backup

---

## VERIFICATION CHECKLIST

Before running `railway up`:
- [ ] Am I in the correct directory? (backend or frontend)
- [ ] Did the build succeed locally?
- [ ] Am I deploying to Railway (not Vercel/Heroku)?

Before running database commands:
- [ ] Is this the development or production database?
- [ ] Have I confirmed the action with the user?
- [ ] Is this a destructive operation (DELETE/DROP/TRUNCATE)?

---

## ENVIRONMENT DETAILS

| Service | Railway Project |
|---------|-----------------|
| Project | criton.ai |
| Environment | production |
| Backend Service | tonris (or similar) |
| Frontend Service | tonris-frontend (or similar) |

---

## PAST INCIDENTS - LEARN FROM THESE

1. **Production data deletion** - Ran destructive database command on production instead of development
2. **Wrong deployment platform** - Attempted to deploy to Vercel when project uses Railway

---

## WHEN IN DOUBT

1. Ask the user before proceeding
2. Check `railway status` to confirm which project/service is linked
3. Use `railway run env | grep DB` to verify database connection
4. Read this file again

---

**Last Updated:** 2025-01-08
