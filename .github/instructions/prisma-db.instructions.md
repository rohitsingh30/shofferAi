---
applyTo: "prisma/**"
---

# Database — Prisma ORM (prisma/)

## Commands

```bash
npx prisma generate          # Regenerate client after schema changes (ALWAYS do this)
npx prisma migrate dev       # Create & apply migrations in dev
npx prisma studio            # Open DB browser UI
npx prisma migrate deploy    # Apply migrations in prod (Cloud Run)
```

## Schema

- PostgreSQL 16 (Cloud SQL in prod, local in dev)
- 10 models — see `prisma/schema.prisma`
- `DATABASE_URL` in `.env` — connection string

## Conventions

- Always run `npx prisma generate` after ANY schema change — or imports break
- Migrations via `npx prisma migrate dev` — creates migration file + applies
- Never edit migration files after they've been applied
- Use Prisma Client for all DB access — no raw SQL unless absolutely necessary
- Connection pooling handled by Prisma in production

## Docker

- `prisma generate` runs during Docker build (`RUN npx prisma generate`)
- `prisma migrate deploy` runs at container startup (not during build)
- Schema file: `COPY prisma ./prisma` in Dockerfile
