---
name: deploy
description: Deploy frontend and backend changes to GCP Cloud Run. Use this when asked to deploy, ship, push to production, or release.
---

Deploy ShofferAI to production on GCP Cloud Run. This skill handles pre-flight checks, build submission, monitoring, and post-deploy verification.

## Instructions

Follow these steps IN ORDER. Do not skip any step. If any step fails, stop and report the issue — do not proceed with a broken deploy.

### Step 1: Pre-flight Checks

Run these checks before deploying (batch into a single shell command for speed):

```bash
cd /Users/rohit/shofferAi && \
  echo "=== Git ===" && git --no-pager status --short | wc -l && \
  echo "=== Prisma ===" && npx prisma validate 2>&1 | tail -1 && \
  echo "=== GCP ===" && (gcloud auth print-access-token >/dev/null 2>&1 && echo "authenticated" || echo "NOT authenticated")
```

1. **Git status** — Check for uncommitted changes. If there are uncommitted changes, warn the user and ask if they want to commit first or deploy anyway.

2. **Prisma schema** — Run `npx prisma validate` to ensure the schema is valid. If there are pending migrations, warn the user.

3. **GCP auth** — Run `gcloud auth print-access-token` to verify the user is authenticated with GCP. If not, tell them to run `gcloud auth login`.

**NOT needed:**
- ~~Docker~~ — `gcloud builds submit` uploads source to GCP and builds remotely. Local Docker is NOT required.
- ~~TypeScript build~~ — Cloud Build runs `npx turbo build` during the Docker image build. A local build is redundant and slow. If it fails, Cloud Build will catch it and we fix it there.

Report a summary of all checks:
```
Pre-flight checks:
  ✓ Git: clean (or: X uncommitted changes)
  ✓ Prisma: valid
  ✓ GCP auth: authenticated
```

If GCP auth fails, STOP and help the user fix it. Everything else is a warning.

### Step 2: Push and Submit to Cloud Build

Push changes and start the build:
```bash
cd /Users/rohit/shofferAi && git push origin main 2>&1 | tail -3 && gcloud builds submit --config cloudbuild.yaml 2>&1
```

This will:
- Push latest commits to GitHub
- Upload source tarball to Cloud Storage (~12 MB)
- Build with **Kaniko** (automatic layer caching in Artifact Registry) on an **8-vCPU** machine
- Push image to Artifact Registry (`asia-south1-docker.pkg.dev`)
- Deploy to Cloud Run (`shofferai` service, `asia-south1`)

**The build takes ~2-3 minutes** (npm ci and prisma layers are cached between builds). Use `initial_wait: 120` (2 min) when running this command so you can monitor progress. If it exceeds the wait, you'll be notified on completion.

### Step 3: Monitor Build

Watch the build output. Common failure points:
- **npm ci fails** — dependency issues, check package-lock.json is committed
- **Prisma generate fails** — schema issue or missing prisma/ directory in Docker context
- **turbo build fails** — TypeScript errors (most common failure — read the error carefully)
- **Kaniko cache miss** — first build after Dockerfile changes rebuilds all layers; subsequent builds use cache
- **Deploy fails** — Cloud Run quota, env vars missing

If the build fails, analyze the error and suggest a fix.

### Step 4: Post-deploy Verification

After successful deploy:

1. **Get the service URL** — Run `gcloud run services describe shofferai --region asia-south1 --format='value(status.url)'` to get the live URL.

2. **Health check** — Run `curl -s -o /dev/null -w '%{http_code}' <SERVICE_URL>` to verify the app responds with 200.

3. **DB health check** — Run `curl -s <SERVICE_URL>/api/health/db` to verify database connectivity. If it returns `{ "ok": false }`, Cloud SQL connection pool may be exhausted from the deploy. Auto-recover with:
   ```bash
   gcloud sql instances restart shofferai-db --quiet
   sleep 15
   curl -s <SERVICE_URL>/api/health/db  # should return { "ok": true }
   ```

4. **Report deployment summary**:
```
Deploy complete!
  Service: shofferai
  Region:  asia-south1
  URL:     <SERVICE_URL>
  HTTP:    ✓ 200
  DB:      ✓ OK (or: ✗ FIXED — Cloud SQL restarted)
```

### Step 5: Verify with Playwright (Optional)

If the user wants full verification, use Playwright MCP to:
1. Navigate to the live production URL
2. Take a snapshot of the landing page
3. Verify key pages load correctly
4. Report any issues

## Rollback

If something goes wrong after deploy, the user can rollback:
```bash
# List recent revisions
gcloud run revisions list --service shofferai --region asia-south1

# Route traffic to previous revision
gcloud run services update-traffic shofferai --region asia-south1 --to-revisions=<PREVIOUS_REVISION>=100
```

Include rollback instructions if the post-deploy health check fails.

## Environment Notes

- Cloud Run env vars are set via GCP Console or `gcloud run services update`
- `RELAY_MODE=cloud` is set automatically by cloudbuild.yaml
- Database (Cloud SQL) connection string must be set in Cloud Run env vars
- Razorpay, Auth, and API keys must be configured in Cloud Run secrets/env vars
- **Project ID**: `docx-healthcare` (GCP project)
- **Artifact Registry**: `asia-south1-docker.pkg.dev/docx-healthcare/shofferai`
- **Prod URL**: `https://shofferai-27188185100.asia-south1.run.app`
