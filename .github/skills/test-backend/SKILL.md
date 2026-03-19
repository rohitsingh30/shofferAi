---
name: test-backend
description: Run backend tests, analyze failures, fix broken tests, and update coverage. Use this when asked to run tests, fix failing tests, or check test coverage.
---

Run the full ShofferAI backend test suite, fix any failures, and keep tests in sync with code changes.

## Instructions

### Step 1: Run Full Suite

Run `npx vitest run` from the project root. This executes all tests across:

- `packages/shared` — Error classes, logger, Zod schemas, relay protocol
- `packages/agent-core` — Conversation manager, skill loader, LLM client, system prompts
- `apps/web` — API route handlers (register, profile, credentials, tasks, agent input, payments)
- `apps/web/lib` — Credential vault, workflow engine (absorbed from packages)
- `apps/playwright` — Relay server tests

### Step 2: Analyze Failures

If any tests fail:

1. **Read the error output** — Identify the failing test file and assertion
2. **Check if source code changed** — Use `git diff` to see if the source under test was modified. If the source changed, update the test to match the new behavior.
3. **Check if it's a test bug** — Wrong mock setup, missing module mock, timing issue, etc.
4. **Fix the root cause** — Either update the test or fix the source code bug

### Step 3: Update Tests for New/Changed Code

If backend code was added or modified since the last test run:

1. **Scan for untested routes** — Check `apps/web/app/api/` for route files without corresponding `.test.ts`
2. **Scan for untested package code** — Check each package's `src/` for new `.ts` files without `.test.ts` counterparts
3. **Write missing tests** following existing patterns:
   - Mock Prisma with `vitest-mock-extended` (`mockDeep<PrismaClient>()`)
   - Mock auth with `vi.mock('@/auth', ...)`
   - Mock singletons with `vi.mock('@/lib/singletons', ...)`
   - Suppress logger with `vi.mock('@shofferai/shared', ...)` returning mock logger
   - Use `vi.useFakeTimers()` for timeout-dependent tests
   - Use real `ws.WebSocketServer` for relay tests

### Step 4: Verify All Pass

Run `npx vitest run` again from root to confirm everything is green. Report the final count.

### Mocking Cheat Sheet

**Prisma (packages):**
```ts
import { mockDeep } from 'vitest-mock-extended';
const prisma = mockDeep<PrismaClient>();
```

**Auth (apps/web routes):**
```ts
vi.mock('@/auth', () => ({ auth: vi.fn() }));
// Then: vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
// Or:   vi.mocked(auth).mockResolvedValue(null as any); // unauthenticated
```

**Logger suppression:**
```ts
vi.mock('@shofferai/shared', async () => {
  const actual = await vi.importActual<typeof import('@shofferai/shared')>('@shofferai/shared');
  return { ...actual, logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
});
```

**Hoisted mocks (for module-level instantiation):**
```ts
const mockThing = vi.hoisted(() => ({ method: vi.fn() }));
vi.mock('some-module', () => ({
  SomeClass: class { method = mockThing.method; },
}));
```
