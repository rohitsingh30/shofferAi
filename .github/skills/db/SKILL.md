---
name: db
description: Database operations — migrate, seed, studio, reset, check schema. Use this when asked about database migrations, Prisma operations, or schema changes.
---

Run Prisma database operations for ShofferAI.

## Instructions

Ask the user what they need, or infer from context:

### Common Operations

**Check schema status:**
```bash
npx prisma migrate status
```

**Run pending migrations:**
```bash
npx prisma migrate dev
```

**Generate Prisma client** (after schema changes):
```bash
npx prisma generate
```

**Open Prisma Studio** (visual DB browser):
```bash
npx prisma studio
```

**Create a new migration** (after editing schema.prisma):
```bash
npx prisma migrate dev --name <descriptive-name>
```

**Reset database** (destructive — drops all data):
Only do this if the user explicitly asks. Confirm before running.
```bash
npx prisma migrate reset
```

### Schema Location
`prisma/schema.prisma`

### After Any Schema Change
1. Run `npx prisma migrate dev --name <name>`
2. Run `npx prisma generate`
3. Run `npx turbo build` to verify types
