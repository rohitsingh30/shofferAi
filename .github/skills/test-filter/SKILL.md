---
name: test-filter
description: Run the 10K message filter test suite, analyze failures, and fix the regex or fixture expectations. Use this when asked to test the message filter, run filter tests, or check filter coverage.
---

Run the ShofferAI internal message filter test suite (10,000+ vectors), analyze any failures, and fix either the regex patterns or the fixture expectations.

## Instructions

### Step 1: Run the Filter Tests

```bash
cd /Users/rohit/shofferAi && npx vitest run packages/shared/src/internal-message-filter.test.ts
```

This runs 10,000+ data-driven test vectors covering:
- **Suppress**: tool labels, observational narration, action narration, status, third-person, browser internals, self-directed, reasoning, filler prefixes, multi-sentence
- **Allow**: results, questions, confirmations, prices, errors, cart, delivery, coupons, reviews, availability, policies, specs, product cards, multi-sentence user-facing

### Step 2: If All Pass

Report the total count and confirm the filter is healthy. Example: "✅ 10,015 tests passed — filter is solid."

### Step 3: If Tests Fail — Diagnose

For each failure, determine the root cause:

1. **Filter too aggressive** (false positive) — The regex suppresses a message it shouldn't.
   - Check `packages/shared/src/internal-message-filter.ts` for the pattern that matches
   - Decide: narrow the regex pattern, OR accept the false positive (Tier 2 AI rewriter handles it in production)
   - If accepting: change the fixture expectation to `true` (suppressed)

2. **Filter too lenient** (false negative) — The regex allows an internal message through.
   - Add a new pattern to the appropriate category in `internal-message-filter.ts`
   - Keep the fixture expectation as `true` (suppressed)

3. **Fixture bug** — The test vector itself is wrong (bad message text or wrong expected value).
   - Fix the generator in `internal-message-filter.fixtures.ts`

### Step 4: Understand the Architecture

**Key files:**
- `packages/shared/src/internal-message-filter.ts` — The Tier 1 regex filter (main logic)
- `packages/shared/src/internal-message-filter.fixtures.ts` — 10K test vector generator (combinatorial templates)
- `packages/shared/src/internal-message-filter.test.ts` — Test runner using `it.each()`

**Filter function:** `shouldSuppressMessage(content)` → `true` = suppress (internal), `false` = allow (user-facing)

**Pattern categories in the filter:**
- `observational` — "I can see...", "The page shows...", "There are N results..."
- `action` — "Clicking on...", "Scrolling down...", "Navigating to..."
- `status` — "Cart updated", "Page loaded", "Login successful"
- `thirdPerson` — "The user wants...", "The agent should..."
- `browserInternals` — selector, xpath, data-testid, CDP, DOM
- `selfDirected` — "Could you provide the image URLs..." (internal data requests)
- `reasoning` — "We need to...", "Step 1 says...", "Since X, let's Y"

**Two-tier design:**
- Tier 1 (this filter): Regex, catches ~90%, free, <1ms
- Tier 2 (`message-rewriter.ts`): AI rewrite via LLM, catches the rest
- Tier 1 false positives are OK — Tier 2 rescues user-facing messages that Tier 1 over-catches

**Fixture generator:**
- Seeded PRNG (seed=42) for reproducibility
- 30+ generator functions, each produces vectors via combinatorial template expansion
- `TestVector = [message: string, expectedSuppressed: boolean, category: string]`

### Step 5: Fix and Re-run

After making changes:

```bash
npx vitest run packages/shared/src/internal-message-filter.test.ts
```

Also run the rewriter test to make sure Tier 2 is still working:

```bash
npx vitest run packages/agent-core/src/message-rewriter.test.ts
```

### Step 6: Quick Test a Specific Message

To quickly check if a message would be suppressed:

```bash
cd /Users/rohit/shofferAi && node -e "
const { shouldSuppressMessage } = require('./packages/shared/dist/internal-message-filter.js');
console.log(shouldSuppressMessage('your message here'));
"
```

Note: This uses the compiled dist. If you changed the source, rebuild first:
```bash
npx turbo build --filter=@shofferai/shared
```

### Design Rules

- **Never block legitimate user questions** — "Could you provide your mobile number?" must pass through
- **Err on suppression** — Better to suppress and let Tier 2 handle than to leak internal messages
- **Test vectors must be reproducible** — The seeded PRNG ensures same vectors every run
- **Don't over-fit regex** — Patterns should be general enough to catch variations, not just exact test strings
