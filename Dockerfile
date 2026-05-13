# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/agent-core/package.json packages/agent-core/
COPY prisma/ prisma/

RUN npm ci --ignore-scripts

# Copy source
COPY apps/web/ apps/web/
COPY packages/ packages/

# Generate Prisma client
RUN npx prisma generate

# Build-time public env vars (Next.js inlines NEXT_PUBLIC_* during build)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}

# Build all packages and Next.js
RUN npx turbo build --filter=@shofferai/web

# Stage 2: Runtime (slim — no browser, Playwright runs on operator laptop via relay)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV RELAY_MODE=cloud
ENV PORT=3000

# Copy standalone Next.js output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy public dir if it exists
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy skill definitions (SKILL.md files read at runtime by loadSkills)
COPY --from=builder /app/packages/agent-core/src/skills ./skills
ENV SKILLS_DIR=/app/skills

# Copy custom server (replaces default server.js for WebSocket relay support)
COPY --from=builder /app/apps/web/custom-server.js ./apps/web/server.js

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
