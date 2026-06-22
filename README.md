# ShofferAI

> Your AI that actually does things.

ShofferAI is a personal AI assistant that **executes real-world tasks** on your behalf using intelligent browser automation. Instead of just telling you what to do, it books, orders, compares, and fills forms for you — driving a real, signed-in browser to get things done.

## Architecture

The system spans two environments connected by a WebSocket relay:

- **Cloud (GCP Cloud Run):** Next.js 15 chat UI, API routes, the `AgentExecutor` LLM loop (skill matching + lessons), Cloud SQL (PostgreSQL), and Razorpay payments.
- **Relay layer:** Per-task tab isolation over an encrypted Cloudflare WebSocket tunnel.
- **Laptop:** A persistent, signed-in Chrome pool exposing browser ops as typed atomic tools over REST and MCP (Streamable HTTP).

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design and [`docs/PITCH.md`](docs/PITCH.md) for the product vision.

## Monorepo layout

This is an npm + Turborepo monorepo (`apps/*`, `packages/*`):

| Path | Description |
| --- | --- |
| `apps/web` | Next.js 15 chat UI, auth, payments, and API routes |
| `apps/mobile` | Mobile client |
| `packages/agent-core` | Agent executor, skills, and orchestration logic |
| `packages/shared` | Shared types and utilities |
| `prisma/` | Database schema and migrations |
| `docs/` | Architecture, contracts, deployment, and design docs |

## Prerequisites

- Node.js >= 20
- npm 10

## Getting started

```bash
npm install
npm run db:generate   # generate Prisma client
npm run dev           # start all apps via Turborepo
```

## Common scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run all apps in development |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint the monorepo |
| `npm run test` | Run the Vitest suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:migrate` | Apply Prisma migrations (dev) |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run tunnel` | Expose the local relay via Cloudflare Tunnel |
| `npm run deploy` | Submit a Cloud Build deploy |

## Documentation

Browse the [`docs/`](docs/) directory for detailed references, including the browser service contract, deployment guide, latency notes, and message rewrite layer.
