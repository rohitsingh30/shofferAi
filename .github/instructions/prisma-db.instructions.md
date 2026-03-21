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

- PostgreSQL 15 on Cloud SQL (`shofferai-db`, db-f1-micro, asia-south1)
- PostgreSQL 16 locally via Docker Compose
- 13 models — see `prisma/schema.prisma`
- `DATABASE_URL` in `.env` — connection string
- Cloud Run uses Unix socket: `?host=/cloudsql/docx-healthcare:asia-south1:shofferai-db`

## Applying Migrations to Production

```bash
# Option 1: Temporary authorized network (preferred)
MY_IP=$(curl -4 -s ifconfig.me)
gcloud sql instances patch shofferai-db --authorized-networks="${MY_IP}/32" --quiet
DATABASE_URL="postgresql://postgres:<password>@34.180.24.248/shofferai" npx prisma migrate deploy
gcloud sql instances patch shofferai-db --clear-authorized-networks --quiet

# Option 2: Via cloud-sql-proxy
cloud-sql-proxy docx-healthcare:asia-south1:shofferai-db --port=5433 &
DATABASE_URL="postgresql://postgres:<password>@127.0.0.1:5433/shofferai" npx prisma migrate deploy
```

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
